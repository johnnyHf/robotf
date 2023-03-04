import {Inject, Injectable} from '@nestjs/common';
import { CreateFavDto } from './dto/create-fav.dto';
import { UpdateFavDto } from './dto/update-fav.dto';
import {Like, Repository} from "typeorm";
import {Fav} from "./entities/fav.entity";
import {ListFavDto} from "./dto/list-fav.dto";

@Injectable()
export class FavService {
  constructor(
      @Inject('FAV_REPOSITORY')
      private favRepository: Repository<Fav>,
  ) {}

  create(createFavDto: CreateFavDto) {
    return this.favRepository.save(createFavDto);
  }

  findBy(listFavDto: ListFavDto) {
    const where = {
      creator: listFavDto.creator
    };
    if (listFavDto.title) {
      // @ts-ignore
      where.title = Like("%"+listFavDto.title+"%")

    }
    return this.favRepository.find({
      where: where,
      take: listFavDto.size,
      skip: (listFavDto.page - 1) * listFavDto.size
    });
  }

  findAll() {
    return this.favRepository.find();
  }

  findOne(field: string, val: any) {
    const where = {};
    where[field] = val;
    return this.favRepository.findOneBy(where);
  }

  update(id: number, updateFavDto: UpdateFavDto) {
    return this.favRepository.update(id, updateFavDto)
  }

  remove(id: number) {
    return this.favRepository.delete(id);
  }
}
