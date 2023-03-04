import {MessageChain, Plain} from 'miraipie';
import {Plugin} from "../index";
const crypto = require("crypto") ;

export default class PasswordPlugin extends Plugin {
    constructor() {
        super({
            name: "password",
            zhName: "🧾 密码管理",
            desc: `🧾 用户密码管理插件:
    upw [类别] [应用名] [自助记忆词]
    栗子: upw user mysql huangfeng  // 返回mysql用户名
          upw password mysql 123456 // 返回mysql密码
`,
        });
    }

    // @ts-ignore
    async exec(robot, chatMessage) {
        let cmd = chatMessage.messageChain.toDisplayString();
        const cmds = cmd.split(/\s+/);
        if (cmds.length === 4 && cmds[0] === 'upw') {
            let msg = md5(cmds[1] + '-' + cmds[2], cmds[3]);
            const returnMsg =
                `类别: ${cmds[1]}
应用名: ${cmds[2]}
结果: ${msg}
`;
            const chain = MessageChain.from([Plain(returnMsg)]);
            await robot.api.sendFriendMessage(chatMessage.sender.id, chain)
        }
    }
}

export function md5(content, salt) {
    content = content + salt
    let obj = crypto.createHash('md5')
    obj.update(content)
    return obj.digest('hex');
}