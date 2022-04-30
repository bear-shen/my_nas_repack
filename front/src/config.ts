import type {App} from '@vue/runtime-core'

const config = {
  // apiPath: 'http://sample.org/api/',
  apiPath: '/api/',
  fileTypes: [
    'text',
    'binary',
    'audio',
    'video',
    // 'archive',
    'image',
    'folder',
  ],
}

export default {
  install: (Vue: App, ...options: any[]): any => {
    Vue.config.globalProperties.$config = config;
    return this;
  },
  content: config,
}
