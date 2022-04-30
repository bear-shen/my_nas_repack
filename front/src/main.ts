import {createApp} from 'vue'
import App from './App.vue'
//
import {store} from './lib/StoreLib'
import routerLib from './lib/RouterLib'
//
import util from './utils/util'
import routerDef from './utils/router'
//
import config from './config';
import query from '@/utils/query';

import '@/assets/fonts/sysIcon/iconfont.css';
import '@/assets/fonts/listIcon/iconfont.css';
import '@/assets/global.scss';

// import Demo from '@/modal/Demo.vue';
// App.component('demo','@/modal/Demo');

createApp(App)
  .use(store)
  .use(routerLib)
  //
  .use(util)
  .use(routerDef)
  .use(config)
  .use(query)
  // .component('demo', Demo)
  .mount('#app')
