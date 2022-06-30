import {IncomingMessage, ServerResponse} from "http";
import NodeModel from "../model/NodeModel";
import config from "../Config";
import {ElementCompact} from "xml-js";
import ErrorCode from "./ErrorCode";
import QueueModel from "../model/QueueModel";
import {NodeCol, FileCol} from "../columns";

async function getCurNode(url: URL): Promise<NodeCol | boolean> {
    const rootPos = url.pathname.indexOf(config.webDavRoot);
    const dirPath = url.pathname.substring(rootPos + config.webDavRoot.length);
    const dirTitleArr = [] as string[];
    if (dirPath.length) {
        dirPath.split('/').forEach(p => {
            if (p) dirTitleArr.push(decodeURIComponent(p));
        });
    }
    //
    const dirIdArr = [0];
    let dirNode = {
        id: 0,
        title: '',
        type: 'directory',
        list_node: [],
        time_create: '1970-01-01T00:00:00Z',
        time_update: '1970-01-01T00:00:00Z',
    } as NodeCol;
    for (let i1 = 0; i1 < dirTitleArr.length; i1++) {
        const lastId = dirIdArr[dirIdArr.length - 1];
        console.info('lastId:', lastId);
        // if (!lastId) continue;
        dirNode = await (new NodeModel).where('id_parent', lastId).where('title', dirTitleArr[i1]).first();
        if (!dirNode) return false;
        dirIdArr.push(dirNode.id);
    }
    return dirNode;
}

function respCode(res: ServerResponse, code: number) {
    console.info('resp code:', code);
    res.write(`${code} ${ErrorCode[code as keyof typeof ErrorCode]}`);
    res.statusCode = code;
    res.end();
}

async function mkdir(dirPath: string) {
    const dirTitleArr = [] as string[];
    if (dirPath.length) {
        dirPath.split('/').forEach(p => {
            if (p) dirTitleArr.push(decodeURIComponent(p));
        });
    }
    let last = {
        id: 0,
        title: '',
        type: 'directory',
        time_create: '1970-01-01T00:00:00Z',
        time_update: '1970-01-01T00:00:00Z',
        list_node: [],
    } as NodeCol;
    for (let i1 = 0; i1 < dirTitleArr.length; i1++) {
        const ifExs = await (new NodeModel).where('id_parent', last.id).where('title', dirTitleArr[i1]).first();
        if (ifExs) {
            if (ifExs.status !== 1) {
                await (new NodeModel).where('id', ifExs.id).update({status: 1});
            }
            last = ifExs;
            continue;
        }
        const lastNodeData = {
            id_parent: last.id,
            // id_cover: number,
            // id_file: fid,
            type: 'directory',
            title: dirTitleArr[i1],
            description: '',
            sort: 0,
            // status: hasBuildFile ? 1 : 2,
            status: 1,
            building: 0,
            list_node: [...last.list_node, last.id],
            list_tag_id: [],
            index_node: {},
            index_file_id: {},
        } as NodeCol;
        const newDirRes = await (new NodeModel).insert(lastNodeData);
        lastNodeData.id = newDirRes.insertId;
        last = lastNodeData;
        await (new QueueModel).insert({
            type: 'index/node',
            status: 1,
            payload: {id: lastNodeData.id},
        });
    }
    return last;
}

export default {
    getCurNode,
    respCode,
    // respErr,
    mkdir,
};