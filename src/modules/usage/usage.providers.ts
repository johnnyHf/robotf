import { DataSource } from 'typeorm';
import { Usage } from './entities/usage.entity';

export const usageProviders = [
    {
        provide: 'USAGE_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Usage),
        inject: ['DATA_SOURCE'],
    },
];