import {IncomingMessage, ServerResponse} from "http";

import {Buffer} from "buffer";
import {ReadStream} from "fs";

async function process(req: IncomingMessage, body: ReadStream, res: ServerResponse) {
    return;
}

export default {process};