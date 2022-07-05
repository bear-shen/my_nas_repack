import BaseController from "./BaseController";
import {Fields, File, PersistentFile} from "formidable";
import * as fs from "fs/promises";
import * as fsNP from "fs";
import FileModel from "../model/FileModel";
import Config from "../Config";
import NodeModel from "../model/NodeModel";
import ORM from "../lib/ORM";
import FileLib from "../lib/File";
import TagModel from "../model/TagModel";
import TagGroupModel from "../model/TagGroupModel";
import * as Buffer from "buffer";
import QueueModel from "../model/QueueModel";
import UserModel from "../model/UserModel";
import UserGroupModel from "../model/UserGroupModel";
import {FileCol, FileType, NodeCol, nodeDetailFlags, nodeListFields, TagCol, TagGroupCol} from "../columns";


class FileController extends BaseController {
    async upload(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            parent_id: '0',
        }, data.fields);
        await allowWrite(data.uid, Number.parseInt(fields.parent_id));
        // console.info(data);
        const res = [] as any[];
        for (const filesKey in data.files) {
            const file = data.files[filesKey] as unknown as File;
            // const fileHandler = await fs.open(file.filepath, 'r');
            // const rs = fsNP.createReadStream(file.filepath);
            const fileHash = await FileLib.getFileHash(file.filepath);
            // rs.close();
            // const hashPath = FileLib.makeHashPath(fileHash);
            /*console.info(0);
            const fileBuffer = await fs.readFile(file.filepath);
            console.info(1);
            const fileHash = md5(fileBuffer);
            console.info(2);
            const hashPath = makeHashPath(fileHash);
            console.info(3);
            console.info(fileHash, hashPath);*/
            //
            let suffix = FileLib.getSuffixByName(file.originalFilename);
            //types: 'audio','video','image','binary','text'
            let fileType = FileLib.getTypeBySuffix(suffix);
            console.info('fileType:', fileType);
            const fileData = await FileLib.setFile(fileType, fileHash, suffix, file.size, file.filepath);
            const nodeData = await FileLib.setNode(fields.parent_id as string, file.originalFilename, fileData);
            //
            res.push(['success', nodeData, fileData])
        }
        return res;
    }

    async add_folder(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            parent_id: '0',
            title: '',
            description: '',
        }, data.fields);
        let pid = parseInt(fields.parent_id as string);
        await allowWrite(data.uid, pid);
        let parentNode;
        if (pid) parentNode = await (new NodeModel()).where('type', 'directory').where('id', pid).first();
        if (!parentNode) pid = 0;
        const ifDup = await (new NodeModel())
            // .where('id_file', 0)
            .where('id_parent', pid)
            .where('title', fields.title as string)
            .first();
        let nid;
        if (!ifDup) {
            const insNodeResult = await (new NodeModel()).insert({
                id_parent: pid,
                // id_cover: number,
                // id_file: 0,
                type: 'directory',
                title: fields.title as string,
                description: fields.description as string,
                sort: 0,
                status: 1,
                list_node: parentNode ? [...parentNode.list_node, parentNode.id] : [0],
                index_file_id: {},
                list_tag_id: [],
                index_node: {},
            });
            nid = insNodeResult.insertId;
            await (new QueueModel).insert({
                type: 'index/node',
                status: 1,
                payload: {id: nid},
            });
        } else {
            nid = ifDup.id;
        }
        return ['success', ifDup, nid,];
    }

    async edit(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
            title: '',
            description: '',
        }, data.fields);
        await allowWrite(data.uid, Number.parseInt(fields.id));
        if (!fields.title) throw new Error('no title');
        const node = await (new NodeModel()).where('id', fields.id).first();
        if (!node) throw new Error('node not found');
        await (new NodeModel()).where('id', fields.id).update({
            title: fields.title,
            description: fields.description,
        });
        await (new QueueModel).insert({
            type: 'index/node',
            status: 1,
            payload: {id: fields.id},
        });
        return '';
    }

    async move(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
            parent_id: '',
        }, data.fields);
        //
        // if (!fields.parent_id) throw new Error('no parent_id');
        const parentId = Number.parseInt(fields.parent_id as string);
        await allowWrite(data.uid, parentId);
        let parent: NodeCol;
        if (parentId) {
            parent = await (new NodeModel()).where('type', 'directory').where('id', fields.parent_id).first();
            if (!parent) throw new Error('no parent');
        } else {
            parent = {
                id: 0,
                title: 'root',
                id_parent: 0,
                list_node: [],
            };
        }
        if (!fields.id) throw new Error('no id');
        const node = await (new NodeModel()).where('id', fields.id).first();
        if (!node) throw new Error('no node');
        //
        await FileLib.moveFile(node, parent);
    }

    async delete(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
        }, data.fields);
        await allowWrite(data.uid, Number.parseInt(fields.id));
        const node = await (new NodeModel()).where('id', fields.id).first();
        if (!node) throw new Error('no file');
        const targetStatus = node.status ? 0 : 1;
        await (new NodeModel()).where('id', node.id)
            .update({
                status: targetStatus,
            });
        if (node.type !== 'directory') return;
        //文件夹的时候处理一下级联
        if (targetStatus === 0) {
            //删除的时候，级联全部子节点
            await (new NodeModel()).whereRaw('find_in_set( ? , list_node)', node.id)
                .where('status', 1)
                .update({status: -1});
        } else {
            //恢复的时候，只恢复当前一级
            const ifSub = await (new NodeModel())
                .whereRaw('find_in_set( ? , list_node)', node.id)
                .where('status', 0)
                .select();
            const query = (new NodeModel()).whereRaw('find_in_set( ? , list_node)', node.id)
            if (ifSub.length) {
                query.where((subQuery: NodeModel) => {
                    for (let subNode of ifSub) {
                        subQuery.not().whereRaw('find_in_set( ? , list_node)', subNode.id)
                    }
                });
            }
            await query.update({status: 1});
        }
    }

    async delete_forever(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
        }, data.fields);
        await allowWrite(data.uid, Number.parseInt(fields.id));
        await (new QueueModel).insert({
            type: 'file/delete_forever',
            status: 1,
            payload: fields,
        });
    }

    async cover(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id_parent: '',
            id_node: '',
        }, data.fields);
        await allowWrite(data.uid, Number.parseInt(fields.id_parent));
        await FileLib.setCover(
            Number.parseInt(fields.id_parent),
            Number.parseInt(fields.id_node)
        );
    }

    async dir_import(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            dir_path: '',
            dir_id: '',
        }, data.fields);
        await (new QueueModel).insert({
            type: 'file/import',
            status: 1,
            payload: fields,
        });
    }

    //@todo 收藏和分享感觉不大好做。。。涉及到join了但是总之查询没有做
    async favourite(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
        }, data.fields);
        return '';
    }

    //@todo
    async share(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
        }, data.fields);
        return '';
    }

    async list(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: null,
            title: null,
            type: null,
            sort: null,
            tag: null,
            page: null,
            total: null,
            filter: 'normal',
            flag: null,
        }, data.fields) as nodeListFields;
        //
        if (fields.flag) {
            fields.flag = (fields.flag as unknown as string).split('.') as nodeDetailFlags[];
        } else {
            fields.flag = [];
        }
        //
        let isDirectory = fields.filter === 'normal';
        let page = parseInt(fields.page as any);
        page = (page && page > 1) ? page : 1;
        //
        const model = (new NodeModel())
            // .where('status', fields.recycle ? '=' : '<>', 0);
            .where('status', fields.filter === 'recycle' ? 0 : 1);
        //
        const parentId = parseInt(fields.id as string);
        if (parentId === 0) {
            model.where('id_parent', 0);
        } else if (parentId)
            model.where('id_parent', parentId ? parentId : 0);
        else if (
            //不太确定是啥情况下的判断了
            !(fields.title || fields.tag)
            && isDirectory
        )
            model.where('id_parent', 0);
        //
        if (fields.title) {
            let tt = fields.title as string;
            tt = `${tt.trim()}*`.replace(' ', '* ');
            model
                .whereRaw('match (`index_node`) against ( ? in boolean mode)', tt)
                //索引不要做布尔模式，排序好看一点，以及注意因为这里涉及到绑定顺序，所以应该写在所有可能的数据绑定后
                .order('match (`index_node`) against ( ? )', 'desc');
            model._dataset.binds.push(tt);
        }
        //
        if (fields.type) {
            let fType;
            switch (fields.type) {
                case 'any':
                    break;
                default:
                    fType = fields.type;
                    break;
            }
            if (fType) model.where('type', fType);
        }
        //
        switch (fields.sort) {
            default:
            case 'id_asc':
                model.order('id', 'asc');
                break;
            case 'id_desc':
                model.order('id', 'desc');
                break;
            case 'name_asc':
                model.order('title', 'asc');
                break;
            case 'name_desc':
                model.order('title', 'desc');
                break;
            case 'crt_asc':
                model.order('time_create', 'asc');
                break;
            case 'crt_desc':
                model.order('time_create', 'desc');
                break;
            case 'upd_asc':
                model.order('time_update', 'asc');
                break;
            case 'upd_desc':
                model.order('time_update', 'desc');
                break;
        }
        //
        if (fields.tag)
            model.whereRaw(
                'find_in_set( ? , list_tag_id)', fields.tag
            );
        if (!fields.total) {
            model.page(page);
        }
        //
        if (data.uid) {
            const user = await (new UserModel).where('id', data.uid).first();
            if (!user) throw new Error('user not found');
            const group = await (new UserGroupModel).where('id', user.id_group).first();
            const denyRDir = new Set<number>();
            const allowRDir = new Set<number>();
            for (const auth of group.auth) {
                // console.info(auth);
                if (!(
                    auth.id_dir || auth.id_dir === 0
                )) continue;
                if (auth.allow_r)
                    allowRDir.add(auth.id_dir);
                else
                    denyRDir.add(auth.id_dir);
            }
            if (denyRDir.size) {
                // console.info(denyRDir);
                for (let dir of Array.from(denyRDir)) {
                    model.not().whereRaw('find_in_set( ? , list_node)', dir);
                }
                //添加了这个以后自动提示的部分也取不到对应的id了，这样就意味着授权的界面上也不能选到对应的目录
                //感觉有点奇怪，但是总之先这样
                model.not().whereIn('id', Array.from(denyRDir));
            }
            // 允许读取这个感觉没有必要设计，但是前段是做的个开关
            // if (allowRDir.size) {
            //     // console.info(allowRDir);
            //     for (let dir of Array.from(allowRDir)) {
            //         model.whereRaw('find_in_set( ? , list_node)', dir);
            //     }
            // }
        }
        //
        const list = await model.select();
        const size = await model.count();
        //
        let parent: NodeCol;
        if (isDirectory) {
            if (parentId) {
                parent = await (new NodeModel).where('id', parentId).first();
            }
            if (parent) {
                const parentPArr = await nodeProcessor([parent], ['tree']);
                parent = parentPArr[0];
            } else {
                parent = {
                    id: 0,
                    id_parent: 0,
                    type: 'directory',
                    title: 'root',
                    list_node: [],
                    // tree: {id: [0], title: ['root'],},
                    tree: {id: [], title: [],},
                    is_file: false,
                    // is_cover: false,
                } as NodeProcessorExp;
            }
        }
        // console.info(list);
        //
        return {
            cur_dir: parent ? parent : null,
            list: await nodeProcessor(
                list, (
                    fields.flag ?
                        fields.flag as any :
                        ['tree', 'tag', 'file']
                )
            ),
            page: page,
            size: Math.ceil(size / 100),
        };
    }

    async list_subtitle(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            //其实用id也行，不过这样感觉好看一些
            title: null,
        }, data.fields);
        if (!fields.title) throw new Error('no title');
        const suffixIndex = fields.title.lastIndexOf('.');
        const title = fields.title.slice(0, suffixIndex);
        const nodeList = await (new NodeModel).where('status', 1)
            .where('title', 'like', title + '%')
            .where('type', 'subtitle')
            .select(['id', 'title', 'index_file_id',]);
        const fileIdList = [] as number[];
        nodeList.forEach(item => {
            const fidList = item.index_file_id;
            if (fidList.normal) fileIdList.push(fidList.normal);
        })
        if (!fileIdList.length) return [];
        const fileList = await (new FileModel).whereIn('id', fileIdList).select();
        const fileMap = new Map<number, FileCol>();
        fileList.forEach(item => fileMap.set(item.id, item));
        const expList = [] as ({ path: string, sub: string } | NodeCol)[];
        nodeList.forEach(item => {
            const file = fileMap.get(item.index_file_id.normal);
            if (!file) return;
            const filePath = FileLib.makePath('web', file.type, file.hash, file.suffix);
            const sub = item.title.slice(suffixIndex + 1);
            expList.push({
                path: filePath,
                sub: sub,
                id: item.id,
                title: item.title,
            })
        });
        return expList;
    }
}

