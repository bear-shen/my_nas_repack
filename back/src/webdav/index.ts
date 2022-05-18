import {IncomingMessage, ServerResponse} from "http";
import ErrorCode from "./ErrorCode";
import Authorize from "./Authorize";
import Config from "../Config";
import Method from "./Method";
import method from "./Method";
import {Buffer,constants as BuffConstants} from "buffer";
console.log(BuffConstants.MAX_LENGTH);

// const Promise = require('Promise');
const http = require('http');

/**
 * propfind
 * 返回401
 * propfind 空数据
 * 返回webdav相关的一些数据
 *
 * options
 * 返回支持的method
 *
 * propfind 请求系统容量
 * 返回容量，但是apache的没做，这边也不管了
 *
 * ---- 添加文件
 * put 文件
 * 201 created 空数据
 * propfind 文件
 * 207 multi 文件信息
 * lock 文件 xml数据
 * 200 ok 返回lock-token
 * unlock 文件 带lock-token
 * 204 no content 空数据
 * head 文件
 * 200 ok 空数据
 * put 文件
 * 204 no content 空数据
 * propfind 文件
 * 207 multi 文件信息
 * 100 continue
 * put 文件 文件数据 Overwrite|translate|Expect
 * 204 no content 空数据
 * propfind 文件
 * 207 multi 文件信息
 *
 * */

const server = http.createServer(async function (req: IncomingMessage, res: ServerResponse) {
    const body = await getRequestBody(req);
    console.info(req.method, req.headers,);
    const authorized = await Authorize.check(req);
    // console.info(authorized);
    if (!authorized) {
        res.setHeader('WWW-Authenticate', 'Basic realm="WebDAV Server"');
        return sendErr(401, res);
    }
    // console.info('func:', Method[req.method as keyof typeof method]);
    if (!Method[req.method as keyof typeof method]) {
        return sendErr(501, res);
    }
    try {
        await Method[req.method as keyof typeof method](req, body, res);
    } catch (e: any) {
        console.error(
            (e as Error).name,
            (e as Error).message,
            (e as Error).stack,
        )
        return sendErr(500, res);
    }
    if (!res.writableEnded) res.end();
});
server.listen(Config.webdav_port);

//@see https://github.com/OpenMarshal/npm-WebDAV-Server/blob/master/src/server/v2/webDAVServer/StartStop.ts#L30
function getRequestBody(req: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve: any) => {
        console.info(req.headers['content-type']);
        const len = req.headers["content-length"] ? Number.parseInt(req.headers["content-length"]) : 0;
        let total = 0;
        const bodyBuffer = Buffer.alloc(len);
        req.on('data', chunk => {
            if (chunk.constructor === String)
                chunk = Buffer.from(chunk);
            bodyBuffer.fill(chunk, total,chunk.length);
            total+=chunk.length;
        });
        req.on('end', () => {
            if (!bodyBuffer.length) return resolve(null);
            resolve(bodyBuffer);
        });
    });
}

function sendErr(code: keyof typeof ErrorCode, res: ServerResponse) {
    let msg = 'unknown error';
    if (ErrorCode[code]) {
        msg = ErrorCode[code];
    }
    res.statusCode = code;
    res.write(`${code} : ${msg}`);
    res.end();
}









