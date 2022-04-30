import BaseController from "./BaseController";
import {Fields, PersistentFile} from "formidable";
import QueueModel from "../model/QueueModel";
import UserModel from "../model/UserModel";
import AuthModel from "../model/AuthModel";

const md5 = require('md5');

class UserController extends BaseController {
    async login(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            name: '',
            pass: '',
        }, data.fields);
        const user = await (new UserModel()).where('name', fields.name).first();
        if (!user) throw new Error('user not found');
        if (makePass(fields.pass) !== user.password) throw new Error('password not correct');
        const token = makeToken(user.id);
        await (new AuthModel()).insert({
            uid: user.id,
            token: token,
        });
        delete user.password;
        return Object.assign(user, {token});
    }

    async list(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id_group: '',
            name: '',
        }, data.fields);
        const model = (new UserModel)
            .whereIn('status', [1, 2,]);
        if (fields.id_group) {
            model.where('id_group', fields.id_group);
        }
        if (fields.name) {
            model.where('name', 'like', fields.name + '%');
        }
        const list = await model.select([
            'id',
            'name',
            'mail',
            'id_group',
            'status',
            'time_create',
            'time_update',
        ]);
        return list;
    }

    async mod(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
            id_group: '',
            name: '',
            mail: '',
            password: '',
            // status: '',
        }, data.fields);
        const id = parseInt(fields.id);
        if (id) {
            const user = await (new UserModel).where('id', id).first();
            if (!user) throw new Error('user not found');
            const updVal = {
                id_group: fields.id_group,
                name: fields.name,
                mail: fields.mail,
            } as { [key: string]: any };
            if (fields.password) updVal.password = makePass(fields.password);
            (new UserModel).where('id', id).update(updVal);
        } else {
            (new UserModel).insert({
                // id: '',
                name: fields.name,
                mail: fields.mail,
                password: fields.password,
                id_group: fields.id_group,
                status: fields.status,
            })
        }
        return id;
    }

    async del(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            id: '',
        }, data.fields);
        const id = parseInt(fields.id);
        const user = await (new UserModel).where('id', id).first();
        if (!user) throw new Error('user not found');
        (new UserModel).where('id', id).update({status: 0});
        return id;
    }
}

function makeToken(uid: string | number) {
    const key = `${uid}|${(new Date()).valueOf()}`
    return md5(key);
}

function makePass(pass: string): string {
    return md5(md5(pass));
}

export default UserController;