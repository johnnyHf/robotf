import {MessageChain, Plain, Xml} from 'miraipie';
import { Friend } from "../../../../../modules/friend/entities/friend.entity";
import { SourceEnum } from "../../../../../modules/friend/enums/sourceEnum";
import { btnListCardMsg } from "../../../../utils/qqUtil";
import {getPlugin, Plugin} from "../../index";
let setting = require('../../../../config/setting.json');

export default class UserHelpPlugin extends Plugin {
    constructor() {
        super({
            name: "userHelp",
            zhName: "📫 帮助提示",
            html: 'default/help.hbs',
            desc: "📫 用户消息帮助提示插件"
        });
    }

    // @ts-ignore
    async exec(robot, chatMsg) {
        const sendId = chatMsg.sender.id;
        const cmd = chatMsg.messageChain.toDisplayString();
        if (['帮助', '?', '？', '功能', '示例'].includes(cmd)) {
            const plugins = Friend.getById(SourceEnum.QQ, sendId).getPlugins();
            const btns = [];
            const extraInfos = {
                title: '📫 功能列表:',
                brief: '📫 功能列表',
                source: 'Jejo'
            }
            for (let pluginName of plugins) {
                let plugin = getPlugin(pluginName);
                if (!plugin) {
                    continue;
                }
                if (!plugin.ignoreDesc) {
                    btns.push({
                        name: plugin.zhName,
                        url: this.buildUrl(plugin, sendId)
                    })
                }
            }
            const card = btnListCardMsg(btns, extraInfos);
            await robot.api.sendFriendMessage(chatMsg.sender.id, MessageChain.from([Xml(card)]));
        }
    }

    buildUrl (plugin, sendId) {
        return setting['host']
            + ":"
            + setting['port']
            +  "/plugin/" + plugin.name + "/detail"
            + this.buildHelpParams(sendId);
    }

    buildHelpParams(sendId) {
        return "?userId=" + sendId;
    }
}

