import config from "../Config";

const util = require('util');
const exec = util.promisify(require('child_process').exec);
//
import NodeModel from "../model/NodeModel";
import FileModel from "../model/FileModel";
import FileLib from "../lib/File";
import * as ffmpeg from "../lib/FFmpeg";
import * as fs from "fs/promises";
import * as fsNP from "fs";
import ORM from "../lib/ORM";
import nodeModel from "../model/NodeModel";
import QueueModel from "../model/QueueModel";

//

async function buildNode(payload: any) {
    payload = Object.assign({
        id: 0,
    }, payload);
    if (!payload.id) return;
    console.info(payload);
    const node = await (new NodeModel).where('id', payload.id).first();
    if (!node) throw new Error(`${payload.id} node not found`);
    if (!node.index_file_id || !node.index_file_id.raw) throw new Error(`${payload.id} node has no file`);
    // console.info(node);
    const rawId = node.index_file_id.raw;
    const rawFile = await (new FileModel).where('id', rawId).first();
    // console.info(rawId, rawFile);
    if (!rawFile) throw new Error(`${rawId} file not found`);
    //
    const rawPath = FileLib.makePath('local', rawFile.type, rawFile.hash, rawFile.suffix);
    let parseStr = {
        cover: [false as string | boolean, null as string,],
        preview: [false as string | boolean, null as string,],
        normal: [false as string | boolean, null as string,],
    } as { [key: string]: any };
    let shouldParse = false;
    let fileMeta;
    switch (rawFile.type) {
        case 'image':
            console.info('#', rawPath);
            fileMeta = await ffmpeg.loadMeta(rawPath);
            parseStr.cover = [await ffmpeg.imageStr('cover', fileMeta), config.fileParseConfig.i_cover.format,];
            parseStr.preview = [await ffmpeg.imageStr('preview', fileMeta), config.fileParseConfig.i_preview.format,];
            parseStr.normal = [await ffmpeg.imageStr('normal', fileMeta), config.fileParseConfig.i_normal.format,];
            shouldParse = true;
            break;
        case 'video':
            console.info('#', rawPath);
            fileMeta = await ffmpeg.loadMeta(rawPath);
            parseStr.cover = [await ffmpeg.imageStr('cover', fileMeta), config.fileParseConfig.i_cover.format,];
            parseStr.preview = [await ffmpeg.imageStr('preview', fileMeta), config.fileParseConfig.i_preview.format,];
            parseStr.normal = [await ffmpeg.videoStr(fileMeta), config.fileParseConfig.v_normal.format,];
            shouldParse = true;
            break;
        case 'audio':
            console.info('#', rawPath);
            fileMeta = await ffmpeg.loadMeta(rawPath);
            parseStr.cover = [await ffmpeg.imageStr('cover', fileMeta), config.fileParseConfig.i_cover.format,];
            parseStr.preview = [await ffmpeg.imageStr('preview', fileMeta), config.fileParseConfig.i_preview.format,];
            parseStr.normal = [await ffmpeg.audioStr(fileMeta), config.fileParseConfig.a_normal.format,];
            shouldParse = true;
            break;
        case 'subtitle':
            console.info('#', rawPath);
            fileMeta = await ffmpeg.loadMeta(rawPath);
            parseStr.normal = [await ffmpeg.subtitleStr(fileMeta), config.fileParseConfig.stt_normal.format,];
            shouldParse = true;
            break;
    }
    if (!shouldParse) return;
    const targetFileIndex = Object.assign({
        // cover: 0,
        // preview: 0,
        // normal: 0,
        raw: 0,
    }, node.index_file_id);
    let dirIndex = null;
    let dirPath = null;
    for (const showType in parseStr) {
        if (!Object.prototype.hasOwnProperty.call(parseStr, showType)) continue;
        //在meta数据不正常的情况下可能会返回false
        if (!parseStr[showType] || parseStr[showType][0] === false) continue;
        //如果返回''或null说明无需转换
        if (!parseStr[showType][0]) {
            targetFileIndex[showType] = targetFileIndex.raw;
            continue;
        }
        const tmpPath = FileLib.makePath('local', 'temp', rawFile.hash, showType + '.' + parseStr[showType][1]);
        //
        await FileLib.makeFileDir(tmpPath, false);
        const str = parseStr[showType][0]
            .replace('{resource}', rawPath)
            .replace('{target}', tmpPath);
        console.info(str);
        let targetFRS = null;
        try {
            const {stdout, stderr} = await exec(str);
            targetFRS = fsNP.createReadStream(tmpPath);
        } catch (e: any) {
            console.info((e as Error).name, (e as Error).message, (e as Error).stack,);
            throw new Error('error occurred on exec');
        }
        if (!targetFRS) continue;
        //
        const targetMD5 = await FileLib.getFileMD5(targetFRS);
        targetFRS.close();
        //
        const ifDupFile = await (new FileModel).where('hash', targetMD5).first();
        if (ifDupFile) {
            targetFileIndex[showType] = ifDupFile.id;
            await fs.unlink(tmpPath);
            continue;
        }
        const fStat = await fs.stat(tmpPath);
        //只有图片的normal是图片，其他都是原始类型
        let fileType = 'image';
        if (showType === 'normal') fileType = rawFile.type;
        const targetRelPath = FileLib.makePath('rel', fileType, rawFile.hash, parseStr[showType][1]);
        const insFileResult = await (new FileModel).insert({
            hash: targetMD5,
            type: fileType,
            suffix: parseStr[showType][1],
            path: targetRelPath,
            meta: {},
            size: fStat.size,
            status: 1,
        });
        targetFileIndex[showType] = insFileResult.insertId;
        //
        const targetPath = FileLib.makePath('local', fileType, targetMD5, parseStr[showType][1]);
        console.info('rn', tmpPath, targetPath);
        await FileLib.makeFileDir(targetPath, false);
        await fs.rename(tmpPath, targetPath);
        await (new NodeModel).where('id', node.id).update({
            building: 0,
        });
        //临时文件夹定位
        dirIndex = tmpPath.lastIndexOf('/');
        dirPath = tmpPath.slice(0, dirIndex);
    }
    //临时文件夹清理一下
    if (dirPath) {
        FileLib.deleteFile(dirPath, 2);
    }
    //
    await (new NodeModel).where('id', node.id).update({index_file_id: targetFileIndex});
    // await (new NodeModel).where('id', node.id).update({index_file_id: targetFileIndex,status:1});
    //处理一下封面
    if (targetFileIndex.cover) {
        const parentNode = await (new NodeModel).where('id', node.id_parent).first();
        if (parentNode) {
            if (!parentNode.index_file_id.cover) {
                parentNode.index_file_id.cover = targetFileIndex.cover;
                await (new NodeModel).where('id', parentNode.id).update({
                    index_file_id: parentNode.index_file_id
                });
            }
        }
    }
}

