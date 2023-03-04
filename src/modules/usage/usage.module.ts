import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { UsageController } from './usage.controller';
import {DatabaseModule} from "../../common/database/database.module";
import {usageProviders} from "./usage.providers";

@Module({
  imports: [DatabaseModule],
  controllers: [UsageController],
  providers: [
      ...usageProviders,
      UsageService
  ]
})
export class UsageModule {}
