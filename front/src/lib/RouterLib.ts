import {createRouter, createWebHashHistory, RouteRecordName, RouteRecordRaw} from 'vue-router'
import routeDefinition from '../router'
/**
 * 这里是路由的基类，
 * /router里仅导出路由数据
 * */
// console.debug(routeDefinition);
/*
function configureParent(arr: RouteRecordRaw[] | undefined, parentName?: string | boolean) {
  if (!arr) return;
  if (!parentName) parentName = false;
  for (let i1 = 0; i1 < arr.length; i1++) {
    if (!arr[i1].meta) arr[i1].meta = {};
    (arr[i1].meta as any).parent = parentName;
    if ((arr[i1].meta as any).hide) continue;
    if (!arr[i1].children?.length) continue;
    configureParent(arr[i1].children, arr[i1].name as string)
  }
}
configureParent(routeDefinition);
*/

const routerLib = createRouter({
  history: createWebHashHistory(),
  routes: routeDefinition
})

export default routerLib
