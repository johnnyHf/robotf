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
            zhName: "ð¯ å¾åäºé¡¹",
            desc: `ð¯ å¾åäºé¡¹æä»¶:
    td add [å¾åäºé¡¹] [å¾åæ¶é´] [æ§è¡äºº]  --æ·»å å¾åäºé¡¹
    td del [å¾åäºé¡¹id]  --å é¤ä¸ä¸ªå¾åäºé¡¹
    td done [å¾åäºé¡¹id]  --å®æä¸ä¸ªå¾åäºé¡¹
    td done --å®æææå¾åäºé¡¹
    td ls  --ååºææå¾åäºé¡¹
    td ls all  --ååºææå¾åäºé¡¹
    td ls done --ååºææå·²å®æå¾åäºé¡¹
    td ls undo --ååºæææªå®æå¾åäºé¡¹
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
                return 'å½ä»¤ä¸æ­£ç¡®ï¼è¯·æ¥çå¸®å©ã'
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
 * æªå®æäºé¡¹éæ°æåº
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
    '([1-9]|[1-9][0-9])å¤©([0-9]|1[0-9]|2[0-3])(æ¶|å°æ¶)([0-9]|[1-5][0-9])(å|åé)å': function (reg) {
        const day = reg[1];
        const hour = reg[2];
        const minute = reg[4];
        return getMinutesOff(day * 24 * 60 + hour * 60 + minute);
    },
    '([1-9]|[1-9][0-9])å¤©([0-9]|1[0-9]|2[0-3])(æ¶|å°æ¶)å': function (reg) {
        const day = reg[1];
        const hour = reg[2];
        return getMinutesOff(day * 24 * 60 + hour * 60);
    },
    '([1-9]|[1-9][0-9])å¤©åç([0-9]|1[0-9]|2[0-3])(æ¶|å°æ¶)([0-9]|[1-5][0-9])(å|åé)': function (reg) {
        const day = reg[1];
        const hour = reg[2];
        const minute = reg[4];
        let daysOff = geDaysOff(day);
        daysOff.setHours(hour)
        daysOff.setMinutes(minute)
        daysOff.setSeconds(0)
        return daysOff;
    },
    '([1-9]|[1-9][0-9])å¤©åç([0-9]|1[0-9]|2[0-3])(æ¶|å°æ¶)': function (reg) {
        const day = reg[1];
        const hour = reg[2];
        let daysOff = geDaysOff(day);
        daysOff.setHours(hour)
        daysOff.setMinutes(0)
        daysOff.setSeconds(0)
        return daysOff;
    },
    '([0-9]|1[0-9]|2[0-3])(æ¶|å°æ¶)åç([0-9]|[1-5][0-9])(å|åé)': function (reg) {
        const hour = reg[1];
        const minute = reg[3];
        let daysOff = getHoursOff(hour);
        daysOff.setMinutes(minute)
        daysOff.setSeconds(0)
        return daysOff;
    },
    '([1-9]|[1-9][0-9])å¤©å': function (reg) {
        const day = reg[1];
        return getMinutesOff(day * 24 * 60);
    },
    '([0-9]|1[0-9]|2[0-3])(æ¶|å°æ¶)å': function (reg) {
        const hour = reg[1];
        return getMinutesOff(hour * 60);
    },
    '([0-9]|[1-5][0-9])(å|åé)å': function (reg) {
        const minute = reg[1];
        return getMinutesOff(minute);
    }
}
function formatMentionTime (mentionTime) {
    if (!mentionTime) {
        return getHoursOff(3); // é»è®¤ä¸å°æ¶å
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
 * æ·»å å¾åäºé¡¹
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
        return `å¾åæ¶é´æ ¼å¼éè¯¯ï¼æ£æ¥ä¸ä¸å§ãã${mentionTime}ã`;
    }
    const addTodo = {
        index: undosCount + 1,
        title: todoTitle,
        mentionTime: fMentionTime, // é»è®¤ä¸å°æ¶å
        users: users,
        creator: "" + sender.id,
        createTime: new Date()
    }
    await createTask(addTodo, sender);

    return await TodoPlugin.TODO_SERVICE.create(addTodo).then(async (todo) => {
        await reorderUndos(sender.id);
        if (todo.users) {
            let users = todo.users.split(',');
            const chain = MessageChain.from([Plain(`${sender.nickname}(${sender.id}) å°ä½ åå¥å¾åäºé¡¹ã${todo.title}ãçæ§è¡äººåè¡¨ãå¾åæ¶é´ä¸º${formatDate(todo.mentionTime)})`)]);
            for (let user of users) {
                if (user != sender.id) {
                    await context.app.api.sendFriendMessage(user, chain);
                }
            }
        }

        return `å¾åäºé¡¹ã${todo.title}ã(${todo.index})æ·»å æåã`

    }).catch(err => {
        return err;
    })
}

/**
 * å é¤å¾åäºé¡¹
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
            return "å é¤çäºé¡¹ä¸å­å¨";
        }
        if (delTodos[0].status === 'undo') {
            await reorderUndos(sender.id);
        }

        return `äºé¡¹ã${delTodos[0].title}ãå é¤æåã`
    })
}

/**
 * è®¾ç½®å¾åäºé¡¹å·²å®æ
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
        return `æå®å®æäºé¡¹ä¸å­å¨ã`
    }
    doneTodos.forEach(doneTodo => {
        doneTodo.status = 'done';
        doneTodo.index = -1;
    })

    return await TodoPlugin.TODO_SERVICE.batchUpdate(doneTodos).then(async (todo) => {
        await reorderUndos(sender.id);
        let msg = '';
        doneTodos.forEach(doneTodo => {
            msg += `äºé¡¹ã${doneTodo.title}ãå·²è®¾ç½®ä¸ºå®æã\n`
        })
        return msg;
    })

}

function todoToDisplayString(todo) {
    return `${todo.index === -1 ? 'â' : todo.index }.${todo.title}  ${formatDate(todo.mentionTime)}  ${todo.users == null ? "" : "ã" + todo.users + "ã"}`
}

/**
 * ååºå¾åäºé¡¹
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
            msg: 'æå'
        };
    });


}

/**
 * ååºæªå®æå¾åäºé¡¹
 * @param cmdStrs
 * @param context
 * @returns {string}
 */
async function lsUndoTodo(cmdStrs, context) {
    return await lsTodo(cmdStrs, 'undo', context).then((res) => {
        if (res.success) {
            return `æªå®æå¾åäºé¡¹å¦ä¸:\n` + res.data.join("\n")
        } else {
            return res.msg;
        }
    });

}

/**
 * ååºå·²å®æå¾åäºé¡¹
 * @param cmdStrs
 * @param context
 * @returns {string}
 */
async function lsDoneTodo(cmdStrs, context) {
    return await lsTodo(cmdStrs, 'done', context).then((res) => {
        if (res.success) {
            return `å·²å®æå¾åäºé¡¹å¦ä¸:\n` + res.data.join("\n")
        } else {
            return res.msg;
        }
    });
}

/**
 * ååºå·²å®æå¾åäºé¡¹
 * @param cmdStrs
 * @returns {string}
 */
async function lsAllTodo(cmdStrs, context) {
    return await lsTodo(cmdStrs, null, context).then((res) => {
        if (res.success) {
            return `ææäºé¡¹å¦ä¸:\n` + res.data.join("\n")
        } else {
            return res.msg;
        }
    });
}
