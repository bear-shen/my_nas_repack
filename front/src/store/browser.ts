import {ActionContext, Store, StoreOptions} from 'vuex'
import {Modal as ModalConstructor, createModal, ModalCreatorConfig, Modal} from '../lib/ModalLib'

const key = 'toshokan_modal_browser_store';

export default {
  namespaced: true,
  state: {
    //保存一些浏览器用的设置
    defConfig: {
      media_play_mode: 'loop',
      lock_detail: false,
      media_volume: 100,
      media_mute: false,
    },
    config: {} as { [key: string]: any },
    loaded: false,
  },
  mutations: {
    set: function (state: any, payload:
      { key: string, value: string, } | [{ key: string, value: string, }]
    ) {
      if (!(payload instanceof Array)) payload = [payload];
      for (let i = 0; i < payload.length; i++) {
        state.config[payload[i].key] = payload[i].value;
      }
      // this.commit('browser/save');
      localStorage.setItem(key, JSON.stringify(state.config));
    },
    load: function (state: any) {
      const confStr = localStorage.getItem(key);
      if (confStr) {
        state.config = JSON.parse(confStr);
      } else {
        state.config = JSON.parse(JSON.stringify(state.defConfig));
      }
      state.loaded = true;
    },
    /*save: function (state: any) {
      localStorage.setItem(key, JSON.stringify(state.config));
    },*/
  },
  actions: {},
  modules: {},
  getters: {},
} as StoreOptions<any>;
