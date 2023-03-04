const {Entity, PrimaryGeneratedColumn, Column} = require('typeorm');

@Entity('task')
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    params: string;

    @Column()
    status: string;

    @Column()
    taskName: string;

    @Column()
    execTime: Date;

    @Column()
    createTime: Date;
}
