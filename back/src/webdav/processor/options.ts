import {IncomingMessage, ServerResponse} from "http";

import {Buffer} from "buffer";
import Lib from "../Lib";

async function process(req: IncomingMessage, body: Buffer, res: ServerResponse) {
    res.setHeader(
        'Allow',
        [
            'OPTIONS',
            'GET',
            'HEAD',
            'POST',
            'DELETE',
            'TRACE',
            'PROPFIND',
            'PROPPATCH',
            'COPY',
            'MOVE',
            'LOCK',
            'UNLOCK',
            'PUT',
        ].join('')
    );
    res.setHeader('Server', 'nodejs-dav/0.1');
    res.setHeader('DAV', '1,2');
    // res.setHeader('DAV', '<http://apache.org/dav/propset/fs/1>');
    res.setHeader('MS-Author-Via', 'DAV');
    return Lib.respCode(res, 200);
}

export default {process};