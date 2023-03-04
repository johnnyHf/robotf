import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors} from '@nestjs/common';
import { FavService } from './fav.service';
import { CreateFavDto } from './dto/create-fav.dto';
import { UpdateFavDto } from './dto/update-fav.dto';
import {ok} from "../../common/utils/result";

@Controller('fav')
export class FavController {
  constructor(private readonly favService: FavService) {}

  @Post()
  async create(@Body() createFavDto: CreateFavDto) {
    return ok(await this.favService.create(createFavDto));
  }

  @Get('/all')
  async findAll() {
    return ok({fas: await this.favService.findAll()});
  }

  @Get("/list")
  async list(@Query() param) {
    return ok({fas: await this.favService.findBy(param)});
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return ok(await this.favService.findOne('id', +id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFavDto: UpdateFavDto) {
    return ok(await this.favService.update(+id, updateFavDto));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return ok(await this.favService.remove(+id));
  }
}
