import {Chat, MessageChain, Plain} from 'miraipie';
import {Plugin} from "../index";

const axios = require('axios');

export default class HisTodayPlugin extends Plugin {
    constructor() {
        super({
            name: "hisToday",
            zhName: "🌎 往时今日",
            desc: `🌎 历史上的今天插件:
    历史上的今天
`,
        });
    }

    // @ts-ignore
    async exec(app, chatMessage) {
        let cmd = chatMessage.messageChain.toDisplayString();
        if (cmd === '历史上的今天') {
            getHisInfo(function (datas) {
                Chat.findFriend(chatMessage.sender.id).then(async (chat) => {
                    const chain = MessageChain.from([Plain(displayHisInfo(datas))])
                    await chat.send(chain);
                });
            });
        }
    }
}


//去除HTML Tag,但不去除换行标签<br>
function filterHTMLTagLight(msg) {
    msg = msg.replace(/<(?!\/?br\/?.+?>)[^<>]*>/g, '');
    return msg;
}

function displayHisInfo(datas) {
    let msg = '🌍 历史上的今天:';
    for (let i=0;i<datas.length;i++){
        msg = msg + '\n' + (i+1) + '.' + `【${datas[i].year}】` + filterHTMLTagLight(datas[i].title) + "。"
    }
    return msg;
}

function getHisInfo(callback) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const today = now.getDate();
    const monthStr = month < 10 ? "0" + month : "" + month;
    const todayStr = today < 10 ? "0" + today : "" + today;
    const config = {
        method: 'get',
        url: `hhttps://baike.baidu.com/cms/home/eventsOnHistory/${monthStr}.json`
    };
    axios(config).then(function (response) {
        callback(response.data[monthStr][monthStr+todayStr])
    }).catch(function (error) {
        console.log(error);
    });
}
