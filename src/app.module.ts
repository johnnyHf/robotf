import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './modules/todo/todo.module';
import { TaskModule } from './modules/task/task.module';
import { FavModule } from './modules/fav/fav.module';
import { UsageModule } from './modules/usage/usage.module';
import { FriendModule } from './modules/friend/friend.module';
import { GroupModule } from './modules/group/group.module';
import FavPlugin from "./common/robots/plugins/users/fav";
import {RobotController} from "./modules/robot/robot.controller";
import TodoPlugin from "./common/robots/plugins/users/todo";
import ChatGPTPlugin from "./common/robots/plugins/common/chatGPT";

@Module({
  imports: [
      TodoModule, TaskModule, FavModule, UsageModule, FriendModule, GroupModule, FavPlugin, TodoPlugin, ChatGPTPlugin
],
  controllers: [AppController, RobotController],
  providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // consumer
        //     .apply(LoggerMiddleware)
        //     .forRoutes('cats');
    }
}
