import {MessageChain, Plain} from 'miraipie';
import {Plugin} from "../index";
import {Module} from "@nestjs/common";
import {DatabaseModule} from "../../../database/database.module";
import {todoProviders} from "../../../../modules/todo/todo.providers";
import {TodoService} from "../../../../modules/todo/todo.service";
import {formatDate, geDaysOff, getHoursOff, getMinutesOff} from "../../../utils/timeUtil";
import {TaskService} from "../../../../modules/task/task.service";
import {taskProviders} from "../../../../modules/task/task.providers";

@Module({
    imports: [DatabaseModule],
    providers: [
        ...todoProviders,
        ...taskProviders,
        TodoService,
        TaskService
    ],
    exports: [TodoService, TaskService]
})
export default class TodoPlugin extends Plugin {
    static TODO_SERVICE = null;
    static TASK_SERVICE = null;

    constructor(private todoService: TodoService, private taskService: TaskService) {
        super({
            name: "todo",
            zhName: "🎯 待办事项",
            desc: `🎯 待办事项插件:
    td add [待办事项] [待办时间] [执行人]  --添加待办事项
    td del [待办事项id]  --删除一个待办事项
    td done [待办事项id]  --完成一个待办事项
    td done --完成所有待办事项
    td ls  --列出所有待办事项
    td ls all  --列出所有待办事项
    td ls done --列出所有已完成待办事项
    td ls undo --列出所有未完成待办事项
`,
        });
        if (todoService) {
            TodoPlugin.TODO_SERVICE = todoService;
        }
        if (taskService) {
            TodoPlugin.TASK_SERVICE = taskService;
        }
    }

    // @ts-ignore
    async exec(app, chatMessage) {
        let cmd = chatMessage.messageChain.toDisplayString();

        if (cmd.startsWith('td')) {
            let cmdStrs = cmd.split(/\s+/);
            if (cmdStrs.length < 2) {
                return '命令不正确，请查看帮助。'
            } else {
                dispatchAction(cmdStrs, {
                    app: app,
                    chatMessage: chatMessage
                }).then((msg) => {
                    const chain = MessageChain.from([Plain(msg)]);
                    app.api.sendFriendMessage(chatMessage.sender.id, chain);
                });
            }
        }
    }

}

async function dispatchAction(cmdStrs, context) {
    let msg = '';
    let action = cmdStrs[1];
    if (action === 'add') {
        msg = await addTodo(cmdStrs, context);
    } else if (action === 'del') {
        msg = await delTodo(cmdStrs, context);
    } else if (action === 'done') {
        msg = await doneTodo(cmdStrs, context);
    } else if (action === 'ls') {
        msg = await dispatchLsStatus(cmdStrs, context);
    }
    return msg;
}

async function dispatchLsStatus(cmdStrs, context) {
    let msg = '';
    let status = cmdStrs[2];
    if (status === 'all' || !status) {
        msg = await lsAllTodo(cmdStrs, context);
    } else if (status === 'undo') {
        msg = await lsUndoTodo(cmdStrs, context);
    } else if (status === 'done') {
        msg = await lsDoneTodo(cmdStrs, context);
    }
    return msg;
}

/**
 * 未完成事项重新排序
 * @param userId
 */
async function reorderUndos(userId) {
    const undos = await TodoPlugin.TODO_SERVICE.findAll({status: 'undo', creator: userId})
    for (let i = 0; i < undos.length; i++) {
        undos[i].index = i + 1;
    }
    await TodoPlugin.TODO_SERVICE.batchUpdate(undos);
}

