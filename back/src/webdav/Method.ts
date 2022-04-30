import copy from "./processor/copy";
import deleteFunc from "./processor/delete";
import get from "./processor/get";
import head from "./processor/head";
import lock from "./processor/lock";
import move from "./processor/move";
import options from "./processor/options";
import post from "./processor/post";
import propfind from "./processor/propfind";
import proppatch from "./processor/proppatch";
import trace from "./processor/trace";
import unlock from "./processor/unlock";
import put from "./processor/put";
import mkcol from "./processor/mkcol";
// import copy from "./processor/copy";

const ref = {
    'GET': get.process,
    'MOVE': move.process,
    'OPTIONS': options.process,
    'PROPFIND': propfind.process,
    'PUT': put.process,
    'MKCOL': mkcol.process,
    'DELETE': deleteFunc.process,
    //
    'COPY': copy.process,
    'HEAD': head.process,
    'LOCK': lock.process,
    'POST': post.process,
    'PROPPATCH': proppatch.process,
    'TRACE': trace.process,
    'UNLOCK': unlock.process,
};

export default ref;