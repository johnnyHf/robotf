import {MessageChain, Plain, Image, Xml} from "miraipie";
import {SingleMessage} from "miraipie/types/mirai";
import {Plugin} from "../index";
import {cardMsg} from "../../../utils/qqUtil";
import {FavService} from "../../../../modules/fav/fav.service";
import {Module} from '@nestjs/common';
import {favProviders} from "../../../../modules/fav/fav.providers";
import {DatabaseModule} from "../../../database/database.module";

@Module({
    imports: [DatabaseModule],
    providers: [
        ...favProviders,
        FavService
    ],
    exports: [FavService]
})
export default class FavPlugin extends Plugin {
    static FAV_SERVICE = null;
    constructor(private favService: FavService) {
        super({
            name: "fav",
            zhName: "❤ 我的收藏",
            desc: `❤ 收藏插件:
    fa url [标题] [内容] [url] [image]
    fa text [标题] [内容]
    fa img [标题] [图片1]...
    fa code [标题] [内容]
    fa ls [分页] [标题]  --查询特定标题的内容,第一页开始
`,
        });
        if (favService) {
            FavPlugin.FAV_SERVICE = favService;
        }
    }

    // @ts-ignore
    async exec(client, chatMessage) {
        const senderId = chatMessage.sender.id;
        const messages = chatMessage.messageChain;
        let cmd = chatMessage.messageChain.toDisplayString();
        const cmds = cmd.split(/\s+/);
        if (cmds[0] === 'fa' && cmds.length >= 3) {
            if (!cmds[1] && cmds.length < 3) {
                const chain = MessageChain.from([Plain('收藏失败，命令错误！')]);
                await client.api.sendFriendMessage(senderId, chain);
                return;
            }
            const type = cmds[1];
            let title = cmds[2];
            const fav = {
                type: type,
                title: title,
                content: null,
                createTime: new Date(),
                creator: senderId
            }

            if (type === 'url' && cmds.length >= 5) {
                const content = {
                    "content": cmds[3],
                    "url": cmds[4],
                    "img": cmds[5],
                }
                fav.content = JSON.stringify(content);
            } else if (type === 'img') {
                fav.content = JSON.stringify(messages.slice(1));
            } else if (type === 'ls') {

                const page = parseInt(cmds[2])
                const query = {
                    creator: senderId,
                    page: page,
                    size: 10
                }
                if (cmds.length == 4) {
                    // @ts-ignore
                    query.title = title;
                }

                const faves = await FavPlugin.FAV_SERVICE.findBy(query)
                // @ts-ignore
                let resMsgs: SingleMessage[] = MessageChain.from([Plain(`找到收藏【${query.title ? query.title : ''}】如下:\n`)]);
                await client.api.sendFriendMessage(senderId, resMsgs);

                for (let i=0;i<faves.length;i++) {
                    let resMsgs: SingleMessage[] = MessageChain.from([]);
                    let msg = buildMsg(faves[i]);
                    resMsgs.push(Plain(`${i+1}.【${faves[i].title}】:\n`))
                    resMsgs = resMsgs.concat(msg)
                    await client.api.sendFriendMessage(senderId, resMsgs);
                }
                return;
            } else {
                fav.content = JSON.stringify(cmds.slice(3).join(" "));
            }
            await FavPlugin.FAV_SERVICE.create(fav);
            await client.api.sendFriendMessage(senderId, MessageChain.from([Plain(`收藏【${title}】成功!`)]));
        }

    }

}

function buildMsg(fav) {
    const type = fav.type;
    if (type === 'url') {
        const contentJson = JSON.parse(fav.content);
        const xmlCard = cardMsg({
            brief: "我的收藏",
            title: fav.title,
            targetUrl: contentJson.url,
            img: contentJson.img,
            source: "我的收藏-" + fav.title,
        });
        return [Xml(xmlCard)];
    } else if (type === 'img') {
        const imgs = JSON.parse(fav.content);
        const resImgs = [];
        for (let img of imgs) {
            resImgs.push(Image(null, img.url, null, null))
        }
        return resImgs;
    } else {
        return [Plain(fav.content + '\n')]
    }
}