const mentionTimeFormatMap = {
    '([1-9]|[1-9][0-9])天([0-9]|1[0-9]|2[0-3])(时|小时)([0-9]|[1-5][0-9])(分|分钟)后': function (reg) {
        const day = reg[1];
        const hour = reg[2];
        const minute = reg[4];
        return getMinutesOff(day * 24 * 60 + hour * 60 + minute);
    },
    '([1-9]|[1-9][0-9])天([0-9]|1[0-9]|2[0-3])(时|小时)后': function (reg) {
        const day = reg[1];
        const hour = reg[2];
        return getMinutesOff(day * 24 * 60 + hour * 60);
    },
    '([1-9]|[1-9][0-9])天后的([0-9]|1[0-9]|2[0-3])(时|小时)([0-9]|[1-5][0-9])(分|分钟)': function (reg) {
        const day = reg[1];
        const hour = reg[2];
        const minute = reg[4];
        let daysOff = geDaysOff(day);
        daysOff.setHours(hour)
        daysOff.setMinutes(minute)
        daysOff.setSeconds(0)
        return daysOff;
    },
    '([1-9]|[1-9][0-9])天后的([0-9]|1[0-9]|2[0-3])(时|小时)': function (reg) {
        const day = reg[1];
        const hour = reg[2];
        let daysOff = geDaysOff(day);
        daysOff.setHours(hour)
        daysOff.setMinutes(0)
        daysOff.setSeconds(0)
        return daysOff;
    },
    '([0-9]|1[0-9]|2[0-3])(时|小时)后的([0-9]|[1-5][0-9])(分|分钟)': function (reg) {
        const hour = reg[1];
        const minute = reg[3];
        let daysOff = getHoursOff(hour);
        daysOff.setMinutes(minute)
        daysOff.setSeconds(0)
        return daysOff;
    },
    '([1-9]|[1-9][0-9])天后': function (reg) {
        const day = reg[1];
        return getMinutesOff(day * 24 * 60);
    },
    '([0-9]|1[0-9]|2[0-3])(时|小时)后': function (reg) {
        const hour = reg[1];
        return getMinutesOff(hour * 60);
    },
    '([0-9]|[1-5][0-9])(分|分钟)后': function (reg) {
        const minute = reg[1];
        return getMinutesOff(minute);
    }
}
function formatMentionTime (mentionTime) {
    if (!mentionTime) {
        return getHoursOff(3); // 默认三小时后
    }

    for (const str in mentionTimeFormatMap) {
        const reg = new RegExp(str).exec(mentionTime);
        if (reg) {
            return mentionTimeFormatMap[str](reg);
        }
    }
    return null;
}

async function createTask(todo, sender) {
    return await TodoPlugin.TASK_SERVICE.create({
        params: JSON.stringify({todo: todo, sender: sender}),
        status: 'queued',
        execTime: todo.mentionTime,
        taskName: 'todoTask'
    })
}

/**
 * 添加待办事项
 * @param cmdStrs
 * @param context
 * @returns {string}
 */
async function addTodo(cmdStrs, context) {
    let todoTitle = cmdStrs[2];
    let mentionTime = cmdStrs[3];
    let users = cmdStrs[4];
    let sender = context.chatMessage.sender;

    const undosCount = await TodoPlugin.TODO_SERVICE.count({status: 'undo', creator: sender.id})

    const fMentionTime = formatMentionTime(mentionTime);
    if (mentionTime == null) {
        return `待办时间格式错误，检查一下吧。【${mentionTime}】`;
    }
    const addTodo = {
        index: undosCount + 1,
        title: todoTitle,
        mentionTime: fMentionTime, // 默认三小时后
        users: users,
        creator: "" + sender.id,
        createTime: new Date()
    }
    await createTask(addTodo, sender);

    return await TodoPlugin.TODO_SERVICE.create(addTodo).then(async (todo) => {
        await reorderUndos(sender.id);
        if (todo.users) {
            let users = todo.users.split(',');
            const chain = MessageChain.from([Plain(`${sender.nickname}(${sender.id}) 将你列入待办事项【${todo.title}】的执行人列表。待办时间为${formatDate(todo.mentionTime)})`)]);
            for (let user of users) {
                if (user != sender.id) {
                    await context.app.api.sendFriendMessage(user, chain);
                }
            }
        }

        return `待办事项【${todo.title}】(${todo.index})添加成功。`

    }).catch(err => {
        return err;
    })
}

