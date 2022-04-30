import {App} from '@vue/runtime-core';
import routeDefinition from '../router';

/**
 * 这里把路由信息注册到全局，
 * /router里仅导出路由数据
 * */

export default {
  install: (Vue: App, ...options: any[]): any => {
    Vue.config.globalProperties.$routeData = routeDefinition;
    return this;
  },
  content: routeDefinition,
};
