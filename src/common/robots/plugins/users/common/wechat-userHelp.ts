import Wechat from 'wechat4u';
import { Friend } from "../../../../../modules/friend/entities/friend.entity";
import { SourceEnum } from "../../../../../modules/friend/enums/sourceEnum";
import { btnListCardMsg } from "../../../../utils/qqUtil";
import {getPlugin, Plugin} from "../../index";
let setting = require('../../../../config/setting.json');

export default class WechatUserHelpPlugin extends Plugin {
    constructor() {
        super({
            name: "wechatUserHelp",
            zhName: "📫 帮助提示",
            html: 'default/help.hbs',
            desc: "📫 用户消息帮助提示插件"
        });
    }

    // @ts-ignore
    async exec(robot: Wechat, chatMsg) {
        const sendId = chatMsg.FromUserName;
        const cmd = chatMsg.Content;
        console.log('userhelp')
        console.log(chatMsg)
        if (['帮助', '?', '？', '功能', '示例'].includes(cmd)) {
            const plugins = Friend.getById(SourceEnum.Wechat, sendId).getPlugins();
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
            console.log(sendId)
            const card = btnListCardMsg(btns, extraInfos);
            await robot.sendMsg(card, sendId);
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

