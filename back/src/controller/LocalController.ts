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

const md5 = require('md5');
const crypt = require('crypto')

class LocalController extends BaseController {
    async ls(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            path: '/',
        }, data.fields);
        let dirStat = null;
        try {
            dirStat = await fs.stat(fields.path);
        } catch (e: any) {
            throw new Error('file not found');
        }
        if (dirStat.isFile()) throw new Error('target is a file');
        const fList = await fs.readdir(fields.path);
        const target = [];
        for (const name of fList) {
            const fPath = `${fields.path === '/' ? '' : fields.path}/${name}`;
            try {
                const fStat = await fs.stat(fPath);
                target.push({
                    path: fPath,
                    name: name,
                    size: fStat.size,
                    type: fStat.isFile() ? 'file' : 'directory',
                    auth: fStat.mode.toString(8),
                })
            } catch (e: any) {
                // continue;
            }
        }
        return target;
    }
}


export default LocalController;