async function allowWrite(uid: number, nodeId: number) {
    const user = await (new UserModel).where('id', uid).first();
    if (!user) throw new Error('user not found');
    const group = await (new UserGroupModel).where('id', user.id_group).first();
    if (!nodeId) nodeId = 0;
    let node = nodeId ? await (new NodeModel).where('id', nodeId).first() : null;
    if (!node) {
        node = {
            id: 0,
            list_node: [],
        }
    }
    // console.info('allowWrite', group, node);
    // nodeId=Number.parseInt(nodeId);
    // const allowWDir = new Set<number>();
    const denyWDir = new Set<number>();
    for (const auth of group.auth) {
        if (!auth.allow_w)
            denyWDir.add(auth.id_dir);
        // else
        //     allowWDir.add(auth.id_dir);
    }
    // let allowIndex = -1;
    // for (const w of Array.from(allowWDir)) {
    //     allowIndex = Math.max(allowIndex, node.list_node.indexOf(w));
    // }
    let denyIndex = -1;
    for (const w of Array.from(denyWDir)) {
        denyIndex = Math.max(denyIndex, node.list_node.indexOf(w));
    }
    if (denyWDir.has(node.id)) denyIndex = node.list_node.length;
    // if (denyIndex > allowIndex) throw new Error('operate not allowed');
    if (denyIndex != -1) throw new Error('operate not allowed');
    // console.info(
    // allowIndex, allowWDir,
    // denyIndex, denyWDir
    // );
    // throw new Error('epp');
}

