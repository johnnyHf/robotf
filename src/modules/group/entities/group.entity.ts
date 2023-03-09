import { getCommonPlugins, getIndividualPlugins, runPlugins } from "../../../common/robots/plugins";
import {GroupOptions} from "../interfaces/groupOptions";
const setting = require('../../../common/config/setting.json');

export class Group {
    static groupsPool = {};

    static {
        const robotTypes = setting['robotTypes'];
        for (const type of robotTypes) {
            Group.groupsPool[type] = {};
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

    constructor(options: GroupOptions) {
        this.id = options.id;
        this.type = options.type;
        this.init();
        return this;
    }

    init() {
        this.refreshLastActiveTime();
        this.loadPlugins();
    }

    static getById(type, id) {
        return Group.groupsPool[type][id];
    }

    static deleteGroup(type, id) {
        delete Group.groupsPool[type][id];
    }

    static addGroupIfAbsent(type, id): Group {
        if (!Group.getById(type, id)) {
            Group.groupsPool[type][id] = new Group({
                type: type,
                id: id
            });
        }
        return Group.getById(type, id);
    }

    static reloadAllPlugins() {
        const robotTypes = setting['robotTypes'];
        for (const type of robotTypes) {
            const typeGroupPool = Group.groupsPool[type];
            for (let userId in typeGroupPool) {
                const group = Group.getById(type, userId);
                delete group['plugins'];
                group.loadPlugins();
            }
        }
    }

    loadPlugins() {
        const globalPlugins = getCommonPlugins(this.type, 'global');
        const groupsCommonPlugins = getCommonPlugins(this.type, 'groups');
        const individualPlugins = getIndividualPlugins(this.type, 'groups', this.id);

        this.plugins = globalPlugins.concat(groupsCommonPlugins).concat(individualPlugins)
            .filter(function(value,index,self){
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
