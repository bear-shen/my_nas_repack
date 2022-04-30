import QueueModel from "../model/QueueModel";
import {buildNode, deleteForever, importFile} from "./FileJob";
import {buildTagIndex, buildNodeIndex} from "./IndexJob";

const jobs = {
    'file/build': buildNode,
    'file/import': importFile,
    'file/delete_forever': deleteForever,
    'index/tag': buildTagIndex,
    'index/node': buildNodeIndex,
} as { [key: string]: any };

async function run() {
    while (true) {
        const queue = await (new QueueModel).where('status', 1).first();
        if (!queue) {
            await wait();
            continue;
        }
        if (!jobs[queue.type]) {
            console.error('undefined job');
            await (new QueueModel).where('id', queue.id).update({status: -2});
            continue;
        }
        let success = true;
        try {
            await jobs[queue.type](queue.payload);
        } catch (e: any) {
            console.info((e as Error).name, (e as Error).message, (e as Error).stack);
            success = false;
        }
        await (new QueueModel).where('id', queue.id).update({status: success ? 0 : -1});
    }
}

function wait(): Promise<any> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, 1000);
    })
}


export {
    run, wait
}