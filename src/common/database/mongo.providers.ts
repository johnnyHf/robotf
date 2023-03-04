import * as mongoose from 'mongoose';

export const mongoProviders = [
    {
        provide: 'MONGO_DATASOURCE',
        useFactory: (): Promise<typeof mongoose> =>
            mongoose.connect('mongodb://user:**HFhf0215128178@139.186.203.142:27017/agenda'),
    },
];