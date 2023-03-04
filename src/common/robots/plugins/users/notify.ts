import {MessageChain, Plain} from "miraipie";
import {Plugin} from "../index";

export default class NotifyPlugin extends Plugin {
    constructor() {
        super({
            name: "notify",
            zhName: "📢 群发通知",
            desc: `📢 群发通知插件:
    nt all [通知内容] --通知所有人
    nt [分组] [通知内容] --通知分组人
`,
        });
    }

    // @ts-ignore
    async exec(robot, chatMsg) {
        const senderId = chatMsg.sender.id;
        const messages = chatMsg.messageChain;
        let cmd = chatMsg.messageChain.toDisplayString();
        const cmds = cmd.split(/\s+/);

        if (cmds.length > 0 && cmds[0] === 'nt') {
            const msg = '📢 新消息通知:\n\n' + cmds.slice(2, cmds.length).join(' ');
            const chain = MessageChain.from([Plain(msg)]);
            for (let i = 0;i<messages.length;i++) {
                if (!messages[i].toDisplayString().startsWith("nt ")) {
                    chain.push(messages[i]);
                }
            }

            let friends = null;
            const group = cmds[1];

            let classes = await robot.api.getGroupList();
            classes = classes.data;
            if (group === 'all') {
                friends = await robot.api.getFriendList().data;
                friends.forEach(f => {
                    robot.api.sendFriendMessage(f.id, chain);
                })
            } else {
                const groupId = getClassIdByName(group, classes);
                if (!groupId) {
                    await robot.api.sendFriendMessage(senderId, MessageChain.from([Plain(`分组【${group}】不存在，存在的分组:\n${values(classes).join('\n')}`)]));
                    return;
                }
                await robot.api.sendGroupMessage(groupId, chain);
            }


        }
    }

}


function values(map) {
    const out = [];
    for (let c of map) {
        out.push(c.name);
    }
    return out;
}


function getClassIdByName(className, classes) {
    for (let c of classes) {
        if (c.name === className) {
            return c.id;
        }
    }
    return null;
}
