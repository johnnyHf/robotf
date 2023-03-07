import {Get, Controller, Res, Render, Param, Ip, Query, HostParam, Req} from '@nestjs/common';
import {getPlugin, reloadAll} from "../../common/robots/plugins";
import {Friend} from "../friend/entities/friend.entity";
import {ALL_PLUGINS} from "../../common/robots/plugins";
import {FriendChat, MessageChain, Plain} from "miraipie";
import {getClientIp} from "../../common/utils/ipUtil";
import {SourceEnum} from "../friend/enums/sourceEnum";
@Controller()
export class RobotController {
    private chatMessage: Friend;
    constructor() {
    }

    @Get('/plugins/reload')
    reloadPlugins() {
        reloadAll();
        Friend.reloadAllPlugins();
    }

    @Get('/plugin/:pluginName/detail')
    async helpPlugin(@Req() req, @Res() res) {
        const params = req.params;
        const query = req.query;
        const plugin = ALL_PLUGINS[params.pluginName];
        if (plugin) {
            if (plugin.html) {
                let data = {};
                if (plugin.name === 'userHelp') {
                    data = {msg: this.buildHelpMsg(query.userId)};
                }
                return res.render(plugin.html, data);
            } else {
                const chat = new FriendChat({
                    nickname: "", remark: "",
                    id: query.userId
                });
                await chat.send(MessageChain.from([Plain(`【${plugin.zhName}】没有更多信息。【📫 帮助提示】更多请点击👈。`)]));
            }
        } else {
            const chat = new FriendChat({
                nickname: "", remark: "",
                id: query.userId
            });
            await chat.send(MessageChain.from([Plain('该插件不存在')]));
        }
    }

    buildHelpMsg(sendId) {
        if (!sendId) {
            return "";
        }
        const chain = [];
        const friend = Friend.getById(SourceEnum.QQ, sendId)
        if (!friend) {
            Friend.addFriendIfAbsent(SourceEnum.QQ, sendId);
        }
        const plugins = Friend.getById(SourceEnum.QQ, sendId).getPlugins();

        for (let pluginName of plugins) {
            let plugin = getPlugin(pluginName);
            if (!plugin) {
                continue;
            }
            if (!plugin.ignoreDesc) {
                const desc = plugin.desc;
                chain.push(desc);
            }
        }
        return chain.join("\n\n");
    }
}
