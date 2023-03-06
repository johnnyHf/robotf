import {Json, MessageChain, Xml} from "miraipie";
import {Plugin} from "../index";
import {cardMsg, cardVedioMsg} from "../../../utils/qqUtil";

export default class CardPlugin extends Plugin {
    constructor() {
        super({
            name: "card",
            zhName: "💬 卡片消息",
            desc: `💬 卡片消息插件:
    cardp [标题] [来源] [接收人] [封面图] [跳转url]
    cardg [标题] [来源] [接收群] [封面图] [跳转url]
`,
        });
    }

    // @ts-ignore
    async exec(robot, chatMessage) {
        const chains = chatMessage.messageChain;
        let cmd = chatMessage.messageChain.toDisplayString();
        const cmds = cmd.split(/\s+/);
        if (cmds[0].startsWith('car')) {
            const titleMsg = chains[1];
            const imgMsg = chains[2];
            const urlMsg = chains[3];
            const titleCmds = titleMsg.text.split(/\s+/);

            const title = titleCmds[1];
            const source = titleCmds[2];
            const receiver = parseInt(titleCmds[3]);
            const image = imgMsg.url.split("?")[0];
            let url = image;
            if (urlMsg) {
                url = urlMsg.text;
            }

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

