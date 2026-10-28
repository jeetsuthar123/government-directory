import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DepartmentsModule } from "./departments/departments.module";
import { DistrictsModule } from "./districts/districts.module";
import { BlocksModule } from "./blocks/blocks.module";
import { OfficesModule } from "./offices/offices.module";
import { DesignationsModule } from "./designations/designations.module";
import { EmployeesModule } from "./employees/employees.module";
import { AdminUsersModule } from "./admin-users/adminusers.module";
import { PublicDirectoryModule } from "./public-directory/public-directory.module";

const mongoUri = process.env.MONGODB_URI;
if (process.env.NODE_ENV === "production" && !mongoUri) {
  throw new Error("MONGODB_URI must be configured in production.");
}

@Module({
  imports: [
    MongooseModule.forRoot(
      mongoUri || "mongodb://127.0.0.1:27017/government_directory_dev",
    ),
    AuthModule,
    DashboardModule,
    DepartmentsModule,
    DistrictsModule,
    BlocksModule,
    OfficesModule,
    DesignationsModule,
    EmployeesModule,
    AdminUsersModule,
    PublicDirectoryModule,
  ],
})
export class AppModule {}
