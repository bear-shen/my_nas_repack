import {ActionContext, Store, StoreOptions} from 'vuex'

const configKey = 'toshokan_framework_frame_config';
const defConfig = {
  fold: true,
};

function save(data: any): any {
  localStorage.setItem(configKey, JSON.stringify(data));
}

function load(): any {
  const confStore = localStorage.getItem(configKey);
  let config = {};
  if (confStore && confStore.length) {
    config = Object.assign(defConfig, JSON.parse(confStore))
  } else {
    config = defConfig;
  }
  return config;
}

export default {
  namespaced: true,
  state: load(),
  mutations: {
    fold: function (state, payload) {
      // eslint-disable-next-line prefer-rest-params
      console.debug('store.framework.mutations.fold');
      // console.debug('store.framework.mutations.fold', arguments);
      state.fold = !state.fold;
      save(state);
    },
  },
  // Action 提交的是 mutation，而不是直接变更状态。
  // Action 可以包含任意异步操作。
  actions: {
    devAction: function (context, payload) {
      // eslint-disable-next-line prefer-rest-params
      console.debug('devAction', arguments,/*state, payload*/);
      return true;
    },
  },
  modules: {},
  getters: {
    /*getFold: (state, getters) => {
      console.debug(state);
      return state.fold;
    }*/
  },
} as StoreOptions<any>;
