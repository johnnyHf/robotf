export function getClientIp(req) {
    let ipStr = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    const ipReg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (ipStr.split(',').length > 0) {
        ipStr = ipStr.split(',')[0]
    }
    const ip = ipReg.exec(ipStr);
    return ip[0];
}

exports = module.exports = {
    getClientIp
};