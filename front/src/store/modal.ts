import {ActionContext, Store, StoreOptions} from 'vuex'
import {Modal as ModalConstructor, createModal, ModalCreatorConfig, Modal} from '../lib/ModalLib'

export default {
  namespaced: true,
  state: {
    // list: Array<ModalConstructor>(),
    list: new Map<number, ModalConstructor>(),
    onPush: null as unknown as () => any,
  },
  mutations: {
    push: function (state, payload: ModalCreatorConfig) {
      // console.info(payload, state.list);
      //single的限制
      if (payload.single && payload.key) {
        let isSet = false;
        state.list.forEach((item: ModalConstructor) => {
          if (!item.base.key) return;
          if (item.base.key === payload.key) isSet = true;
        });
        if (isSet) return false;
      }
      // console.warn(payload.height);
      const newModal = createModal(payload);
      // (state.list as Array<ModalConstructor>).push(newModal);
      (state.list as Map<number, ModalConstructor>).set(newModal.nid, newModal);
      // console.warn(state.list[0].layout.h, state.list[0].layout.defH);
      // console.info(state.list, Array.from(state.list));
      if (state.onPush) state.onPush(newModal.nid);
      return true;
    },
  },
  actions: {},
  modules: {},
  getters: {},
} as StoreOptions<any>;
