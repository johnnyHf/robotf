import {
    Client,
    createClient,
    DiscussMessageEvent,
    EventMap,
    FriendDecreaseEvent,
    FriendIncreaseEvent,
    FriendPokeEvent,
    FriendRecallEvent,
    FriendRequestEvent,
    GroupAdminEvent,
    GroupInviteEvent,
    GroupMessageEvent,
    GroupMuteEvent,
    GroupPokeEvent,
    GroupRecallEvent,
    GroupRequestEvent,
    GroupTransferEvent,
    LoginErrorCode,
    MemberDecreaseEvent,
    MemberIncreaseEvent,
    PrivateMessage,
    PrivateMessageEvent
} from "oicq";
import {GuildMessageEvent} from "oicq/lib/internal/guild";
import {getFrdSysMsg, getGrpSysMsg, pbGetMsg} from "oicq/lib/internal";
import {SourceEnum} from "../../../modules/friend/enums/sourceEnum";
import {Group} from "../../../modules/group/entities/group.entity";
import {Friend} from "../../../modules/friend/entities/friend.entity";
const setting = require('../../config/setting.json') ;
import * as jce from "./jce"

let oicqClient = null;

/** 上线后加载资源 */
async function onlineListener(e: { token: Buffer, nickname: string, gender: number, age: number }) {
    oicqClient.logger.mark("登录成功！。");
}

/**下线事件（网络原因，默认自动重连） */
async function offlineListener(e: { message: string }) {
}

/**下线事件（服务器踢） */
function kickoffListener(e: { message: string }) {
}

function qrcodeListener(e: { image: Buffer }) {
}

function sliderListener(e: { url: string }) {
    console.log("输入ticket：")
    process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
}

function verifyListener(e: { url: string, phone: string }) {
    oicqClient.logger.mark("输入密保手机收到的短信验证码后按下回车键继续。");
    oicqClient.sendSmsCode();
    oicqClient.logger.mark("短信验证码：")
    process.stdin.once("data", (input) => {
        oicqClient.submitSmsCode(input.toString());
    });
}

/**
 * 登录相关错误
 * @param e code -2服务器忙 -3上线失败(需要删token)
 */
function loginErrorListener(e: { code: LoginErrorCode | number, message: string }) {
}

/** 好友申请 */
function friendAddListener(event: FriendRequestEvent) {
}

/** 对方已将你加为单向好友，可回添对方 */
function friendSingleListener(event: FriendRequestEvent) {
}

function friendRequestListener(event: FriendRequestEvent) {
}

/** 加群申请 */
function groupAddListener(event: GroupRequestEvent) {
}

/** 群邀请 */
function groupInviteListener(event: GroupInviteEvent) {
}

function groupRequestListener(event: GroupInviteEvent) {
}

/** 所有私聊消息 */
function privateMessageListener(event: PrivateMessageEvent) {

}

/** 从好友 */
function friendPrivateMessageListener(event: PrivateMessageEvent) {
    const id = event.from_id;
    const friend = Friend.addFriendIfAbsent(SourceEnum.QQ, id);
    friend.runPlugins(oicqClient, event);
}

/** 从群临时会话 */
function groupPrivateMessageListener(event: PrivateMessageEvent) {
}

/** 从其他途径 */
function otherPrivateMessageListener(event: PrivateMessageEvent) {
}

/** 从我的设备 */
function selfPrivateMessageListener(event: PrivateMessageEvent) {
}

/** 所有群消息 */
function groupMessageListener(event: GroupMessageEvent) {
}

/** 普通群消息 */
function normalGroupMessageListener(event: GroupMessageEvent) {
    const id = event.group_id;
    const friend = Group.addGroupIfAbsent(SourceEnum.QQ, id);
    friend.runPlugins(oicqClient, event);
}

/** 匿名群消息 */
function anonymousGroupMessageListener(event: GroupMessageEvent) {
}

/** 讨论组消息 */
function discussMessageListener(event: DiscussMessageEvent) {
}

/** 所有消息 */
function messageListener(event: PrivateMessageEvent | GroupMessageEvent | DiscussMessageEvent) {
}

/** 新增好友事件 */
function noticeFriendIncreaseListener(event: FriendIncreaseEvent) {
}

/** 好友(被)删除事件 */
function noticeFriendDecreaseListener(event: FriendDecreaseEvent) {
}

/** 好友消息撤回事件 */
function noticeFriendRecallListener(event: FriendRecallEvent) {
}

/** 好友戳一戳事件 */
function noticeFriendPokeListener(event: FriendPokeEvent) {
}

/** 入群・群员增加事件 */
function noticeGroupIncreaseListener(event: MemberIncreaseEvent) {
}

/** 踢群・退群事件 */
function noticeGroupDecreaseListener(event: MemberDecreaseEvent) {
}

/** 群消息撤回事件 */
function noticeGroupRecallListener(event: GroupRecallEvent) {
}

/** 管理员变更事件 */
function noticeGroupAdminListener(event: GroupAdminEvent) {
}

/** 群禁言事件 */
function noticeGroupBanListener(event: GroupMuteEvent) {
}

/** 群转让事件 */
function noticeGroupTransferListener(event: GroupTransferEvent) {
}

