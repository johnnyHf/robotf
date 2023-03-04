//获取项目工程里的图片
const fs = require('fs');
const image = require("imageinfo");

function readFileList(path, filesList) {
    const files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
        const stat = fs.statSync(path + itm);
        if (stat.isDirectory()) {
            //递归读取文件
            readFileList(path + itm + "/", filesList)
        } else {
            const obj = {
                path: undefined,
                filename: undefined
            };
            //定义一个对象存放文件的路径和名字
            obj.path = path;
            obj.filename = itm;
            filesList.push(obj);
        }

    })

}
//获取文件夹下的所有文件
export function getFileList(path) {
    const filesList = [];
    readFileList(path + '/', filesList);
    return filesList;
}

//获取文件夹下的所有图片
export function getImageFiles(path) {
    const imageList = [];

    this.getFileList(path + '/').forEach((item) => {
        const ms = image(fs.readFileSync(item.path + item.filename));

        ms.mimeType && (imageList.push(item.filename))
    });
    return imageList;

}
exports = module.exports = {
    getFileList: getFileList,
    getImageFiles: getImageFiles
};