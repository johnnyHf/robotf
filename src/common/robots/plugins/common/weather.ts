import {Chat, MessageChain, Plain, Quote, Xml} from 'miraipie';
import {Plugin} from "../index";
import {cardMsg} from "../../../utils/qqUtil";
const axios = require('axios');
const setting = require('../../../config/setting.json') ;
const citys = require('../../../config/adcode.json');
const weatherEmojis = require('../../../config/weather.json');

export default class Weather extends Plugin {
    constructor() {
        super({
            name: "weather",
            zhName: "🌤 天气插件",
            desc: `🌤 天气插件:
    重庆天气 | 渝北天气
`,
        });
    }

    // @ts-ignore
    async exec(robot, chatMsg) {
        const cmd = chatMsg.messageChain.toDisplayString();
        const sendId = chatMsg.sender.id;

        if (cmd.endsWith('天气') || cmd.endsWith('气候')) {
            const city = cmd.substring(0, cmd.length - 2);
            let adcode = citys[city];
            let tryCount = 0
            const suffix = ['省', '市', '区', '县']
            while (!adcode && tryCount <= 3) {
                adcode = citys[city + suffix[tryCount]]
                tryCount += 1;
            }
            if (!adcode) {
                Chat.findFriend(chatMsg.sender.id).then(async (chat) => {
                    const chain = MessageChain.from([Quote(chatMsg.messageChain.messageId, null, sendId, chatMsg.messageChain)
                        , Plain('不支持查询的地名或者命令错误！')])
                    await chat.send(chain);
                });
            }
            queryWeather(adcode, function (cityInfo) {
                notifyUserWeather(cityInfo, chatMsg.sender.id)
            });
        }
    }
}
function displayWeather(cityInfo) {
    if (cityInfo && cityInfo.status !== '1') {
        return '查询天气失败，请稍后再试！'
    }
    const live = cityInfo.lives[0];

    const detail = `温度: ${live.temperature}℃
风向: ${live.winddirection}
风力等级: ${live.windpower}
空气湿度: ${live.humidity}
播报时间: ${live.reporttime}`
    const xmlCard = cardMsg({
        brief: '天气信息',
        title: `${live.city} ${live.weather}`,
        summary: detail,
        targetUrl: 'https://wttr.in/',
        img: setting['host'] + ':' + setting['port'] + '/static/images/weather.png',
        source: `${live.province} | ${live.city}`
    }, {
        layout: 2
    });
    return Xml(xmlCard);

//     const msg = `城市: ${live.province} | ${live.city}
// 天气: ${weatherEmojis[live.weather] ? weatherEmojis[live.weather] : ''} ${live.weather}
// 温度: ${live.temperature}℃
// 风向: ${live.winddirection}
// 风力等级: ${live.windpower}
// 空气湿度: ${live.humidity}
// 播报时间: ${live.reporttime}`
//     return Plain(msg);
}

function notifyUserWeather(cityInfo, userId) {
    Chat.findFriend(userId).then(async (chat) => {
        // @ts-ignore
        const chain = MessageChain.from([displayWeather(cityInfo)])
        await chat.send(chain);
    });
}

function queryWeather(adcode, callback) {
    const config = {
        method: 'get',
        url: `https://restapi.amap.com/v3/weather/weatherInfo?key=${setting.weather.gaode_keys}&city=${adcode}`
        // url: `https://wttr.in/`
    };
    axios(config).then(function (response) {
        callback(response.data)
    }).catch(function (error) {
        console.log(error);
    });
}