const {Entity, PrimaryGeneratedColumn, Column} = require('typeorm');

@Entity()
export class Usage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    data: string;

    @Column()
    unit: string;

    @Column()
    app: string;

    @Column()
    typeId: number;

    @Column()
    type: number;

    @Column()
    createTime: Date;

    @Column()
    version: number;
}
