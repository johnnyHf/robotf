import {Inject, Injectable} from '@nestjs/common';
import { CreateUsageDto } from './dto/create-usage.dto';
import { UpdateUsageDto } from './dto/update-usage.dto';
import {Like, Repository} from "typeorm";
import {Usage} from "./entities/usage.entity";
import {ListUsageDto} from "./dto/list-usage.dto";

@Injectable()
export class UsageService {
  constructor(
      @Inject('USAGE_REPOSITORY')
      private usageRepository: Repository<Usage>,
  ) {}

  create(createUsageDto: CreateUsageDto) {
    return this.usageRepository.save(createUsageDto);
  }

  findBy(listUsageDto: ListUsageDto) {
    return this.usageRepository.find({
      where: {
        app: listUsageDto.app,
        type: listUsageDto.type,
        typeId: listUsageDto.typeId
      },
      take: listUsageDto.size,
      skip: (listUsageDto.page - 1) * listUsageDto.size
    });
  }

  findAll() {
    return this.usageRepository.find();
  }

  findOne(field: string, val: any) {
    const where = {};
    where[field] = val;
    return this.usageRepository.findOneBy(where);
  }

  update(id: number, updateUsageDto: UpdateUsageDto) {
    return this.usageRepository.update(id, updateUsageDto)
  }

  remove(id: number) {
    return this.usageRepository.delete(id);
  }

  modifyData(usages, amount) {
    let sql = `data + ${amount}`;
    if (amount < 0) {
      sql = `data - ${-amount}`;
    }
    return this.usageRepository.createQueryBuilder()
        .update(Usage)
        .set({ data: () => sql, version: () => `version+1` })
        .where('id=:id', { id: usages.id, version: usages.version })
        .execute();
  }
}
