import BaseController from "./BaseController";
import {Fields, PersistentFile} from "formidable";
import QueueModel from "../model/QueueModel";
import TagModel from "../model/TagModel";
import TagGroupModel from "../model/TagGroupModel";
import NodeModel from "../model/NodeModel";

class TagController extends BaseController {
    async mod(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
            title: '',
            alt: '',
            description: '',
            status: '',
        }, data.fields);
        //
        let alt = [] as string[];
        if (fields.alt?.length) {
            alt = fields.alt.split(',');
            const ttSet = new Set<string>();
            ttSet.add(fields.title);
            alt.forEach(v => ttSet.add(v));
            const ttArr = Array.from(ttSet);
            fields.title = ttArr.shift();
            alt = ttArr;
        }
        // console.info(fields, alt);
        let id = parseInt(fields.id);
        if (id) {
            const item = await (new TagModel).where('id', id).first();
            if (!item) throw new Error('tag not found');
            await (new TagModel).where('id', id).update({
                title: fields.title,
                alt: alt,
                description: fields.description,
            });
        } else {
            const res = await (new TagModel).insert({
                title: fields.title,
                alt: alt,
                description: fields.description,
                status: 1,
            });
            id = res.insertId;
        }
        await (new QueueModel).insert({
            type: 'index/tag',
            status: 1,
            payload: {id: id},
        });
        return id;
    }

    async delete(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
        }, data.fields);
        const item = await (new TagModel).where('id', fields.id).first();
        if (!item) throw new Error('tag not found');
        await (new TagModel).where('id', fields.id).update({status: 0});
        await (new QueueModel).insert({
            type: 'index/tag',
            status: 1,
            payload: {id: fields.id},
        });
        return fields.id;
    }

    async list(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            title: '',
            id_dir: '',
            id_group: '',
            page: '',
            //写入group内容
            with_group_meta: '',
        }, data.fields);
        const model = (new TagModel).where('status', 1);
        if (fields.id_dir) {
            const node = await (new NodeModel).where('id', fields.id_dir).first(['id', 'list_node',],);
            if (node) {
                const groupList = await (new TagGroupModel)
                    .where('status', 1)
                    .whereIn('id_dir', node.list_node.filter(i => i > 0))
                    .select(['id',]);
                const groupIdList = [] as number[];
                groupList.forEach((item) => groupIdList.push(item.id));
                // if (groupIdList.length)
                model.whereIn('id_group', groupIdList.length ? groupIdList : [-1]);
            }
        }
        if (fields.id_group) {
            model.where('id_group', fields.id_group);
        }
        const page = parseInt(fields.page);
        if (fields.page) {
            model.page(page);
        }
        fields.title = fields.title.trim();
        if (fields.title) {
            fields.title = fields.title + '*'
            model
                .whereRaw('match (`index_tag`) against ( ? in boolean mode)', fields.title)
                //索引不要做布尔模式，排序好看一点，以及注意因为这里涉及到绑定顺序，所以应该写在所有可能的数据绑定后
                .order('match (`index_tag`) against ( ? )', 'desc')
            ;
            model._dataset.binds.push(fields.title);
        }
        const list = await model.select([
            //'id', 'id_group', 'title', /*'alt',*/ 'description', 'status',
            'id', 'id_group', 'title', 'alt', 'description', 'status',
        ]) as TagExp[];
        const size = await model.count();
        // console.info(list);
        if (fields.with_group_meta) {
            const groupIdSet = new Set<number>();
            list.forEach((item) => groupIdSet.add(item.id_group));
            // console.info(groupIdSet);
            if (groupIdSet.size) {
                const gModel = (new TagGroupModel).where('status', 1)
                    .whereIn('id', Array.from(groupIdSet));
                const groupList = await gModel.select(['id', 'id_dir', 'title', 'description']);
                const groupMap = new Map<number, TagGroupCol>();
                groupList.forEach((item) => groupMap.set(item.id, item));
                // console.info(groupList);
                list.forEach((item) => {
                    item.group = groupMap.get(item.id_group);
                });
            }
        }
        return {
            list,
            page: page,
            size: Math.ceil(size / 100),
        };
    }

    async attach(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            tag_id: '',
            node_id: '',
        }, data.fields);
        const tag = await (new TagModel).where('id', fields.tag_id).first();
        if (!tag) throw new Error('tag not found');
        const node = await (new NodeModel).where('id', fields.node_id).first();
        if (!node) throw new Error('node not found');
        //
        if (node.list_tag_id.indexOf(tag.id) !== -1) return node.id;
        await (new NodeModel).where('id', node.id).update({
            list_tag_id: [...node.list_tag_id, tag.id]
        });
        await (new QueueModel).insert({
            type: 'index/node',
            status: 1,
            payload: {id: node.id},
        });
        return node.id;
    }

    async detach(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            tag_id: '',
            node_id: '',
        }, data.fields);
        const tag = await (new TagModel).where('id', fields.tag_id).first();
        if (!tag) throw new Error('tag not found');
        const node = await (new NodeModel).where('id', fields.node_id).first();
        if (!node) throw new Error('node not found');
        //
        const tIndex = node.list_tag_id.indexOf(tag.id);
        if (tIndex === -1) return node.id;
        const tagList = node.list_tag_id;
        tagList.splice(tIndex, 1)
        await (new NodeModel).where('id', node.id).update({
            list_tag_id: tagList
        });
        await (new QueueModel).insert({
            type: 'index/node',
            status: 1,
            payload: {id: node.id},
        });
        return node.id;
    }

    async import_eht(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            data: '',
            id: '',
        }, data.fields);
        const meta = Object.assign({
            title: '',
            sub_title: '',
            tags: {},
            type: '',
            link: '',
        }, JSON.parse(fields.data));
        if (!meta) throw new Error('invalid meta data');
        const node = await (new NodeModel).where('id', fields.id).first();
        if (!node) throw new Error('node not found');
        const updData = {
            description: `${meta.sub_title}\r\nfrom: ${meta.link}\r\ntype: ${meta.type}`,
            list_tag_id: [...node.list_tag_id],
        } as NodeCol;
        for (const tagGroupName in meta.tags) {
            let tagGroup = await (new TagGroupModel).where('title', tagGroupName).first();
            if (!tagGroup) {
                tagGroup = {
                    title: tagGroupName,
                    sort: 0,
                    status: 1,
                    id_dir: 3,
                };
                const tagGroupInsRes = await (new TagGroupModel).insert(tagGroup);
                tagGroup.id = tagGroupInsRes.insertId;
            }
            for (const tagName of meta.tags[tagGroupName]) {
                let tag = await (new TagModel)
                    .where('id_group', tagGroup.id)
                    .where((query: TagModel) => {
                        query.where('title', tagName)
                            .or().whereRaw('find_in_set( ? , alt)', tagName)
                    })
                    .first()
                ;
                if (!tag) {
                    tag = {
                        title: tagName,
                        alt: [tagName],
                        description: '',
                        status: 1,
                        id_group: tagGroup.id,
                    };
                    const tagInsRes = await (new TagModel).insert(tag);
                    tag.id = tagInsRes.insertId;
                    await (new QueueModel).insert({
                        type: 'index/tag',
                        status: 1,
                        payload: {id: tag.id},
                    });
                }
                if (updData.list_tag_id.indexOf(tag.id) === -1) {
                    updData.list_tag_id.push(tag.id);
                }
            }
        }
        await (new NodeModel).where('id', node.id).update(updData);
        await (new QueueModel).insert({
            type: 'index/node',
            status: 1,
            payload: {id: node.id},
        });
    }
}

interface TagExp extends TagCol {
    group: TagGroupCol,
}

export default TagController;