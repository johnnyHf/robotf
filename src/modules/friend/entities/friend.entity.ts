import { getCommonPlugins, getIndividualPlugins, runPlugins } from "../../../common/robots/plugins";
import { FriendOptions } from "../interfaces/friendOptions";
const setting = require('../../../common/config/setting.json');


export class Friend {
    static friendsPool = {};

    static {
        const robotTypes = setting['robotTypes'];
        for (const type of robotTypes) {
            Friend.friendsPool[type] = {};
        }
    }

    readonly id;

    /**
     * 来源，qq还是wechat等
     */
    readonly type: string;

    /**
     * 最近一次活跃时间
     */
    lastActiveTime: number;

    /**
     * 加载使用的插件
     */
    plugins : string[];

    constructor(options: FriendOptions) {
        Object.assign(this, options);
        this.init();
        return this;
    }

    init() {
        this.refreshLastActiveTime();
        this.loadPlugins();
    }

    static getById(type, id) {
        return Friend.friendsPool[type][id];
    }

    static deleteFriend(type, id) {
        delete Friend.friendsPool[type][id];
    }

    static addFriendIfAbsent(type, id): Friend {
        if (!Friend.getById(type, id)) {
            Friend.friendsPool[type][id] = new Friend({
                type: type,
                id: id
            });
        }
        return Friend.getById(type, id);
    }

    static reloadAllPlugins() {
        const robotTypes = setting['robotTypes'];
        for (const type of robotTypes) {
            const typeFriendPool = Friend.friendsPool[type];
            for (let userId in typeFriendPool) {
                const friend = Friend.getById(type, userId);
                for (let k in friend) {
                    delete friend[k];
                }
                friend.loadPlugins();
            }
        }
    }

    loadPlugins() {
        const globalPlugins = getCommonPlugins(this.type, 'global');
        const usersCommonPlugins = getCommonPlugins(this.type, 'users');
        const individualPlugins = getIndividualPlugins(this.type, 'users', this.id);

        this.plugins = globalPlugins.concat(usersCommonPlugins).concat(individualPlugins)
            .filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });
    }

    getPlugins () {
        return this.plugins;
    }

    runPlugins (robot, chatMsg) {
        runPlugins(this.getPlugins(), robot, chatMsg);
    }

    refreshLastActiveTime() {
        this.lastActiveTime = new Date().getTime();
    }

    getLastActiveTime() {
        return this.lastActiveTime;
    }


}
