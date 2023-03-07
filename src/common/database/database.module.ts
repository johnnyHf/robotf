import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import {mongoProviders} from "./mongo.providers";

@Module({
    providers: [...databaseProviders],
    exports: [...databaseProviders],
})
export class DatabaseModule {}