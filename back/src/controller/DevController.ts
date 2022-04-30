import ORM from "../lib/ORM";
import {Fields, PersistentFile} from "formidable";
import BaseController from "./BaseController";
import UserModel from "../model/UserModel";
import QueueModel from "../model/QueueModel";

class DevController extends BaseController {
    async queue(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        /*await (new QueueModel()).insertAll([
           {
               type: 'test',
               payload: 'test',
           }, {
               type: 'test2',
               payload: ['1', {c: 2}],
           }
       ]);*/
        return await (new QueueModel()).select();
    }

    async model(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        return await (new UserModel()).where('id', 1).select();
    }

    async sql(data: { fields: Fields, files: Array<typeof PersistentFile>, uid: number }): Promise<any> {
        /*const [rows, fields] = await conn().execute('select * from user');
            const sql2 = conn();
            console.info(rows);
            for (let i = 0; i < (rows as RowDataPacket[]).length; i++) {
                console.info((rows as RowDataPacket[])[i]);
            }*/
        /*const orm1 = (new ORM('user')).
        where('a','=',1).
        where('b',2).
            or().not().
        where([
            ['c',3],
            ['d',4],
        ]).
        where((query:ORM)=>{
            query.where('e','=',1).
            where('f',2).
            not().or().
            where([
                ['g',3],
                ['h',4],
            ]).where((query:ORM)=>query.where('i',5))
        }).
            whereRaw('rawPart > 3').
            whereIn('iK',[1,2,3,4]).
            whereBetween('iB',999,9999).
            whereNull('iN').
            group('grp').
            order('id1','desc').
            order('id2','asc').
            limit(20).
            offset(30).
        select();
        console.info(JSON.stringify(orm1));
        */
        const orm2 = await (new ORM('user')).where('id', 1).select();
        // const orm3 = await (new ORM('settings')).ignore().insert({name: 'key', value: 'val',});
        // const orm4 = await (new ORM('settings')).ignore().where('id', 999).delete();
        // const orm5 = await (new ORM('settings')).ignore().where('name', 'key').update({value: 'val_upd', name: 'key'});
        // const orm6 = await (new ORM('settings')).ignore().insertAll([{name: 'key2', value: 'valz',}, {name: 'key3', value: 'valx',}, {name: 'key4', value: 'valc',},]);
        console.info(JSON.stringify(orm2));
        // console.info(JSON.stringify(orm3));
        // console.info(JSON.stringify(orm4));
        // console.info(JSON.stringify(orm5));
        // console.info(JSON.stringify(orm6));
        return 'dev|exec|success'
    }
}

export default DevController;