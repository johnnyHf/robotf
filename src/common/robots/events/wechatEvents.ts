
import { Friend } from '../../../modules/friend/entities/friend.entity';
import { SourceEnum } from '../../../modules/friend/enums/sourceEnum';
const qrcodeTerminal = require('qrcode-terminal');
let client = null;

function uuid(uuid) {
    qrcodeTerminal.generate('https://login.weixin.qq.com/l/' + uuid, {
        small: true
    })
    console.log('二维码登录链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
}


function error(err) {
    console.error('错误：', err)
}

function groupMessage(msg) {

}

function privateMessage(msg) {
    const friend = Friend.addFriendIfAbsent(SourceEnum.Wechat, msg.FromUserName);
    friend.runPlugins(client, msg);
}

function message(msg) {
    if (!msg.isSendBySelf) { //文本消息且不是自己发送的
        const contact = client.contacts[msg.FromUserName] //会话对象

        if (client.Contact.isRoomContact(contact)) { //如果是群组会话
            groupMessage(msg);
        } else {    //个人消息
            privateMessage(msg);
        }

    } else {
        privateMessage(msg);
    }
}

export function bindClientListeners(options) {
    client = options.client;
    //扫码登录
    client.on('uuid', uuid);

    //错误事件
    client.on('error', error);

    //处理消息
    client.on('message', message);
    
}

exports = module.exports = {
    bindClientListeners
};