interface NodeProcessorExp extends NodeCol {
    is_file?: boolean
    // is_cover?: boolean
    is_fav?: boolean
    cover?: FileCol & { [key: string]: string }
    tree?: { id: number[], title: string[] }
    tag?: (
        TagGroupCol
        // & { dir: { id: number, title: string } }
        // & { tree: { id: number[], title: string[] } }
        & { sub: TagCol[] }
        )[]
    file?: FileCol & { [key: string]: string }
}

//full:  nodeTree file tag
//tree:  nodeTree file
//index: nodeTree
async function nodeProcessor(
    nodeList: NodeCol[],
    flag: Array<nodeDetailFlags> = ['file', 'tree', 'tag',]
): Promise<NodeProcessorExp[]> {
    const nList = nodeList as NodeProcessorExp[];
    //
    const fileIdArr = [] as number[];
    let treeNodeIdArr = [] as number[];
    let tagIdArr = [] as number[];
    for (let i = 0; i < nList.length; i++) {
        // console.info(nList[i]);
        // if (nList[i].id_cover) fileIdArr.push(nList[i].id_cover);
        if (nList[i].index_file_id) {
            for (const fileIdKey in nList[i].index_file_id) {
                fileIdArr.push(nList[i].index_file_id[fileIdKey]);
            }
        }
        if (nList[i].list_node) treeNodeIdArr.push(...nList[i].list_node);
        if (nList[i].list_tag_id) tagIdArr.push(...nList[i].list_tag_id);
        nList[i].is_file = false;
    }
    treeNodeIdArr = Array.from(new Set<number>(treeNodeIdArr));
    // console.info(tagIdArr);
    tagIdArr = Array.from(new Set<number>(tagIdArr));
    // console.info(tagIdArr);
    //cover|file
    if ((flag.indexOf('file') !== -1) && fileIdArr.length) {
        let fileArr = await (new FileModel).whereIn('id', fileIdArr).select();
        const fileMap = new Map<number, FileCol>();
        for (let i = 0; i < fileArr.length; i++) {
            fileMap.set(fileArr[i].id, fileArr[i]);
        }
        for (let i = 0; i < nList.length; i++) {
            if (nList[i].index_file_id.cover) {
                const file = fileMap.get(nList[i].index_file_id.cover);
                if (file) {
                    nList[i].cover = file as FileCol & { [key: string]: string };
                    nList[i].cover.path_cover = FileLib.makePath('web', file.type, file.hash, file.suffix);
                }
            }
            if (nList[i].type !== 'directory') {
                nList[i].is_file = true;
                const file = fileMap.get(nList[i].index_file_id['raw']) as FileCol & { [key: string]: string };
                if (!file) continue;
                for (const fileIdKey in nList[i].index_file_id) {
                    // fileIdArr.push(nList[i].index_file_id[fileIdKey]);
                    const fileId = nList[i].index_file_id[fileIdKey];
                    const sub = fileMap.get(fileId);
                    if (!sub) continue;
                    file['path_' + fileIdKey] = FileLib.makePath('web', sub.type, sub.hash, sub.suffix);
                }
                nList[i].file = file;
            }
        }
    }
    //tree
    if ((flag.indexOf('tree') !== -1) && treeNodeIdArr.length) {
        const nodeArr = await (new NodeModel).whereIn('id', treeNodeIdArr).select(['id', 'title',]);
        const nodeMap = new Map<number, NodeCol>();
        for (let i = 0; i < nodeArr.length; i++) {
            nodeMap.set(nodeArr[i].id, nodeArr[i]);
        }
        for (let i = 0; i < nList.length; i++) {
            const tree = {
                id: [] as number[],
                title: [] as string[],
            };
            if (nList[i].list_node) {
                for (let nodeId of nList[i].list_node) {
                    tree.id.push(nodeId)
                    if (nodeId === 0) tree.title.push('root')
                    else if (!nodeMap.get(nodeId)) tree.title.push('unknown');
                    else tree.title.push(nodeMap.get(nodeId).title);
                }
            }
            nList[i].tree = tree;
        }
    }
    //tag
    if ((flag.indexOf('tag') !== -1) && tagIdArr.length) {
        const tagArr = await (new TagModel).whereIn('id', tagIdArr).select(['id', 'id_group', 'title',]);
        const tagMap = new Map<number, TagCol>();
        let tagGroupIdArr = [] as number[];
        for (let i = 0; i < tagArr.length; i++) {
            tagGroupIdArr.push(tagArr[i].id_group);
            tagMap.set(tagArr[i].id, tagArr[i]);
        }
        if (tagGroupIdArr.length) {
            tagGroupIdArr = Array.from(new Set<number>(tagGroupIdArr));
            const tagGroupArr = await (new TagGroupModel).whereIn('id', tagGroupIdArr).select(['id', 'title',]);
            const tagGroupMap = new Map<number, TagGroupCol>();
            for (let i = 0; i < tagGroupArr.length; i++) {
                tagGroupMap.set(tagGroupArr[i].id, tagGroupArr[i]);
            }
            for (let i = 0; i < nList.length; i++) {
                const itemTagMap = new Map<number, TagGroupCol & { sub: TagCol[] }>();
                for (let j = 0; j < nList[i].list_tag_id.length; j++) {
                    const tagId = nList[i].list_tag_id[j];
                    const tag = tagMap.get(tagId);
                    // const tagGroup = tagGroupMap.get(tag.id_group);
                    itemTagMap.set(
                        tag.id_group,
                        Object.assign(
                            {sub: [] as TagCol[]},
                            tagGroupMap.get(tag.id_group))
                    );
                }
                for (let j = 0; j < nList[i].list_tag_id.length; j++) {
                    const tagId = nList[i].list_tag_id[j];
                    const tag = tagMap.get(tagId);
                    const tagGroup = itemTagMap.get(tag.id_group);
                    tagGroup.sub.push(tag);
                }
                nList[i].tag = Array.from(itemTagMap.values());
            }
        }
    }
    return nList;
}

export default FileController;
