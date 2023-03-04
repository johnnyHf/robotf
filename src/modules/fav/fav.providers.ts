import { DataSource } from 'typeorm';
import { Fav } from './entities/fav.entity';

export const favProviders = [
    {
        provide: 'FAV_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Fav),
        inject: ['DATA_SOURCE'],
    },
];