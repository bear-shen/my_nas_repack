/* eslint-disable */
import {RouteRecordRaw} from "vue-router";
import {Store} from 'vuex'

declare module '*.vue' {
  import type {DefineComponent} from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import query from "@/utils/query";
import router from "@/utils/router";
import util from "@/utils/util";

declare module '@vue/runtime-core' {
  // declare your own store states
  import storeOptions from "@/store";

  export interface ComponentCustomProperties {
    $query: typeof query.content |
      ((path: string, data: { [key: string]: any }) => Promise<any>),
    $routeData: typeof router.content |
      Array<RouteRecordRaw>,
    $util: typeof util.content,
    $store: Store<storeOptions>
  }

  export {}
}
