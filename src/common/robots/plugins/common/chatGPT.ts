import {FriendChat, Image, MessageChain, Plain} from 'miraipie';
import {Plugin} from "../index";
import {Module} from "@nestjs/common";
import {DatabaseModule} from "../../../database/database.module";
import {UsageService} from "../../../../modules/usage/usage.service";
import https from "https";
import {usageProviders} from "../../../../modules/usage/usage.providers";
import {Friend} from "../../../../modules/friend/entities/friend.entity";
import {SourceEnum} from "../../../../modules/friend/enums/sourceEnum";
import OpenAIBot from "../../../lib/OpenAIBot";
const setting = require('../../../../common/config/setting.json') ;

const MSG_TYPE = 'chatGPT';
@Module({
    imports: [DatabaseModule],
    providers: [
        ...usageProviders,
        UsageService
    ],
    exports: [UsageService]
})
export default class ChatGPTPlugin extends Plugin {
    static USAGE_SERVICE = null;
    constructor(private usageService: UsageService) {
        super({
            name: "chatGPT",
            zhName: "🤹🏿 chatGPT",
            desc: `🤹🏿 chatGPT插件:
    cp [word] --AI对话
    cp img [word] --让AI画图
    cp ls --查询调用额度
`,
        });
        if (usageService) {
            ChatGPTPlugin.USAGE_SERVICE = usageService;
        }
    }

    // @ts-ignore
    async exec(app, chatMessage) {
        let cmd = chatMessage.messageChain.toDisplayString();
        const cmds = cmd.split(/\s+/);
        const sender = chatMessage.sender;

        let usage = await queryChatGPTUsageOrCreate(sender.id);

        if (cmds[0] === 'cp') {
            const chat = new FriendChat(sender);
            const friend = Friend.getById(SourceEnum.QQ, sender.id);
            if (cmds[1] === 'ls') {
                const resMsg =
                    `chatGPT剩余额度: ${usage.data}${usage.unit}
注: 调用次数不够可以联系开发者充值。
`;
                const chain = MessageChain.from([Plain(resMsg)]);
                await chat.send(chain);
            } else {
                if (parseInt(usage.data) < 0) {
                    const resMsg =
                        `chatGPT剩余额度不足，请联系开发者充值。
`;
                    const chain = MessageChain.from([Plain(resMsg)]);
                    await chat.send(chain);
                }

                let response = null;
                if (cmds[1] === 'img' || cmds[1] === 'm') {
                    const chatMsg = cmds.slice(2, cmds.length).join(' ');
                    friend.addMsg(chatMsg, chatMessage.messageChain.sourceId, MSG_TYPE);
                    response = await OpenAIBot.createImage(chatMsg, sender.id + '');
                    await downloadFile(response.data, async function (fileStream) {
                        const uploadRes = await app.httpApi.uploadImage('friend', fileStream);
                        const chain = MessageChain.from([Image(uploadRes.imageId)]);
                        await chat.send(chain);
                    });
                } else {
                    const chatMsg = cmds.slice(1, cmds.length).join(' ');
                    friend.addMsg(chatMsg, chatMessage.messageChain.sourceId, MSG_TYPE);
                    response = await OpenAIBot.createComplete(chatMsg, sender.id + '');
                    const chain = MessageChain.from([Plain(response.data.trim())]);
                    await chat.send(chain);
                }

                await modifyUsageIfSuccess(response, friend);
            }
        }
    }

}

async function modifyUsageIfSuccess(response, friend) {
    if (response && response.success) {
        friend.addResponse(response.data, null, MSG_TYPE);

        let usage = await queryChatGPTUsageOrCreate(friend.id)
        await ChatGPTPlugin.USAGE_SERVICE.modifyData(usage, -1)
    }
}

async function queryChatGPTUsageOrCreate(id) {
    const usages = await ChatGPTPlugin.USAGE_SERVICE.findBy({
        app: 'chatGPT',
        type: 'friend',
        typeId: id + '',
        page: 1,
        size: 10
    });
    let usage = null;
    if (!usages || usages.length == 0) {
        usage = await ChatGPTPlugin.USAGE_SERVICE.create({
            app: 'chatGPT',
            type: 'friend',
            typeId: id + '',
            data: setting.chatGPT.init_usage + '',
            unit: '次'
        })
    } else {
        usage = usages[0];
    }
    return usage;
}


async function downloadFile(url, cb) {
    https.get(url, (stream) => {
        cb(stream);
    });
}
