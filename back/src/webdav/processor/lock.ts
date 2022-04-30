import {IncomingMessage, ServerResponse} from "http";

import {Buffer} from "buffer";

async function process(req: IncomingMessage, body: Buffer, res: ServerResponse) {
    return;
}

export default {process};