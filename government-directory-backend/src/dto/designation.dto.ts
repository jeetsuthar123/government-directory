import { IsBoolean, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
export class DesignationDto {
  @IsString() @MinLength(2) @MaxLength(150) name!: string;
  @IsOptional() @IsString() @MaxLength(30) code?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) level?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}