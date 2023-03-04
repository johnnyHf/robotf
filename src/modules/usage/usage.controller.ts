import {Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import { UsageService } from './usage.service';
import { CreateUsageDto } from './dto/create-usage.dto';
import { UpdateUsageDto } from './dto/update-usage.dto';

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Post("/add")
  create(@Body() createUsageDto: CreateUsageDto) {
    return this.usageService.create(createUsageDto);
  }

  @Get("/all")
  findAll() {
    return this.usageService.findAll();
  }

  @Get("/list")
  list(@Query() param) {
    return this.usageService.findBy(param);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usageService.findOne("id", +id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsageDto: UpdateUsageDto) {
    return this.usageService.update(+id, updateUsageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usageService.remove(+id);
  }
}
