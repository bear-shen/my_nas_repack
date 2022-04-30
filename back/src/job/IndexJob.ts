import config from "../Config";

const util = require('util');
const exec = util.promisify(require('child_process').exec);
//
import NodeModel from "../model/NodeModel";
import FileModel from "../model/FileModel";
import FileLib from "../lib/File";
import * as ffmpeg from "../lib/FFmpeg";
import * as fs from "fs/promises";
import * as fsNP from "fs";
import ORM from "../lib/ORM";
import nodeModel from "../model/NodeModel";
import TagModel from "../model/TagModel";
import TagGroupModel from "../model/TagGroupModel";

//标签组的名称姑且就不更新了，似乎也没有更新的必要。。。

async function buildNodeIndex(payload: any) {
    payload = Object.assign({
        id: 0,
    }, payload);
    if (!payload.id) throw new Error('error payload');
    console.info(payload);
    const indexArr = {
        title: '',
        description: '',
        tag: [] as string[],
    };
    const node = await (new NodeModel).where('id', payload.id).first();
    if (!node) throw new Error('node not found');
    indexArr.title = node.title;
    indexArr.description = node.description;
    //
    /*if (node.list_node.length) {
        const dir = await (new NodeModel).whereIn('id', node.list_node).select();
        for (let i = 0; i < dir.length; i++) {
            indexArr.push(dir[i].title, dir[i].description,)
        }
    }*/
    if (node.list_tag_id.length) {
        const tagList = await (new TagModel).whereIn('id', node.list_tag_id).select();
        for (let i = 0; i < tagList.length; i++) {
            // indexArr.tag.push(tagList[i].title, tagList[i].description, ...tagList[i].alt);
            indexArr.tag.push(tagList[i].description, ...tagList[i].alt);
        }
    }
    await (new NodeModel).where('id', payload.id).update({
        index_node: indexArr,
    });
}

async function buildTagIndex(payload: any) {
    payload = Object.assign({
        id: 0,
    }, payload);
    if (!payload.id) throw new Error('payload error');
    console.info(payload);
    const tag = await (new TagModel).where('id', payload.id).first();
    if (!tag) throw new Error('tag not found');
    const tagGroup = await (new TagGroupModel).where('id', tag.id_group).first();
    if (!tagGroup) throw new Error('tag group not found');
    const index = [tag.title, ...tag.alt, tag.description, tagGroup.title, tagGroup.description].join(',');
    await (new TagModel).where('id', tag.id).update({
        index_tag: index,
    });
}

export {buildNodeIndex, buildTagIndex};