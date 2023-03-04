import {Inject, Injectable} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {Repository} from "typeorm";
import {ListTaskDto} from "./dto/list-task.dto";
import {Task} from "./entities/task.entity";

@Injectable()
export class TaskService {
  constructor(
      @Inject('TASK_REPOSITORY')
      private taskRepository: Repository<Task>,
  ) {}

  create(createTaskDto: CreateTaskDto) {
    return this.taskRepository.save(createTaskDto);
  }

  findAll() {
    return this.taskRepository.find();
  }
  
  findBy(listTaskDto: ListTaskDto) {
    return this.taskRepository.find({
      where: {
        status: listTaskDto.status,
        taskName: listTaskDto.taskName
      },
      take: listTaskDto.size,
      skip: (listTaskDto.page - 1) * listTaskDto.size
    });
  }

  findOne(field: string, val: any) {
    const where = {};
    where[field] = val;
    return this.taskRepository.findOneBy(where);
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.taskRepository.update(id, updateTaskDto)
  }

  remove(id: number) {
    return this.taskRepository.delete(id);
  }
}
