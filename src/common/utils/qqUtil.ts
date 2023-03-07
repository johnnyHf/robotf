
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
    return `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>
<msg serviceID="1" templateID="-1" action="app" actionData="com.tencent.tmgp.sgame" brief="test" sourceMsgId="0" url="https://camo.githubusercontent.com/98d75bc87e2b9e0d1245e6f877839590aacc67b144432c7823f535da79bee51e/68747470733a2f2f6769746875622d726561646d652d73746174732e76657263656c2e6170702f6170693f757365726e616d653d61697975656b75616e67?username=<script>alert(12121);</script>" flag="2" adverSign="0" multiMsgFlag="0">
    <item layout="12" advertiser_id="0" aid="0">
        <vote cover="https://camo.githubusercontent.com/98d75bc87e2b9e0d1245e6f877839590aacc67b144432c7823f535da79bee51e/68747470733a2f2f6769746875622d726561646d652d73746174732e76657263656c2e6170702f6170693f757365726e616d653d61697975656b75616e67" />
        <title>●</title>
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
