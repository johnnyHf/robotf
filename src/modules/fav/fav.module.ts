import {Module} from '@nestjs/common';
import {FavService} from './fav.service';
import {FavController} from './fav.controller';
import {DatabaseModule} from "../../common/database/database.module";
import {favProviders} from "./fav.providers";
import FavPlugin from "../../common/robots/plugins/users/fav";

@Module({
    imports: [DatabaseModule],
    controllers: [FavController],
    providers: [
        ...favProviders,
        FavService
    ],
    exports: [FavService]
})
export class FavModule {
}
