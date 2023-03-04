import {RCode} from "../constant/rcode";

export function ok (data) {
    return { msg:'成功', data: data, code: RCode.OK};
}

export function fail () {
    return { msg:'失败', data: null, code: RCode.FAIL};
}

export function error (data) {
    return { msg:'内部异常', data: data, code: RCode.ERROR};
}

exports = module.exports = {
    ok,
    fail,
    error,
};