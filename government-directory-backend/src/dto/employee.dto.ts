import { IsBoolean, IsDateString, IsEmail, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class EmployeeDto {
  @IsMongoId() officeId!: string;
  @IsMongoId() designationId!: string;
  @IsString() @MinLength(2) @MaxLength(150) name!: string;
  @IsOptional() @IsString() @MaxLength(40) employeeCode?: string;
  @IsOptional() @IsString() @MaxLength(30) mobile?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsBoolean() isPublic?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}