export class CreateTodoDto {
    index: number;
    title: string;
    mentionTime: Date;
    users?: string;
    creator: string;
    createTime: Date;
}
