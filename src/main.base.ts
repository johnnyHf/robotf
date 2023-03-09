import { loadAllPlugins } from './common/robots/plugins';
import {QQRobot} from "./common/robots/qqRobot";
import { WechatRobot } from './common/robots/wechatRobot';
import {SourceEnum} from "./modules/friend/enums/sourceEnum";

const setting = require('./common/config/setting.json');
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



function initMiraiQqRobot() {
    const qqRobot = new QQRobot(require('./common/config/setting.json')[SourceEnum.QQ]);
}

// function initOicqQQRobot() {
//     const client = new QQRobot({qq: setting[SourceEnum.QQ]['accounts'][0]['id']});
// }

function initWechatRobot() {
    const client = new WechatRobot({
    });
}

function initHbsHelper() {
    var hbs = require('hbs'),
	Handlebars = require('handlebars'),
	fs = require('fs'),
	path = require('path'),
	grunt = require('grunt');

    var views = path.resolve('views'),
	dest = path.resolve('dest'),
	filename = path.resolve(views, 'index.hbs'),
	destname = path.resolve(dest, 'index.html'),
	settings = {
		views: views
	},
	options = {
		title: 'hbs without express',
		nick: 'casper',
		settings: settings
	};

    require('./common/lib/hbs-helpers');

    hbs.__express(filename, options, function(err, res){
        grunt.file.write(destname, res);
    });
}
export function init () {
    // initMiraiQqRobot();
    initWechatRobot();
    loadAllPlugins();
    initHbsHelper();
}