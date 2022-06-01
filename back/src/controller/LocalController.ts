import BaseController from "./BaseController";
import {Fields, File, PersistentFile} from "formidable";
import * as fs from "fs/promises";
import * as fsNP from "fs";
import FileLib from "../lib/File";
import {IncomingMessage, ServerResponse} from "http";

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

    async get(
        data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number },
        req: IncomingMessage, res: ServerResponse
    ): Promise<any> {
        // const fields = Object.assign({
        //     path: '/',
        // }, data.fields);
        const urlInfo = new URL(req.url, `http://${req.headers.host}`);
        const path = urlInfo.searchParams.get('path');
        console.info('downloading:', path);
        //
        let ifExs = await FileLib.getFileStat(path);
        // console.info(path, ifExs);
        if (!ifExs) throw new Error('file not found');
        if (!ifExs.isFile()) throw new Error('target is not a file');
        const dirIndex = path.lastIndexOf('/');
        const fileName = path.substring(dirIndex + 1);
        // fsNP.createReadStream(fields.path);
        res.statusCode = 200;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
        await writeFileStream(res, path);
        res.end();
        return;
    }

    async put(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        let file: File;
        const fields = Object.assign({
            path: '/',
        }, data.fields);
        //
        for (const filesKey in data.files) {
            file = data.files[filesKey] as unknown as File;
        }
        //
        let ifExs = await FileLib.getFileStat(fields.path);
        if (ifExs) {
            if (!ifExs.isFile()) throw new Error('target is not a file');
            await fs.rm(fields.path);
        }
        await fs.rename(file.filepath, fields.path);
    }

    async mkdir(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            path: '/',
        }, data.fields);
        //
        let ifExs = await FileLib.getFileStat(fields.path);
        if (ifExs) {
            if (ifExs.isFile()) throw new Error('target is a file');
            return;
        }
        await fs.mkdir(fields.path, {recursive: true,});
    }

    async rm(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        const fields = Object.assign({
            path: '/',
        }, data.fields);
        //
        let ifExs = await FileLib.getFileStat(fields.path);
        if (!ifExs) return;
        // console.info('del', depth, fromPath);
        if (ifExs.isFile()) {
            await fs.rm(fields.path);
        } else if (ifExs.isDirectory()) {
            await fs.rmdir(fields.path);
        }
    }
}

function writeFileStream(res: ServerResponse, path: string): Promise<any> {
    return new Promise((resolve: any) => {
        const rs = fsNP.createReadStream(path);
        rs.on('data', (chunk) => {
            res.write(chunk);
        })
        rs.on('end', () => {
            resolve();
        });
    })
}


export default LocalController;