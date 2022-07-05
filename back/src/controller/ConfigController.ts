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
            name: '',
        }, data.fields);
        const item = await (new SettingModel).where('name', fields.name).first();
        if (!item) throw new Error('config not found');
        return item;
    }

    async set(
        data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number },
        req: IncomingMessage, res: ServerResponse
    ): Promise<any> {
        const fields = Object.assign({
            name: '',
            value: '',
        }, data.fields);
        const item = await (new SettingModel).where('name', fields.name).first();
        if (item) {
            await (new SettingModel).where('name', fields.name).update({value: fields.value});
        } else {
            await (new SettingModel).insert({
                name: fields.name,
                value: fields.value,
            });
        }
        return item;
    }
}

export default ConfigController;