import { Connection } from 'mongoose';
import { CatSchema } from './schemas/cats.schema';

export const catsProviders = [
    {
        provide: 'CAT_MODEL',
        useFactory: (connection: Connection) => connection.model('Cat', CatSchema),
        inject: ['MONGO_DATASOURCE'],
    },
];