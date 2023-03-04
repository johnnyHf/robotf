const {Entity, PrimaryGeneratedColumn, Column} = require('typeorm');

@Entity("todo")
export class Todo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    index: number;

    @Column()
    title: string;

    @Column()
    users: string;

    @Column()
    creator: string;

    @Column()
    status: string;

    @Column()
    attach: string;

    @Column()
    mentionTime: Date;

    @Column()
    createTime: Date;
}
