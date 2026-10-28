import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Model, Types } from "mongoose";
import { SCHEMA_MAP, isObjectId } from "../schemas";
import { PublicDirectoryQueryDto } from "./dto/public-directory-query.dto";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

@Injectable()
export class PublicDirectoryService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  private model(resource: string): Model<any> {
    const spec = SCHEMA_MAP[resource];
    if (!spec) throw new NotFoundException("Unknown directory resource");
    for (const modelSpec of Object.values(SCHEMA_MAP)) {
      if (!this.connection.models[modelSpec.modelName]) {
        this.connection.model(
          modelSpec.modelName,
          modelSpec.schema,
          modelSpec.collectionName,
        );
      }
    }
    return this.connection.models[spec.modelName];
  }

  private objectId(
    value: string | undefined,
    field: string,
  ): Types.ObjectId | undefined {
    if (!value) return undefined;
    if (!isObjectId(value))
      throw new BadRequestException(`${field} must be a valid ObjectId`);
    return new Types.ObjectId(value);
  }

  private toPublicOfficer(record: any) {
    const office = record.officeId || {};
    const department = office.departmentId || {};
    const district = office.districtId || {};
    const designation = record.designationId || {};
    // Deliberately allowlist directory fields. Do not return personal contact details,
    // full birth dates, employee codes, database metadata, or authentication fields.
    return {
      id: String(record._id),
      _id: String(record._id),
      name: record.name,
      designation: {
        id: designation._id ? String(designation._id) : undefined,
        name: designation.name || "",
      },
      office: {
        id: office._id ? String(office._id) : undefined,
        name: office.name || "",
      },
      department: {
        id: department._id ? String(department._id) : undefined,
        name: department.name || "",
      },
      district: {
        id: district._id ? String(district._id) : undefined,
        name: district.name || "",
      },
      isActive: record.isActive !== false,
    };
  }

  private employeeQuery() {
    return this.model("employees").find({ isPublic: true });
  }

  private populateOfficer(query: any) {
    return query
      .populate({
        path: "officeId",
        select: "name departmentId districtId isActive",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "districtId", select: "name" },
        ],
      })
      .populate("designationId", "name");
  }

  async listEmployees(query: PublicDirectoryQueryDto) {
    const employeeFilter: any = { isPublic: true };
    const officeFilter: any = {};
    const officeFields: Array<[keyof PublicDirectoryQueryDto, string]> = [
      ["departmentId", "departmentId"],
      ["districtId", "districtId"],
      ["blockId", "blockId"],
      ["officeId", "_id"],
    ];
    for (const [queryKey, field] of officeFields) {
      const value = this.objectId(
        query[queryKey] as string | undefined,
        String(queryKey),
      );
      if (value) officeFilter[field] = value;
    }

    const searchText = query.search?.trim();
    const locationText = query.location?.trim()
      ? escapeRegex(query.location.trim())
      : undefined;
    if (locationText) {
      const districtIds = await this.model("districts")
        .find({ name: { $regex: locationText, $options: "i" }, isActive: true })
        .distinct("_id");
      officeFilter.$or = [
        { name: { $regex: locationText, $options: "i" } },
        { address: { $regex: locationText, $options: "i" } },
        ...(districtIds.length ? [{ districtId: { $in: districtIds } }] : []),
      ];
    }

    const offices = await this.model("offices")
      .find({ ...officeFilter, isActive: true })
      .select("_id")
      .lean();
    employeeFilter.officeId = { $in: offices.map((office: any) => office._id) };

    const conditions: any[] = [];
    if (query.designationId) {
      conditions.push({
        designationId: this.objectId(query.designationId, "designationId"),
      });
    }
    if (searchText) {
      const regex = { $regex: escapeRegex(searchText), $options: "i" };
      const matchingDesignations = await this.model("designations")
        .find({ name: regex, isActive: true })
        .distinct("_id");
      const matchingDistricts = await this.model("districts")
        .find({ name: regex, isActive: true })
        .distinct("_id");
      const matchingOffices = await this.model("offices")
        .find({
          isActive: true,
          $or: [
            { name: regex },
            { address: regex },
            ...(matchingDistricts.length
              ? [{ districtId: { $in: matchingDistricts } }]
              : []),
          ],
        })
        .distinct("_id");
      conditions.push({
        $or: [
          { name: regex },
          ...(matchingDesignations.length
            ? [{ designationId: { $in: matchingDesignations } }]
            : []),
          ...(matchingOffices.length
            ? [{ officeId: { $in: matchingOffices } }]
            : []),
        ],
      });
    }
    if (query.letter) {
      const letter = query.letter.trim();
      if (!/^[a-z]$/i.test(letter))
        throw new BadRequestException("letter must be a single A-Z character");
      conditions.push({
        name: { $regex: `^${escapeRegex(letter)}`, $options: "i" },
      });
    }
    if (query.status) employeeFilter.isActive = query.status === "active";
    if (conditions.length) employeeFilter.$and = conditions;

    const page = query.page || 1;
    const limit = query.limit || 25;
    const direction = query.order === "desc" ? -1 : 1;
    const sortField = query.sortBy === "createdAt" ? "createdAt" : "name";
    const finder = this.populateOfficer(
      this.employeeQuery().find(employeeFilter),
    )
      .sort({ [sortField]: direction, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const [records, total] = await Promise.all([
      finder,
      this.model("employees").countDocuments(employeeFilter),
    ]);
    return {
      data: records.map((record: any) => this.toPublicOfficer(record)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEmployee(id: string) {
    if (!isObjectId(id)) throw new BadRequestException("Invalid officer ID");
    const record = await this.populateOfficer(
      this.employeeQuery().findOne({ _id: new Types.ObjectId(id) }),
    ).lean();
    if (!record || !record.officeId || record.officeId.isActive === false)
      throw new NotFoundException("Public officer not found");
    return this.toPublicOfficer(record);
  }

  async listDepartments() {
    const employeeOfficeIds = await this.model("employees").distinct(
      "officeId",
      { isPublic: true },
    );
    const departmentIds = await this.model("offices").distinct("departmentId", {
      _id: { $in: employeeOfficeIds },
      isActive: true,
    });
    const data = await this.model("departments")
      .find({ _id: { $in: departmentIds }, isActive: true })
      .select("name code")
      .sort({ name: 1 })
      .lean();
    return {
      data: data.map((item: any) => ({
        id: String(item._id),
        name: item.name,
        code: item.code,
      })),
    };
  }

  async listDesignations() {
    const offices = await this.model("offices").distinct("_id", {
      isActive: true,
    });
    const ids = await this.model("employees").distinct("designationId", {
      isPublic: true,
      officeId: { $in: offices },
    });
    const data = await this.model("designations")
      .find({ _id: { $in: ids }, isActive: true })
      .select("name code")
      .sort({ name: 1 })
      .lean();
    return {
      data: data.map((item: any) => ({
        id: String(item._id),
        name: item.name,
        code: item.code,
      })),
    };
  }

  async listDistricts() {
    const officeIds = await this.model("employees").distinct("officeId", {
      isPublic: true,
    });
    const districtIds = await this.model("offices").distinct("districtId", {
      _id: { $in: officeIds },
      isActive: true,
    });
    const data = await this.model("districts")
      .find({ _id: { $in: districtIds }, isActive: true })
      .select("name code")
      .sort({ name: 1 })
      .lean();
    return {
      data: data.map((item: any) => ({
        id: String(item._id),
        name: item.name,
        code: item.code,
      })),
    };
  }

  async summary() {
    const filter = { isPublic: true };
    const activeOfficeIds = await this.model("offices").distinct("_id", {
      isActive: true,
    });
    const publicFilter = { ...filter, officeId: { $in: activeOfficeIds } };
    const [totalEmployees, totalActiveEmployees, officeIds] = await Promise.all(
      [
        this.model("employees").countDocuments(publicFilter),
        this.model("employees").countDocuments({
          ...publicFilter,
          isActive: true,
        }),
        this.model("employees").distinct("officeId", publicFilter),
      ],
    );
    const [totalDepartments, totalDistricts] = await Promise.all([
      this.model("offices").distinct("departmentId", {
        _id: { $in: officeIds },
        isActive: true,
      }),
      this.model("offices").distinct("districtId", {
        _id: { $in: officeIds },
        isActive: true,
      }),
    ]);
    return {
      totalEmployees,
      totalActiveEmployees,
      totalDepartments: totalDepartments.length,
      totalOffices: officeIds.length,
      totalDistricts: totalDistricts.length,
    };
  }
}
