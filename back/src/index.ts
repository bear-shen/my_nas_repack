import {IncomingMessage, ServerResponse} from "http";
import {Fields, Files, PersistentFile} from "formidable";
import Router from "./Router";
import Config from "./Config";
import ErrnoException = NodeJS.ErrnoException;
import Auth from "./lib/Auth";
import {run as runJob} from "./job/BaseJob";

// const Promise = require('Promise');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const server = http.createServer(async function (req: IncomingMessage, res: ServerResponse) {
    // console.info(new URL('http://www.baidu.com/aaa'));
    // console.info(req.method, req.headers);
    //
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.headers.origin)
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    if (req.headers['access-control-request-headers'])
        res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    if (['POST', 'GET',].indexOf(req.method) === -1) {
        res.write('');
        res.end();
        return;
    }
    //
    const urlInfo = new URL(req.url, `http://${req.headers.host}`);
    const authResult = await Auth(urlInfo, req.headers);
    if (!authResult) {
        res.write(JSON.stringify({
            'code': 10,
            'msg': 'no auth',
            'data': null,
        }));
        res.end();
        return;
    }
    // console.info('authInfo', authResult);
    //
    const data = await parseForm(req) as { fields: Fields, files: Array<typeof PersistentFile>, uid: number }
    data.uid = authResult as number;
    //
    let result = null;
    try {
        result = await Router(urlInfo, data);
        result = {
            'code': 0,
            'msg': 'success',
            'data': result,
        };
    } catch (e: any) {
        console.error((e as Error).stack);
        result = {
            'code': 100,
            'msg': `${(e as Error).name}:${(e as Error).message}`,
            'data': (e as Error).stack,
        };
    }
    res.write(JSON.stringify(result));
    res.end();
});
server.listen(Config.port);
console.log("Server runing at port: " + Config.port + ".");

runJob();

function parseForm(req: IncomingMessage): Promise<any> {
    return new Promise((resolve: any) => {
        //@see https://nodejs.org/en/knowledge/HTTP/servers/how-to-handle-multipart-form-data/
        //@see https://github.com/node-formidable/formidable/blob/master/src/Formidable.js
        const form = formidable({
            maxFileSize: 1024 * 1024 * 1024 * 1024,
        });
        // const form = new formidable().IncomingForm();
        form.parse(req, function (err: any, fields: Fields, files: Files) {
            // console.info(fields, files);
            resolve({fields, files});
        });
    });
}