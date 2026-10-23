import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class DepartmentDto {
  @IsString() @MinLength(2) @MaxLength(150) name!: string;
  @IsString() @MinLength(2) @MaxLength(30) code!: string;
  @IsOptional() @IsString() @MaxLength(80) shortName?: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}