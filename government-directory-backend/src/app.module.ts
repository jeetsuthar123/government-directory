import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DepartmentsModule } from './departments/departments.module';
import { DistrictsModule } from './districts/districts.module';
import { BlocksModule } from './blocks/blocks.module';
import { OfficesModule } from './offices/offices.module';
import { DesignationsModule } from './designations/designations.module';
import { EmployeesModule } from './employees/employees.module';
import { AdminUsersModule } from './admin-users/adminusers.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/government_directory_dev'),
    AuthModule, DashboardModule, DepartmentsModule, DistrictsModule, BlocksModule,
    OfficesModule, DesignationsModule, EmployeesModule, AdminUsersModule
  ]
})
export class AppModule {}