/** 群戳一戳事件 */
function noticeGroupPokeListener(event: GroupPokeEvent) {
}

/** 所有好友notice事件 */
function noticeFriendListener(event: FriendIncreaseEvent | FriendDecreaseEvent | FriendRecallEvent | FriendPokeEvent) {
}

/** 所有群notice事件 */
function noticeGroupListener(event: MemberIncreaseEvent | MemberDecreaseEvent | GroupRecallEvent | GroupAdminEvent | GroupMuteEvent | GroupTransferEvent | GroupPokeEvent) {
}

/** 所有notice事件 */
function noticeListener(event: Parameters<EventMap["notice.friend"]>[0] | Parameters<EventMap["notice.group"]>[0]) {
}

/** 私聊同步 */
function syncMessageListener(event: PrivateMessage) {
}

/** 消息已读同步 */
function syncReadPrivateListener(event: { user_id: number, time: number }) {
}

function syncReadGroupListener(event: { group_id: number, seq: number }) {
}

function syncReadListener(event: { user_id: number, time: number } | { group_id: number, seq: number }) {
}

/** 隐藏事件: 监听所有收到的包 */
function internalSsoListener(cmd: string, payload: Buffer, seq: number) {
}

/** 隐藏事件: 对方正在输入 */
function internalInputListener(event: { user_id: number, end: boolean }) {
}

/** 频道相关: 频道消息 */
function guildMessageListener(event: GuildMessageEvent) {
}

export function bindClientListeners(client: Client) {
    oicqClient = client;
    const pwd = setting[SourceEnum.QQ]['accounts'][0]['pwd'];
    // client.login(setting[SourceEnum.QQ]['accounts'][0]['pwd']);
    client.on("system.login.qrcode", qrcodeListener).login(pwd)
    client.on("system.login.slider", sliderListener).login(pwd)
    client.on("system.login.device", verifyListener).login(pwd)
    // client.on("system.login.error", loginErrorListener)
    // client.on("system.online", onlineListener)
    // client.on("system.offline.network", offlineListener)
    // client.on("system.offline.kickoff", kickoffListener)

    client.on("request.friend.add", friendAddListener)
    client.on("request.friend.single", friendSingleListener)
    client.on("request.friend", friendRequestListener)

    client.on("request.group.add", groupAddListener)
    client.on("request.group.invite", groupInviteListener)
    client.on("request.group", groupRequestListener)

    client.on("message.private", privateMessageListener)
    client.on("message.private.friend", friendPrivateMessageListener)
    client.on("message.private.group", groupPrivateMessageListener)
    client.on("message.private.other", otherPrivateMessageListener)
    client.on("message.private.self", selfPrivateMessageListener)

    client.on("message.group", groupMessageListener)
    client.on("message.group.normal", normalGroupMessageListener)
    client.on("message.group.anonymous", anonymousGroupMessageListener)

    client.on("message.discuss", discussMessageListener)
    client.on("message", messageListener)

    client.on("notice.friend.increase", noticeFriendIncreaseListener)
    client.on("notice.friend.decrease", noticeFriendDecreaseListener)
    client.on("notice.friend.recall", noticeFriendRecallListener)
    client.on("notice.friend.poke", noticeFriendPokeListener)
    client.on("notice.friend", noticeFriendListener)

    client.on("notice.group.increase", noticeGroupIncreaseListener)
    client.on("notice.group.decrease", noticeGroupDecreaseListener)
    client.on("notice.group.recall", noticeGroupRecallListener)
    client.on("notice.group.admin", noticeGroupAdminListener)
    client.on("notice.group.ban", noticeGroupBanListener)
    client.on("notice.group.transfer", noticeGroupTransferListener)
    client.on("notice.group.poke", noticeGroupPokeListener)
    client.on("notice.group", noticeGroupListener)
    client.on("notice", noticeListener)
    client.on("MessageSvc.PushNotify", function (payload: Buffer) {
        try {
            var nested = jce.decodeWrapper(payload.slice(4))
        } catch {
            var nested = jce.decodeWrapper(payload.slice(15))
        }
        console.log(nested)
        const len = nested.length;
        for (let i=0;i<len;i++) {
            console.log(nested[i])
        }
        switch (nested[5]) {
            case 33: //群员入群
            case 38: //建群
            case 85: //群申请被同意
            case 141: //陌生人
            case 166: //好友
            case 167: //单向好友
            case 208: //好友语音
            case 529: //离线文件
                return pbGetMsg.call(this)
            case 84: //群请求
            case 87: //群邀请
            case 525: //群请求(来自群员的邀请)
                return getGrpSysMsg.call(this)
            case 187: //好友请求
            case 191: //单向好友增加
                return getFrdSysMsg.call(this)
            case 528: //黑名单同步
                return this.reloadBlackList()
        }
    })

    // client.on("sync.message", syncMessageListener)
    // client.on("sync.read.private", syncReadPrivateListener)
    // client.on("sync.read.group", syncReadGroupListener)
    // client.on("sync.read", syncReadListener)

    // client.on("internal.sso", internalSsoListener)
    // client.on("internal.input", internalInputListener)

    // client.on("guild.message", guildMessageListener)

    return client;
}

exports = module.exports = {
    bindClientListeners
};