const fs = require('fs');
const path = require('path');
import { bindClientListeners } from './events/wechatEvents';
const Wechat = require('wechat4u');

//存登录信息目录
const lastLoginPath = './src/common/config/wechat_last_login.json';

export class WechatRobot {

    private readonly app;
    constructor(options) {
        //从之前保存的数据登录
        try {
            const user_data = JSON.parse(fs.readFileSync(path.join(__dirname, lastLoginPath)).toString())
            this.app = new Wechat(user_data)
        } catch (e) {
            this.app = new Wechat()
        }
        
        //启动
        if (this.app.PROP.uin) {
            this.app.restart()
        } else {
            this.app.start()
        }

        //登录成功事件
        this.app.on('login', () => {
            console.log('登录成功')
            // 保存数据，将数据序列化之后保存到任意位置
            fs.writeFileSync(path.join(__dirname, lastLoginPath), JSON.stringify(this.app.botData))
        })

        //登出成功事件
        this.app.on('logout', () => {
            console.log('登出成功')
            // 清除数据
            fs.unlinkSync(path.join(__dirname, lastLoginPath))
        })

        bindClientListeners({
            client: this.app
        });
    }
}