import {MessageChain, Xml} from "miraipie";
import {Plugin} from "../index";
import {cardMsg} from "../../../utils/qqUtil";

export default class CardPlugin extends Plugin {
    constructor() {
        super({
            name: "card",
            zhName: "💬 卡片消息",
            desc: `💬 卡片消息插件:
    cardp [标题] [来源] [url] [image] [接收人]
    cardg [标题] [来源] [url] [image] [接收人]
`,
        });
    }

    // @ts-ignore
    async exec(robot, chatMessage) {
        let cmd = chatMessage.messageChain.toDisplayString();
        const cmds = cmd.split(/\s+/);
        if (cmds[0].startsWith('car')) {
            const title = cmds[1];
            const source = cmds[2];
            const url = cmds[3];
            const image = cmds[4];
            const receiver = parseInt(cmds[5]);

            const xmlCard = cardMsg({
                brief: title,
                title: title,
                targetUrl: url,
                img: image,
                source: source
            });
            if (cmds[0] === 'carp') {
                await robot.api.sendFriendMessage(receiver, MessageChain.from([Xml(xmlCard)]));
            } else if (cmds[0] === 'carg') {
                await robot.api.sendGroupMessage(receiver, MessageChain.from([Xml(xmlCard)]));
            }
        }

    }
}