/**
 * 删除待办事项
 * @param cmdStrs
 * @param context
 * @returns {string}
 */
async function delTodo(cmdStrs, context) {
    let todoIndex = cmdStrs[2];
    let sender = context.chatMessage.sender;

    const delTodo = {
        index: todoIndex,
        creator: sender.id
    }

    const delTodos = await TodoPlugin.TODO_SERVICE.findAll(delTodo)

    return await TodoPlugin.TODO_SERVICE.remove(delTodo).then(async (todo) => {
        if (delTodos.length == 0) {
            return "删除的事项不存在";
        }
        if (delTodos[0].status === 'undo') {
            await reorderUndos(sender.id);
        }

        return `事项【${delTodos[0].title}】删除成功。`
    })
}

/**
 * 设置待办事项已完成
 * @param cmdStrs
 * @param context
 * @returns {string}
 */
async function doneTodo(cmdStrs, context) {
    let todoIndex = cmdStrs[2];
    let sender = context.chatMessage.sender;
    const doneTodo = {
        index: null,
        creator: sender.id,
        status: 'undo'
    }
    if (todoIndex) {
        doneTodo.index = todoIndex;
    }

    const doneTodos = await TodoPlugin.TODO_SERVICE.findAll(doneTodo)
    if (doneTodos.length === 0) {
        return `指定完成事项不存在。`
    }
    doneTodos.forEach(doneTodo => {
        doneTodo.status = 'done';
        doneTodo.index = -1;
    })

    return await TodoPlugin.TODO_SERVICE.batchUpdate(doneTodos).then(async (todo) => {
        await reorderUndos(sender.id);
        let msg = '';
        doneTodos.forEach(doneTodo => {
            msg += `事项【${doneTodo.title}】已设置为完成。\n`
        })
        return msg;
    })

}

function todoToDisplayString(todo) {
    return `${todo.index === -1 ? '√' : todo.index }.${todo.title}  ${formatDate(todo.mentionTime)}  ${todo.users == null ? "" : "【" + todo.users + "】"}`
}

/**
 * 列出待办事项
 * @param cmdStrs
 * @param status
 * @param context
 * @returns {string}
 */
async function lsTodo(cmdStrs, status, context) {
    let sender = context.chatMessage.sender;
    let condition = {creator: sender.id, status: status};
    if (status !== 'all' && !!status) {
        condition.status = status;
    }

    return await TodoPlugin.TODO_SERVICE.findAll(condition).then((todos) => {
        const todosList = [];
        // @ts-ignore
        for (let todo of todos) {
            todosList.push(todoToDisplayString(todo));
        }
        return {
            success: true,
            data: todosList,
            msg: '成功'
        };
    });


}

/**
 * 列出未完成待办事项
 * @param cmdStrs
 * @param context
 * @returns {string}
 */
async function lsUndoTodo(cmdStrs, context) {
    return await lsTodo(cmdStrs, 'undo', context).then((res) => {
        if (res.success) {
            return `未完成待办事项如下:\n` + res.data.join("\n")
        } else {
            return res.msg;
        }
    });

}

/**
 * 列出已完成待办事项
 * @param cmdStrs
 * @param context
 * @returns {string}
 */
async function lsDoneTodo(cmdStrs, context) {
    return await lsTodo(cmdStrs, 'done', context).then((res) => {
        if (res.success) {
            return `已完成待办事项如下:\n` + res.data.join("\n")
        } else {
            return res.msg;
        }
    });
}

/**
 * 列出已完成待办事项
 * @param cmdStrs
 * @returns {string}
 */
async function lsAllTodo(cmdStrs, context) {
    return await lsTodo(cmdStrs, null, context).then((res) => {
        if (res.success) {
            return `所有事项如下:\n` + res.data.join("\n")
        } else {
            return res.msg;
        }
    });
}
