import 'dotenv/config';
import { connect, connection, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SCHEMA_MAP } from './schemas';

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed when NODE_ENV=production');
  await connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/government_directory_dev');
  const model = (key: string) => {
    const spec = SCHEMA_MAP[key];
    return connection.models[spec.modelName] || connection.model(spec.modelName, spec.schema, spec.collectionName);
  };
  const upsert = async (key: string, field: string, value: string, data: any): Promise<any> => {
    const m = model(key);
    await m.updateOne({ [field]: value }, { $set: data, $setOnInsert: { createdAt: new Date() } }, { upsert: true, runValidators: true });
    return m.findOne({ [field]: value }).lean();
  };
  try {
    const departments = [];
    for (const [name, code, shortName] of [['Department of Education','EDU','Education'],['Department of Health','HLT','Health'],['Department of Public Works','PWD','Public Works']]) departments.push(await upsert('departments','code',code,{name,code,shortName,isActive:true}));
    const districts = [];
    for (const [name,code] of [['Jodhpur','JDH'],['Jaipur','JPR'],['Udaipur','UDP']]) districts.push(await upsert('districts','code',code,{name,code,state:'Rajasthan',isActive:true}));
    const blocks = [];
    for (let i=0;i<districts.length;i++) for (let j=1;j<=2;j++) blocks.push(await upsert('blocks','code',`${['JDH','JPR','UDP'][i]}-B${j}`,{name:`Block ${j} - ${districts[i]!.name}`,code:`${['JDH','JPR','UDP'][i]}-B${j}`,districtId:districts[i]!._id,isActive:true}));
    const designations = [];
    const designationRows: [string, string, number][] = [['Director','DIR',1],['Deputy Director','DDIR',2],['District Officer','DO',3],['Block Officer','BO',4],['Office Superintendent','OS',5],['Junior Officer','JO',6]];
    for (const [name,code,level] of designationRows) designations.push(await upsert('designations','code',code,{name,code,level,isActive:true}));
    const offices = [];
    for (let i=0;i<6;i++) {
      const dept=departments[i%3]!, district=districts[i%3]!, block=blocks[i]!;
      offices.push(await upsert('offices','code',`OFF-${String(i+1).padStart(3,'0')}`,{
        name:`${dept.shortName} Office ${i+1}`,code:`OFF-${String(i+1).padStart(3,'0')}`,
        departmentId:dept._id,districtId:district._id,blockId:block._id,
        address:`${100+i} Sample Road, ${district.name}`,phone:`0291${String(100000+i).padStart(6,'0')}`,
        email:`office${i+1}@directory.local`,isActive:i!==5
      }));
    }
    const names=['Aarav Sharma','Diya Singh','Kabir Mehta','Anaya Joshi','Vivaan Rathore','Aadhya Jain','Arjun Verma','Myra Khan','Reyansh Patel','Saanvi Gupta','Ishaan Soni','Pari Yadav','Advik Das','Kiara Bansal','Rudra Chauhan','Navya Goyal','Krish Purohit','Ira Mishra'];
    for (let i=0;i<names.length;i++) {
      const employeeCode=`EMP-${String(i+1).padStart(4,'0')}`;
      await upsert('employees','employeeCode',employeeCode,{
        name:names[i],employeeCode,officeId:offices[i%offices.length]!._id,
        designationId:designations[i%designations.length]!._id,
        mobile:`90000${String(10000+i).slice(-5)}`,email:`employee${i+1}@directory.local`,
        dateOfBirth:new Date(1975+(i%20),i%12,1+(i%27)),isPublic:i%4!==0,isActive:i!==17
      });
    }
    const hash=await bcrypt.hash('Admin@12345',10);
    const admins=connection.collection('adminUsers');
    await admins.updateOne({email:'admin@directory.local'},{$set:{name:'Local Super Administrator',email:'admin@directory.local',passwordHash:hash,role:'super_admin',departmentIds:departments.map(d=>d!._id),isActive:true,updatedAt:new Date()},$setOnInsert:{createdAt:new Date()}},{upsert:true});
    await admins.updateOne({email:'education.admin@directory.local'},{$set:{name:'Education Department Administrator',email:'education.admin@directory.local',passwordHash:hash,role:'department_admin',departmentIds:[departments[0]!._id],isActive:true,updatedAt:new Date()},$setOnInsert:{createdAt:new Date()}},{upsert:true});
    for (const key of ['departments','districts','blocks','offices','designations','employees']) console.log(`${key}: ${await model(key).countDocuments()} records`);
    console.log('Seed complete. Local accounts: admin@directory.local / Admin@12345; education.admin@directory.local / Admin@12345');
  } finally { await connection.close(); }
}
main().catch(e=>{ console.error('Seed failed:',e.message); process.exit(1); });
