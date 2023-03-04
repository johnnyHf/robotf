import {Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post("/add")
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get("/all")
  findAll() {
    return this.todoService.findAll({});
  }

  @Get("/list")
  list(@Query() param) {
    return this.todoService.findBy(param);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.todoService.findOne("id", +id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(+id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoService.remove({id: +id});
  }
}
