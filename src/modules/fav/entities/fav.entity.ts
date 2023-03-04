const {Entity, PrimaryGeneratedColumn, Column} = require('typeorm');

@Entity('fav')
export class Fav {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    createTime: Date;

    @Column()
    creator: string;
}
