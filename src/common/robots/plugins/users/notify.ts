import {MessageChain, Plain} from "miraipie";
import {Plugin} from "../index";

export default class NotifyPlugin extends Plugin {
    constructor() {
        super({
            name: "notify",
            zhName: "๐ข ็พคๅ้็ฅ",
            desc: `๐ข ็พคๅ้็ฅๆไปถ:
    nt all [้็ฅๅๅฎน] --้็ฅๆๆไบบ
    nt [ๅ็ป] [้็ฅๅๅฎน] --้็ฅๅ็ปไบบ
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
            const msg = '๐ข ๆฐๆถๆฏ้็ฅ:\n\n' + cmds.slice(2, cmds.length).join(' ');
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
                    await robot.api.sendFriendMessage(senderId, MessageChain.from([Plain(`ๅ็ปใ${group}ใไธๅญๅจ๏ผๅญๅจ็ๅ็ป:\n${values(classes).join('\n')}`)]));
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