// async function setNodeStatus(id: number, code: number) {
//     await (new NodeModel).where('id', id).update({status: code});
// }
async function importFile(payload: any,) {
    payload = Object.assign({
        dir_path: '',
        dir_id: 0,
    }, payload);
    if (!payload.dir_path) return;
    console.info(payload);
    await dirImport(payload.dir_path, payload.dir_id);
}

async function dirImport(dirPath: string, dirId: number) {
    // dirent没有文件大小。。。
    // const fList = await fs.readdir(dirPath,{withFileTypes:true});
    const fList = await fs.readdir(dirPath);
    for (const name of fList) {
        //不导入隐藏文件
        if (name.indexOf('.') === 0) continue;
        const fPath = `${dirPath}/${name}`;
        const stat = await fs.stat(fPath);
        if (stat.isDirectory()) {
            const nodeInfo = await addNode({
                id_parent: dirId,
                type: 'directory',
                title: name,
                // list_node:null,
            });
            await (new QueueModel).insert({
                type: 'index/node',
                status: 1,
                payload: {id: nodeInfo.id},
            });
            await dirImport(fPath, nodeInfo.id);
            console.info(nodeInfo.index_node, nodeInfo.title);
        } else if (stat.isFile()) {
            const rs = fsNP.createReadStream(fPath);
            const fileHash = await FileLib.getFileMD5(rs);
            rs.close();
            // const hashPath = FileLib.makeHashPath(fileHash);
            //
            let suffix = FileLib.getSuffixByName(name);
            //types: 'audio','video','image','binary','text'
            let fileType = FileLib.getTypeBySuffix(suffix);
            console.info('fileType:', fileType);
            const fileData = await FileLib.setFile(fileType, fileHash, suffix, stat.size, fPath, true);
            const nodeData = await FileLib.setNode(`${dirId}` as string, name, fileData);
            console.info(nodeData.index_node, nodeData.title);
        }
    }
}

async function addNode(data: NodeCol): Promise<NodeCol> {
    const parentNode = await (new NodeModel).where('id', data.id_parent).first();
    const ifNode = await (new NodeModel)
        .where('id_parent', data.id_parent)
        .where('title', data.title)
        .first();
    if (ifNode) return ifNode;
    data.list_node = [...parentNode.list_node, parentNode.id];
    const insNodeResult = await (new NodeModel).insert(data);
    data.id = insNodeResult.insertId;
    return data;
}

async function deleteForever(payload: any,) {
    payload = Object.assign({
        id: 0,
    }, payload);
    const curNode = await (new NodeModel).where('id', payload.id).first();
    if (!curNode) throw new Error('node not found');
    //只有当前节点是被删除的节点才能删除
    if (curNode.status > 0) return;
    const affectNodes = new Set<number>();
    const affectFiles = new Set<number>();
    affectNodes.add(curNode.id);
    for (const type in curNode.index_file_id) {
        affectFiles.add(curNode.index_file_id[type])
    }
    if (curNode.type === 'directory') {
        const subNodeList = await (new NodeModel).whereRaw('find_in_set( ? , list_node)', curNode.id)
            .select(['id', 'type', 'index_file_id']);
        if (subNodeList) {
            subNodeList.forEach(subNode => {
                affectNodes.add(subNode.id);
                for (const type in subNode.index_file_id) {
                    affectFiles.add(subNode.index_file_id[type])
                }
            });
        }
    }
    //先删node再删file，不然文件计数器无法清空
    await (new NodeModel).whereIn('id', Array.from(affectNodes)).delete();
    for (const fileId of Array.from(affectFiles)) {
        await FileLib.deleteForever(fileId);
    }
}

async function getNodeList(nodeId: number) {

}

export {buildNode, importFile, deleteForever,};
