import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class PublicDirectoryQueryDto {
  @ApiPropertyOptional({
    description: "Name, designation, office or district text search",
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description:
      "Restrict results to matching office/address/district locations",
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @ApiPropertyOptional() @IsOptional() @IsMongoId() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() districtId?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() blockId?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() officeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() designationId?: string;

  @ApiPropertyOptional({ enum: ["active", "inactive"] })
  @IsOptional()
  @IsIn(["active", "inactive"])
  status?: "active" | "inactive";

  @ApiPropertyOptional({
    description: "Filter names beginning with a letter A-Z",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1)
  letter?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @ApiPropertyOptional({ enum: ["name", "createdAt"], default: "name" })
  @IsOptional()
  @IsIn(["name", "createdAt"])
  sortBy: "name" | "createdAt" = "name";

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "asc" })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = "asc";
}
