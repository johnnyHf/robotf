import {Inject, Injectable} from '@nestjs/common';
import {CreateTodoDto} from './dto/create-todo.dto';
import {UpdateTodoDto} from './dto/update-todo.dto';
import {Like, Repository} from "typeorm";
import {Todo} from "./entities/todo.entity";
import {ListTodoDto} from "./dto/list-todo.dto";
import {DeleteTodoDto} from "./dto/delete-todo.dto";

@Injectable()
export class TodoService {
    constructor(
        @Inject('TODO_REPOSITORY')
        private todoRepository: Repository<Todo>,
    ) {
    }

    async create(createTodoDto: CreateTodoDto) {
        return this.todoRepository.save(createTodoDto);
    }

    count(listTodoDto: ListTodoDto) {
      return this.todoRepository.countBy(listTodoDto);
    }

    findBy(listTodoDto: ListTodoDto) {
        const where = {
            index: listTodoDto.index,
            creator: listTodoDto.creator,
            status: listTodoDto.status
        }
        if (listTodoDto.title) {
            // @ts-ignore
            where.title = listTodoDto.title;
        }
        return this.todoRepository.find({
            where: where,
            take: listTodoDto.size,
            skip: (listTodoDto.page - 1) * listTodoDto.size
        });
    }

    findAll(listTodoDto: ListTodoDto) {
        return this.todoRepository.find({
            where: {
                creator: listTodoDto.creator,
                status: listTodoDto.status
            }
        });
    }

    findOne(field: string, val: any) {
        const where = {};
        where[field] = val;
        return this.todoRepository.findOneBy(where);
    }

    update(id: number, updateTodoDto: UpdateTodoDto) {
        return this.todoRepository.update(id, updateTodoDto)
    }

    batchUpdate(todos: Todo[]) {
        return this.todoRepository.createQueryBuilder()
            .insert()
            .into(Todo)
            .values(todos)
            .orUpdate(["status", "index"])
            .execute();
    }

    remove(deleteDto: DeleteTodoDto) {
        return this.todoRepository.delete(deleteDto);
    }
}
