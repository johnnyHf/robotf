
import {getFileList} from '../../utils/fileUtil';
import {MessageChain, Plain} from "miraipie";
const path = require('path');
const L = require('nirvana-logger')('plugins');

let setting = require('../../config/setting.json');
export let ALL_PLUGINS = {}
let ALL_PLUGINS_FILES = []

export class Plugin {
    /**
     * 插件名
     */
    public name: string;

    /**
     * 中文名
     */
    public zhName: string;

    /**
     * 描述
     */
    public desc: string;

    /**
     * 插件运行调用函数
     */
    public exec: ()=>{};

    constructor(options) {
        Object.assign(this, options);
    }
}

export function reloadAll() {
    delete require.cache[require.resolve('../../config/setting.json')];
    setting = require('../../config/setting.json') ;
    L('卸载所有插件...');
    ALL_PLUGINS_FILES = []
    for (let name in ALL_PLUGINS) {
        delete ALL_PLUGINS[name];
    }
    for (let filePath in ALL_PLUGINS_FILES) {
        delete require.cache[require.resolve(filePath)];
    }
    L('所有插件卸载完成.');
    loadAllPlugins();
}

export function loadAllPlugins() {
    console.log(1111111)
    const pluginDirPath = path.join(__dirname, '../', setting.plugins_path);
    const files = getFileList(pluginDirPath);
    L('加载所有插件...');
    for (const file of files) {
        if (file.filename === 'index.ts') {
            continue;
        }
        const plugin = loadPlugin(pluginDirPath, file);
        if (!plugin) {
            L(`error => 路径【${path}】下的插件加载失败!`);
        }
    }
    L('所有插件加载完成...');
}
type Constructor<T = any> = new (...args: any[]) => T;

// @ts-ignore
const Factory = <T>(target: Constructor<T>): T => {
    // 获取所有注入的服务
    const providers = Reflect.getMetadata('design:paramtypes', target); // [OtherService]
    if (providers)  {
        const args = providers.map((provider: Constructor) => new provider());
        return new target(...args);
    }
    return new target();
};


async function loadPlugin(pluginDirPath, file) {
    let plugin = null;

    if (!ALL_PLUGINS_FILES.includes(file.path + file.filename)) {
        const relativePluginPath = file.path.replace(pluginDirPath, '');
        const pluginClass = require('../plugins' + relativePluginPath + file.filename.replace('.ts', '')).default;
        // const plugin = Factory(pluginClass);
        const plugin = Reflect.construct(pluginClass, pluginClass);
        // @ts-ignore
        ALL_PLUGINS[plugin.name] = plugin;
        ALL_PLUGINS_FILES.push(path);
    }
    return plugin;
}

/**
 * 运行插件集合
 * @param plugins
 * @param robot
 * @param chatMsg
 */
export function runPlugins(plugins, robot, chatMsg) {
    if (!plugins || plugins.length == 0) {
        return;
    }
    for (let pluginName of plugins) {
        const plugin = getPlugin(pluginName);
        if (plugin == null) {
            L('error =>', `插件${pluginName}不存在`)
            continue;
        }
        try {
            plugin.exec(robot, chatMsg);
        } catch (e) {
            L(e)
            robot.api.sendFriendMessage(chatMsg.sender.id, MessageChain.from([Plain(`出错了，缓口气吧。`)]), chatMsg.messageId);
        }
    }
}

/**
 * 根据插件名获取插件
 * @param name
 * @returns {*}
 */
export function getPlugin(name) {
    return ALL_PLUGINS[name];
}

/**
 * 获取公共插件
 * @param robotType 'qq' | 'wechat' | 'feishu'
 * @param type 'global' | 'users' | 'groups'
 * @returns {*}
 */
export function getCommonPlugins(robotType, type) {
    let commonPlugins = [];
    if (type === 'global') {
        commonPlugins = setting[robotType][type]['plugins'];
    } else {
        commonPlugins = setting[robotType][type]['common']['plugins'];
    }
    return commonPlugins;
}

/**
 * 运行某一个人或某一个聊天群的所有插件
 * @param robotType 'qq' | 'wechat' | 'feishu'
 * @param type 'user' | 'groups'
 * @param id
 */
export function getIndividualPlugins(robotType, type, id) {
    const typeMsgConfig = setting[robotType][type][id];
    if (typeMsgConfig) {
        return typeMsgConfig['plugins'];
    }
    return [];
}

