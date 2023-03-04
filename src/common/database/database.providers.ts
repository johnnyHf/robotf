import { DataSource } from 'typeorm';
import {Todo} from "../../modules/todo/entities/todo.entity";
import {Task} from "../../modules/task/entities/task.entity";
import {Fav} from "../../modules/fav/entities/fav.entity";
import {Usage} from "../../modules/usage/entities/usage.entity";

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        autoLoadEntities: true,
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: '139.186.203.142',
                port: 3306,
                username: 'root',
                password: '**HFhf0215128178',
                database: 'qqbot',
                entities: [
                    Todo,
                    Task,
                    Fav,
                    Usage,
                    __dirname + '/../**/*.entity{.ts,.js}',
                ],
                synchronize: false,
            });

            return dataSource.initialize();
        },
    },
];