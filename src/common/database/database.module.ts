import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import {mongoProviders} from "./mongo.providers";

@Module({
    providers: [...databaseProviders, ...mongoProviders],
    exports: [...databaseProviders, ...mongoProviders],
})
export class DatabaseModule {}