import {createApp, makeAppConfig, MessageChain, Plain, Quote} from "miraipie";
import {Friend} from "../../modules/friend/entities/friend.entity";
import {SourceEnum} from "../../modules/friend/enums/sourceEnum";
import {Group} from "../../modules/group/entities/group.entity";
const L = require('nirvana-logger')('plugins');

export class QQRobot {

    private readonly app;

    constructor(options) {
        this.app = createApp(makeAppConfig(options));
        this.app.listen(8082);
        this.bindEvents();
    }

    bindEvents() {
        this.app.on('listen', () => {
            L('mirai 应用程序监听成功！')
        });
        const _this = this;
        this.app.on('FriendMessage', async (chatMessage) => {
            // 聊天消息类型
            const type = chatMessage.type;
            // 消息发送人
            const sender = chatMessage.sender;
            // 消息链
            const nickname = chatMessage.sender.nickname;
            const id = chatMessage.sender.id;
            const friend = Friend.addFriendIfAbsent(SourceEnum.QQ, id);
            friend.runPlugins(_this.app, chatMessage);
        });
    
        this.app.on('GroupMessage', async (chatMessage) => {
            // console.log(chatMessage.messageChain.f.isType('Plain'))
            // console.log(chatMessage.messageChain.f.isType('At'))
            // console.log(chatMessage.messageChain.f)
            // const chat = new GroupChat(chatMessage.sender);
            // await chat.send(MessageChain.from([Plain('test')]), chatMessage.messageChain.sourceId)
            // await chat.send(MessageChain.from([File('/31b7a564-b10d-11ed-bbe2-5254002fac13', 'test', 477)]), chatMessage.messageChain.sourceId)
            // console.log(await chat.getFileList('1'))
            // console.log(await chat.getFileInfo('/1/查询.sql'))
            // app.httpApi.uploadGroupFile(726839878, '1', 'C:\\Users\\Administrator.DESKTOP-5N6PEI1\\Downloads\\prism.js');
            // await app.httpApi.deleteFile('/31b7a564-b10d-11ed-bbe2-5254002fac13', null, 726839878);
            // console.log(app.api.session)
            // await app.httpApi.uploadImage('group', 'D:\\workspace\\github\\TileGame\\gfx\\trees.png');
            // await app.api.sendFriendMessage(1247959612, MessageChain.from([Image('{BD35CF87-EAC1-A593-24E2-369CDD9DF577}.png')]))
            // console.log(await app.api.deleteFriend(1247959612))
            // console.log(await app.api.sendGroupMessage(726839878, MessageChain.from([At(1247959612), Plain('ree'), File('/60dbe940-bad4-4aea-82d9-8a5552760a14', 'asa', 477)])));
            // 聊天消息类型
            const type = chatMessage.type;
            // 消息发送人
            const sender = chatMessage.sender;
            // 消息链
            const messageChain = chatMessage.messageChain;
            // 群成员名称
            let memberName = sender.memberName;
            // 头衔
            let specialTitle = sender.specialTitle;
            // 成员权限 'OWNER' | 'ADMINISTRATOR' | 'MEMBER'
            let permission = sender.permission;
            // 入群时间戳
            let joinTimestamp = sender.joinTimestamp;
            // 最近发言时间戳
            let lastSpeakTimestamp = sender.lastSpeakTimestamp;
            // 剩余禁言时间(秒)
            let muteTimeRemaining = sender.muteTimeRemaining;
            // 所在群聊
            let groupInfo = sender.group;
            // 群id
            let id = groupInfo.id;
            // 群名
            let groupName = groupInfo.name;
            // 机器人在群中权限
            let groupPermission = groupInfo.permission;
    
            const group = Group.addGroupIfAbsent(SourceEnum.QQ, id);
            group.runPlugins(this.app, chatMessage);
        });
    
    // 监听并处理添加好友申请事件
    this.app.on('NewFriendRequestEvent', async (event) => {
            await _this.app.api.handleNewFriendRequest(
                event.eventId,
                event.fromId,
                event.groupId,
                0,  // 0代表同意添加.
                '你好, 你可以向我发送【帮助】来查询我的功能！'  // 回复的消息
            ).then(res => {
                setTimeout(function () {
                    const chain = MessageChain.from([Plain('你好, 你可以向我发送【帮助】来查询我的功能！')]);
                    _this.app.api.sendFriendMessage(event.fromId, chain);
                }, 1500)
            })
        });
    
    }
}