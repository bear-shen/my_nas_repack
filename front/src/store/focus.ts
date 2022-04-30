import {ActionContext, Store, StoreOptions} from 'vuex'

export default {
  namespaced: true,
  state: {
    last: document.body
  },
  mutations: {},
  // Action 提交的是 mutation，而不是直接变更状态。
  // Action 可以包含任意异步操作。
  actions: {},
  modules: {},
  getters: {},
} as StoreOptions<any>;
