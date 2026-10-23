import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SCHEMA_MAP, isObjectId } from '../schemas';

@Injectable()
export class ResourceService {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  private registerModels() {
    for (const spec of Object.values(SCHEMA_MAP)) {
      if (!this.connection.models[spec.modelName]) this.connection.model(spec.modelName, spec.schema, spec.collectionName);
    }
  }
  model(resource: string): Model<any> {
    const spec = SCHEMA_MAP[resource];
    if (!spec) throw new NotFoundException('Unknown resource');
    this.registerModels();
    return this.connection.models[spec.modelName];
  }
  private oid(id: string) {
    if (!isObjectId(id)) throw new BadRequestException('Invalid record ID');
    return new Types.ObjectId(id);
  }
  private isSuper(user: any) { return user?.role === 'super_admin'; }
  private deptIds(user: any) { return (user?.departmentIds || []).filter(isObjectId).map((id: string) => new Types.ObjectId(id)); }
  private assertCanWrite(resource: string, user: any) {
    if (this.isSuper(user)) return;
    if (['departments','districts','blocks','designations','admin-users'].includes(resource)) {
      throw new ForbiddenException('Only super administrators can modify shared reference data or administrator accounts');
    }
  }
  private async assertDepartmentAccess(resource: string, record: any, user: any) {
    if (this.isSuper(user) || user?.role !== 'department_admin') return;
    let departmentId: any;
    if (resource === 'offices') departmentId = record.departmentId;
    else if (resource === 'employees') {
      const office: any = await this.model('offices').findById(record.officeId).lean();
      departmentId = office?.departmentId;
    } else if (resource === 'admin-users') throw new ForbiddenException('Only super administrators can manage admin users');
    else return;
    if (!departmentId || !this.deptIds(user).some((id: Types.ObjectId) => id.equals(departmentId))) throw new ForbiddenException('Outside your assigned department');
  }
  private async scopedFilter(resource: string, user: any) {
    if (this.isSuper(user) || user?.role !== 'department_admin') return {};
    if (resource === 'offices') return { departmentId: { $in: this.deptIds(user) } };
    if (resource === 'employees') {
      const offices = await this.model('offices').find({ departmentId: { $in: this.deptIds(user) } }).select('_id').lean();
      return { officeId: { $in: offices.map((o: any) => o._id) } };
    }
    if (resource === 'admin-users') throw new ForbiddenException('Only super administrators can manage admin users');
    return {};
  }
  async list(resource: string, query: any, user: any) {
    const model = this.model(resource), filter: any = await this.scopedFilter(resource, user);
    const page = Math.max(1, Number(query.page) || 1), limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const search = String(query.search || '').trim();
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const fields: Record<string, string[]> = {
        departments:['name','code','shortName'], districts:['name','code','state'], blocks:['name','code'],
        offices:['name','code','address','email'], designations:['name','code'],
        employees:['name','employeeCode','email','mobile'], 'admin-users':['name','email']
      };
      filter.$or = (fields[resource] || ['name']).map(k => ({ [k]: { $regex: safe, $options: 'i' } }));
    }
    for (const key of ['departmentId','districtId','blockId','officeId','designationId']) {
      if (query[key]) {
        if (!isObjectId(query[key])) throw new BadRequestException(`${key} must be a valid ObjectId`);
        const value = new Types.ObjectId(query[key]);
        if (resource === 'employees' && ['departmentId','districtId','blockId'].includes(key)) {
          const officeFilter: any = { [key]: value };
          const matching = await this.model('offices').find(officeFilter).select('_id').lean();
          filter.officeId = { $in: matching.map((o: any) => o._id) };
        } else filter[key] = value;
      }
    }
    for (const key of ['isActive','isPublic']) if (query[key] !== undefined && query[key] !== '') filter[key] = query[key] === 'true';
    const sortBy = ['name','createdAt','code','dateOfBirth'].includes(query.sortBy) ? query.sortBy : 'createdAt';
    let finder: any = model.find(filter).sort({ [sortBy]: query.order === 'asc' ? 1 : -1 }).skip((page-1)*limit).limit(limit);
    if (resource === 'offices') finder = finder.populate('departmentId', 'name code').populate('districtId', 'name code').populate('blockId', 'name code');
    if (resource === 'blocks') finder = finder.populate('districtId', 'name code');
    if (resource === 'employees') finder = finder.populate({ path: 'officeId', select: 'name code departmentId districtId blockId', populate: [{ path: 'departmentId', select: 'name code' }, { path: 'districtId', select: 'name code' }, { path: 'blockId', select: 'name code' }] }).populate('designationId', 'name code level');
    const [data, total] = await Promise.all([finder.lean(), model.countDocuments(filter)]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async get(resource: string, id: string, user: any) {
    const record = await this.model(resource).findById(this.oid(id)).lean();
    if (!record) throw new NotFoundException('Record not found');
    await this.assertDepartmentAccess(resource, record, user);
    return record;
  }
  private async validateReferences(resource: string, doc: any, existing?: any) {
    const merged = { ...(existing || {}), ...doc };
    const get = async (key: string, target: string, required = false) => {
      const value = merged[key];
      if (!value) { if (required) throw new BadRequestException(`${key} is required`); return null; }
      if (!(value instanceof Types.ObjectId) && !isObjectId(String(value))) throw new BadRequestException(`${key} must be a valid ObjectId`);
      const record: any = await this.model(target).findById(value).lean();
      if (!record) throw new BadRequestException(`Referenced ${target} record does not exist`);
      return record;
    };
    if (resource === 'blocks') await get('districtId','districts',true);
    if (resource === 'offices') {
      await get('departmentId','departments',true); await get('districtId','districts',true);
      if (merged.blockId) { const block: any = await get('blockId','blocks'); if (String(block.districtId) !== String(merged.districtId)) throw new BadRequestException('Selected block must belong to selected district'); }
    }
    if (resource === 'employees') {
      await get('officeId','offices',true); await get('designationId','designations',true);
      if (merged.dateOfBirth && (Number.isNaN(new Date(merged.dateOfBirth).getTime()) || new Date(merged.dateOfBirth) > new Date())) throw new BadRequestException('dateOfBirth must be a valid past date');
    }
  }
  async create(resource: string, body: any, user: any) {
    const model = this.model(resource); this.assertCanWrite(resource, user);
    const doc: any = { ...body }; delete doc._id; delete doc.createdAt; delete doc.updatedAt; delete doc.passwordHash;
    if (resource === 'admin-users') {
      if (!doc.password || String(doc.password).length < 8) throw new BadRequestException('Initial password must be at least 8 characters');
      doc.passwordHash = await bcrypt.hash(doc.password, 10); delete doc.password; doc.email = String(doc.email || '').toLowerCase();
    }
    if (resource === 'employees' && doc.dateOfBirth) doc.dateOfBirth = new Date(doc.dateOfBirth);
    await this.validateReferences(resource, doc);
    if (resource === 'offices' && user?.role === 'department_admin' && !this.deptIds(user).some((id: Types.ObjectId) => id.equals(doc.departmentId))) throw new ForbiddenException('Outside your assigned department');
    if (resource === 'employees') { const office: any = await this.model('offices').findById(doc.officeId).lean(); await this.assertDepartmentAccess('offices', office, user); }
    try { return await model.create(doc); } catch (e: any) { if (e?.code === 11000) throw new ConflictException('A record with this unique value already exists'); throw e; }
  }
  async update(resource: string, id: string, body: any, user: any) {
    this.assertCanWrite(resource, user);
    const model = this.model(resource), _id = this.oid(id), existing: any = await model.findById(_id).lean();
    if (!existing) throw new NotFoundException('Record not found');
    await this.assertDepartmentAccess(resource, existing, user);
    const doc: any = { ...body }; delete doc._id; delete doc.createdAt; delete doc.updatedAt; delete doc.passwordHash;
    if (resource === 'admin-users') { if (doc.password) { doc.passwordHash = await bcrypt.hash(doc.password, 10); delete doc.password; } if (doc.email) doc.email = String(doc.email).toLowerCase(); }
    if (resource === 'employees' && doc.dateOfBirth) doc.dateOfBirth = new Date(doc.dateOfBirth);
    await this.validateReferences(resource, doc, existing);
    if (resource === 'offices' && user?.role === 'department_admin') {
      const departmentId = doc.departmentId || existing.departmentId;
      if (!this.deptIds(user).some((x: Types.ObjectId) => x.equals(departmentId))) throw new ForbiddenException('Outside your assigned department');
    }
    if (resource === 'employees') { const office: any = await this.model('offices').findById(doc.officeId || existing.officeId).lean(); await this.assertDepartmentAccess('offices', office, user); }
    try { return await model.findByIdAndUpdate(_id, { $set: doc }, { new: true, runValidators: true }).lean(); } catch (e: any) { if (e?.code === 11000) throw new ConflictException('A record with this unique value already exists'); throw e; }
  }
  async remove(resource: string, id: string, user: any) {
    this.assertCanWrite(resource, user);
    const model = this.model(resource), _id = this.oid(id), existing: any = await model.findById(_id).lean();
    if (!existing) throw new NotFoundException('Record not found');
    await this.assertDepartmentAccess(resource, existing, user);
    const relations: Record<string, [string,string][]> = {
      departments:[['offices','departmentId']], districts:[['offices','districtId'],['blocks','districtId']],
      blocks:[['offices','blockId']], offices:[['employees','officeId']], designations:[['employees','designationId']]
    };
    for (const [related, field] of relations[resource] || []) if (await this.model(related).exists({ [field]: _id })) throw new ConflictException(`Cannot delete this record because it is referenced by ${related}; deactivate it instead`);
    await model.deleteOne({ _id }); return { deleted: true, id };
  }
}
