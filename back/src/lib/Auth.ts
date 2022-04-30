import {IncomingHttpHeaders, IncomingMessage} from "http";
import {PersistentFile} from "formidable";
import Config from "./../Config";
import AuthModel from "../model/AuthModel";

//return uid|false|-1 on no auth
export default async function (
    url: URL,
    header: IncomingHttpHeaders
): Promise<boolean | number> {
    // console.info(url, header);
    let needAuth = false;
    for (const authKey in Config.auth) {
        if (!url.pathname.match(new RegExp(authKey))) continue;
        needAuth = !!(Config.auth[authKey as string][0]);
    }
    if (!needAuth) return -1;
    if (!header['auth-token']) return false;
    const ifAuthed = await (new AuthModel()).where('token', header['auth-token']).first();
    if (!ifAuthed) return false;
    return ifAuthed.uid;
}