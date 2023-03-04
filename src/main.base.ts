import { loadAllPlugins } from './common/robots/plugins';
import {QQRobot} from "./common/robots/qqRobot";
import {SourceEnum} from "./modules/friend/enums/sourceEnum";

// @ts-ignore
String.prototype.signMix= function() {
    if(arguments.length === 0) return this;
    let param = arguments[0], str= this;
    if(typeof(param) === 'object') {
        for(const key in param)
            str = str.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
        return str;
    } else {
        for(let i = 0; i < arguments.length; i++)
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return str;
    }
}

const qqRobot = new QQRobot(require('./common/config/setting.json')[SourceEnum.QQ]);

export function init () {
    loadAllPlugins();
}