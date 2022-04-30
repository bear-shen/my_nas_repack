import BaseController from "./BaseController";
import {Fields, PersistentFile} from "formidable";
import QueueModel from "../model/QueueModel";
import UserModel from "../model/UserModel";
import AuthModel from "../model/AuthModel";
import UserGroupModel from "../model/UserGroupModel";
import NodeModel from "../model/NodeModel";

class UserGroupController extends BaseController {

    async list(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            title: '',
            admin: '',
        }, data.fields);
        const model = (new UserGroupModel).where('status', 1);
        if (fields.title) {
            model.where('title', fields.title);
        }
        if (fields.admin) {
            model.where('admin', 1);
        }
        const list = await model.select() as UserGroupExp[];
        const nodeIdSet = new Set<number>();
        list.forEach(item => {
            if (item.auth) {
                item.auth.forEach(auth => {
                    if (auth.id_dir)
                        nodeIdSet.add(auth.id_dir);
                });
            }
        });
        const nodeMap = new Map<number, NodeCol>();
        // console.info(nodeMap.size);
        // console.info(nodeMap.size);
        if (nodeIdSet.size) {
            // console.info(Array.from(nodeIdSet));
            const nodeRList = await (new NodeModel).whereIn('id', Array.from(nodeIdSet)).select(['list_node']);
            nodeRList.forEach(item => {
                item.list_node.forEach(nodeId => nodeIdSet.add(nodeId));
            });
            const nodeList = await (new NodeModel).whereIn('id', Array.from(nodeIdSet)).select(['id', 'title', 'list_node']);
            nodeList.forEach(item => nodeMap.set(item.id, item));
        }
        list.forEach(item => {
            item.auth.forEach(auth => {
                auth.tree = {id: [0], title: ['root'],};
                auth.dir = {id: 0, title: '',};
                //
                const authNodeId = auth.id_dir;
                if (!authNodeId) return;
                const authNode = nodeMap.get(authNodeId);
                if (!authNode) return;
                auth.dir = {id: authNode.id, title: authNode.title,};
                authNode.list_node.forEach(nodeId => {
                    if (!nodeId) return;
                    const node = nodeMap.get(nodeId);
                    if (!node) return;
                    auth.tree.id.push(node.id);
                    auth.tree.title.push(node.title);
                });
            });
        });
        return list;
    }

    async mod(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
            title: '',
            description: '',
            admin: '',
            status: '',
            auth: '',
        }, data.fields);
        const id = parseInt(fields.id);
        //
        let auth = JSON.parse(fields.auth);
        if (!auth) auth = [{id_dir: 0, allow_r: 1, allow_w: 1,}];
        else {
            const dirSet = new Set<number>();
            const nAuth = [] as Array<{ id_dir: number, allow_r: number, allow_w: number, }>;
            for (const authItem of auth) {
                const subAuth = {
                    id_dir: Number.parseInt(authItem.id_dir),
                    allow_r: Number.parseInt(authItem.allow_r),
                    allow_w: Number.parseInt(authItem.allow_w),
                };
                subAuth.id_dir = subAuth.id_dir ? subAuth.id_dir : 0;
                if (dirSet.has(subAuth.id_dir)) continue;
                dirSet.add(subAuth.id_dir)
                nAuth.push({
                    id_dir: subAuth.id_dir,
                    allow_r: subAuth.allow_r ? subAuth.allow_r : 0,
                    allow_w: subAuth.allow_w ? subAuth.allow_w : 0,
                });
            }
            auth = nAuth;
        }
        fields.auth = auth;
        //
        if (id) {
            const group = await (new UserGroupModel).where('id', id).first();
            if (!group) throw new Error('group not found');
            // if (!fields.admin) delete fields.admin;
            (new UserGroupModel).where('id', id).update({
                title: fields.title,
                description: fields.description,
                admin: fields.admin,
                status: fields.status,
                auth: fields.auth,
            });
        } else {
            (new UserGroupModel).insert({
                // id: '',
                title: fields.title,
                description: fields.description,
                admin: fields.admin,
                status: fields.status,
                auth: fields.auth,
            })
        }
        return id;
    }

    async del(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
        }, data.fields);
        const id = parseInt(fields.id);
        const user = await (new UserGroupModel).where('id', id).first();
        if (!user) throw new Error('group not found');
        (new UserGroupModel).where('id', id).update({status: 0});
        return id;
    }
}

interface UserGroupExp extends UserGroupCol {
    auth?: Array<{
        id_dir: number;
        dir?: { id?: number, title?: string, };
        tree?: { id: number[], title: string[] };
        allow_r: boolean | number;
        allow_w: boolean | number;
    }>;
}

export default UserGroupController;