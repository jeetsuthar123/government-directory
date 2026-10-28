import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PublicDirectoryQueryDto } from "./dto/public-directory-query.dto";
import { PublicDirectoryService } from "./public-directory.service";

@ApiTags("Public directory")
@Controller("public/directory")
export class PublicDirectoryController {
  constructor(private readonly service: PublicDirectoryService) {}

  @Get("employees")
  @ApiOperation({
    summary: "Search published directory officers (anonymous, read-only)",
  })
  listEmployees(@Query() query: PublicDirectoryQueryDto) {
    return this.service.listEmployees(query);
  }

  @Get("employees/:id")
  @ApiOperation({ summary: "Get one published officer (anonymous, read-only)" })
  getEmployee(@Param("id") id: string) {
    return this.service.getEmployee(id);
  }

  @Get("departments")
  @ApiOperation({
    summary: "List departments represented by published officers",
  })
  departments() {
    return this.service.listDepartments();
  }

  @Get("designations")
  @ApiOperation({
    summary: "List designations represented by published officers",
  })
  designations() {
    return this.service.listDesignations();
  }

  @Get("districts")
  @ApiOperation({ summary: "List districts represented by published officers" })
  districts() {
    return this.service.listDistricts();
  }

  @Get("summary")
  @ApiOperation({ summary: "Get aggregate counts for the public directory" })
  summary() {
    return this.service.summary();
  }
}
