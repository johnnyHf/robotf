
export interface CardMessage {
    brief: String,
    title?: string,
    summary?: string,
    targetUrl: String,
    source: String,
    img?: string
}

export interface ButtonInfo {
    name: String,
    url?: string
}

export interface ExtraInfos {
    title?: string,
    brief?: String,
    source?: string,
    layout?: number,
}

export function cardVedioMsg() {
    return `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><msg serviceID="107" templateID="14" action="web" actionData=" 资源群:424714996" brief="QQ群424714996" sourcePublicUin="3043786528" sourceMsgId="1495460701626432" url="http://fc.liflag.cn/?" flag="0" adverSign="0" multiMsgFlag="0">
    <item layout="1"><vote cover="http://gchat.qpic.cn/gchatpic_new/1169088181/4177879595-3121117498-74EB28C523F12CE933EEF3BCF50D4ED1/0" />
    </item>
    <item layout="0">
    <hr hidden="false" style="0" />
    </item>
    <source name="" icon="" action="" appid="0" />
</msg>`;
//     return `<?xml version="1.0" encoding="utf-8"?>
// <msg serviceID="1" templateID="" action="web" url="" sourceMsgId="0" flag="2" adverSign="0" multiMsgFlag="0">
//     <item layout="4">
//         <picture cover="https://pic.rmb.bdstatic.com/bjh/down/8fc7b66ad3696721828642a66709833b.gif"/>
//         <picture cover="https://pic.rmb.bdstatic.com/bjh/down/8fc7b66ad3696721828642a66709833b.gif"/>
//         <picture cover="https://pic.rmb.bdstatic.com/bjh/down/8fc7b66ad3696721828642a66709833b.gif"/>
//         <picture cover="https://pic.rmb.bdstatic.com/bjh/down/8fc7b66ad3696721828642a66709833b.gif"/>
//         <title>asas</title>
//     </item>
// </msg>`
}

export function cardMsg(cardMessage: CardMessage, options?: ExtraInfos) {
    return `<?xml version="1.0" encoding="utf-8"?>
<msg serviceID="1" brief="${cardMessage.brief}" templateID="123" action="web" url='${cardMessage.targetUrl}' sourceMsgId="0" flag="2" adverSign="0" multiMsgFlag="0">
    <item layout="${options? options.layout || 0 : 0}">
        <title color="#000000" size="35" style="1">${cardMessage.title}</title>
        ${cardMessage.summary? '<summary>' + cardMessage.summary + '</summary>' : ''}
        <picture cover="${cardMessage.img}"  />
    </item>
    <source name="${cardMessage.source}" icon=""/>
</msg>`;
}



export function btnListCardMsg(btns:ButtonInfo[], extraInfos: ExtraInfos) {
    let buttons = '';
    const len = btns.length;
    let itemL = '<item layout="3">';
    let itemR = '</item>';
    for (let i=0;i<len;i++) {
        if (i % 2 == 0) {
            buttons += itemL;
        }
        buttons += `<button action="web" url="${btns[i].url}">${btns[i].name}</button>`;
        if (i % 2 == 1) {
            buttons += itemR;
        }
    }
    if (len % 2 == 1) {
        buttons += `<button></button>`;
        buttons += itemR;
    }

    return `<?xml version="1.0" encoding="utf-8"?>
    <msg  serviceID="1" brief="${extraInfos.brief}" templateID="" action="web" sourceMsgId="0" flag="1" adverSign="0" multiMsgFlag="0">
        <item layout="1">
        <title color="red" size="30" align="center">      
                    😸 功能列表 🐶</title>
        </item>
        ${buttons}
        <source name="${extraInfos.source}" icon=""/>
    </msg>`;
}

export function startQQ(type, qqnum) {
    let url = '';
    switch (type) {
        case 1:
            // 直接进入QQ聊天(对QQ号)
            url = "mqqwpa://im/chat?chat_type=wpa&uin=" + qqnum;
            break;
        case 2:
            // 打开个人介绍界面（对QQ号）
            url = "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=" + qqnum
                + "&card_type=person&source=qrcode";
            break;
        case 3:
            // 打开QQ群介绍界面(对QQ群号)
            url = "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=" + qqnum
                + "&card_type=group&source=qrcode";
            break;

        default:
            break;
    }
    return url;
}

exports = module.exports = {
    cardMsg,
    cardVedioMsg,
    btnListCardMsg
};
