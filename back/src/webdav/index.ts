import {IncomingMessage, ServerResponse} from "http";
import {fromByteArray} from 'base64-js';
import {Fields, Files, PersistentFile} from "formidable";
import ErrorCode from "./ErrorCode";
import Authorize from "./Authorize";
import Config from "../Config";
import Method from "./Method";
import method from "./Method";
import {Buffer} from "buffer";


// const Promise = require('Promise');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

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

function getRequestBody(req: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve: any) => {
        const bodyBuffers: Buffer[] = [];
        req.on('data', chunk => {
            const buffer = Buffer.from(chunk);
            bodyBuffers.push(buffer);
        });
        req.on('end', () => {
            // console.info('a', a);
            if (bodyBuffers.length) {
                let len = 0;
                for (let i1 = 0; i1 < bodyBuffers.length; i1++) {
                    len += bodyBuffers[i1].length;
                }
                const bodyBuffer = Buffer.concat(bodyBuffers, len);
                resolve(bodyBuffer);
            } else {
                resolve(null);
            }
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








