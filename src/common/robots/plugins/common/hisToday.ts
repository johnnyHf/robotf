import {Chat, MessageChain, Plain} from 'miraipie';
import {Plugin} from "../index";

const axios = require('axios');

export default class HisTodayPlugin extends Plugin {
    constructor() {
        super({
            name: "hisToday",
            zhName: "ð å¾æ¶ä»æ¥",
            desc: `ð åå²ä¸çä»å¤©æä»¶:
    åå²ä¸çä»å¤©
`,
        });
    }

    // @ts-ignore
    async exec(app, chatMessage) {
        let cmd = chatMessage.messageChain.toDisplayString();
        if (cmd === 'åå²ä¸çä»å¤©') {
            getHisInfo(function (datas) {
                Chat.findFriend(chatMessage.sender.id).then(async (chat) => {
                    const chain = MessageChain.from([Plain(displayHisInfo(datas))])
                    await chat.send(chain);
                });
            });
        }
    }
}


//å»é¤HTML Tag,ä½ä¸å»é¤æ¢è¡æ ç­¾<br>
function filterHTMLTagLight(msg) {
    msg = msg.replace(/<(?!\/?br\/?.+?>)[^<>]*>/g, '');
    return msg;
}

function displayHisInfo(datas) {
    let msg = 'ð åå²ä¸çä»å¤©:';
    for (let i=0;i<datas.length;i++){
        msg = msg + '\n' + (i+1) + '.' + `ã${datas[i].year}ã` + filterHTMLTagLight(datas[i].title) + "ã"
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
