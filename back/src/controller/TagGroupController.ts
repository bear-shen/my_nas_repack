import BaseController from "./BaseController";
import {Fields, PersistentFile} from "formidable";
import QueueModel from "../model/QueueModel";
import TagModel from "../model/TagModel";
import TagGroupModel from "../model/TagGroupModel";
import NodeModel from "../model/NodeModel";

class TagGroupController extends BaseController {
    async mod(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
            title: '',
            description: '',
            sort: '',
            status: '',
            id_dir: '',
        }, data.fields);
        let id = parseInt(fields.id);
        if (id) {
            const item = await (new TagGroupModel).where('id', id).first();
            if (!item) throw new Error('group not found');
            await (new TagGroupModel).where('id', id).update({
                title: fields.title,
                description: fields.description,
                id_dir: fields.id_dir ? fields.id_dir : 0,
                status: fields.status ? fields.status : 1,
            });
        } else {
            const res = await (new TagGroupModel).insert({
                title: fields.title ? fields.title : '',
                description: fields.description ? fields.description : '',
                sort: fields.sort ? fields.sort : '',
                status: fields.status ? fields.status : '',
                id_dir: fields.id_dir ? fields.id_dir : '',
            });
            id = res.insertId;
        }
        return id;
    }

    async delete(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
        }, data.fields);
        const item = await (new TagGroupModel).where('id', fields.id).first();
        if (!item) throw new Error('group not found');
        await (new TagGroupModel).where('id', fields.id).update({status: 0});
        return fields.id;
    }

    async list(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id_dir: '',
            title: '',
            with_tag: '',
        }, data.fields);
        const model = (new TagGroupModel).where('status', 1);
        if (fields.title) {
            model.where('title', 'like', `%${fields.title}%`)
        }
        const list = await model.select() as TagGroupExp[];
        const dirIdSet = new Set<number>();
        const groupIdSet = new Set<number>();
        for (let i = 0; i < list.length; i++) {
            dirIdSet.add(list[i].id_dir);
            groupIdSet.add(list[i].id);
        }
        //
        const dirIdList = Array.from(dirIdSet).filter(i => i > 0);
        const dirMap = new Map<number, NodeCol>();
        if (dirIdList.length) {
            const dirList = await (new NodeModel).whereIn('id', dirIdList).select(['id', 'list_node', 'title']);
            const dirIdSet2 = new Set<number>();
            dirList.forEach(item => {
                for (const dirId of item.list_node) {
                    dirIdSet2.add(dirId);
                }
                dirMap.set(item.id, item);
            })
            const dirIdList2 = Array.from(dirIdSet2).filter(i => i > 0);
            if (dirIdList2.length) {
                const dirList2 = await (new NodeModel).whereIn('id', dirIdList2).select(['id', 'list_node', 'title']);
                dirList2.forEach(item => {
                    dirMap.set(item.id, item);
                })
            }
        }
        //
        let tagList = [] as TagCol[];
        if (fields.with_tag) {
            const groupIdList = Array.from(groupIdSet);
            tagList = await (new TagModel).whereIn('id_group', groupIdList).select();
        }
        /*const tagMap = new Map<number, TagCol>();
        for (let i = 0; i < tagList.length; i++) {
            tagMap.set(tagList[i].id, tagList[i]);
        }*/
        //
        list.forEach(item => {
            // for (let i = 0; i < list.length; i++) {
            const ext = {
                dir: {},
                tree: {id: [], title: [],},
                sub: [],
            } as TagGroupExp;
            //
            const curDir = dirMap.get(item.id_dir);
            if (!curDir) {
                ext.dir = {id: 0, title: item.id_dir ? 'unknown' : 'root'};
                ext.tree = {id: [0], title: [item.id_dir ? 'unknown' : 'root']};
            } else {
                ext.dir = {id: curDir.id, title: curDir.title};
                for (let j = 0; j < curDir.list_node.length; j++) {
                    const dirId = curDir.list_node[j];
                    const dir = dirMap.get(dirId);
                    ext.tree.id.push(dir ? dirId : 0);
                    ext.tree.title.push(dir ? dir.title : (dirId ? 'unknown' : 'root'));
                }
            }
            //
            if (fields.with_tag) {
                for (let j = 0; j < tagList.length; j++) {
                    if (tagList[j].id_group !== item.id) continue;
                    ext.sub.push(tagList[j]);
                }
            }
            //
            Object.assign(item, ext);
        });
        return list;
    }

    //@zzz
    async list_dir(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            title: '',
        }, data.fields);
        return '';
    }
}

interface TagGroupExp extends TagGroupCol {
    dir: { id: number, title: string },
    tree: { id: number[], title: string[] },
    sub: Array<TagCol>
}

export default TagGroupController;