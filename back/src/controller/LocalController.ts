import BaseController from "./BaseController";
import {Fields, File, PersistentFile} from "formidable";
import * as fs from "fs/promises";

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