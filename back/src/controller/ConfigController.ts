import ORM from "../lib/ORM";
import {Fields, PersistentFile} from "formidable";
import BaseController from "./BaseController";
import UserModel from "../model/UserModel";
import QueueModel from "../model/QueueModel";
import {IncomingMessage, ServerResponse} from "http";
import SettingModel from "../model/SettingModel";
import TagModel from "../model/TagModel";

class ConfigController extends BaseController {
    async get(
        data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number },
        req: IncomingMessage, res: ServerResponse
    ): Promise<any> {
        const fields = Object.assign({
            key: '',
        }, data.fields);
        const item = await (new SettingModel).where('key', fields.key).first();
        if (!item) throw new Error('config not found');
        return item;
    }

    async set(
        data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number },
        req: IncomingMessage, res: ServerResponse
    ): Promise<any> {
        const fields = Object.assign({
            key: '',
            value: '',
        }, data.fields);
        const item = await (new SettingModel).where('key', fields.key).first();
        if (item) {
            await (new SettingModel).where('key', fields.key).update({value: fields.value});
        } else {
            await (new SettingModel).insert({
                key: fields.key,
                value: fields.value,
            });
        }
        return item;
    }
}

export default ConfigController;