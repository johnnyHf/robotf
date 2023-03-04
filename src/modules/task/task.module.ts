import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import {DatabaseModule} from "../../common/database/database.module";
import {taskProviders} from "./task.providers";

@Module({
  imports: [DatabaseModule],
  controllers: [TaskController],
  providers: [
    ...taskProviders,
    TaskService
  ]
})
export class TaskModule {}
