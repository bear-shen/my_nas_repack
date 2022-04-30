import {ActionContext, createStore, StoreOptions} from 'vuex'

/**
 * 手工处理一部分全局事件的输入和输出
 * 这里是全局的事件
 * */
export default {
  namespaced: true,
  state: {
    dragging: false,
    onInput: <{ [key: string]: { [key: string]: (e: Event) => any } }>{},
    //接管的事件列表
    prevents: [
      'click',
      'mousedown',
      'mouseup',
      'mouseenter',
      'mouseleave',
      'mousemove',
      'mouseout',
      'mouseover',
      'keydown',
      'keypress',
      'keyup',
      'resize',
    ],
  },
  mutations: {
    /**
     * 全局注册事件
     * */
    submit: function (state: any, payload: {
      action: string,
      event: Event,
    }): any {
      if (!state.onInput[payload.action]) return;
      // console.debug('inputSubmit', payload.action);
      for (const key in state.onInput[payload.action]) {
        if (!Object.prototype.hasOwnProperty.call(state.onInput[payload.action], key)) continue;
        state.onInput[payload.action][key](payload.event)
      }
      // return state.onInput[payload.action](payload.event);
    },
    /**
     * 提交事件处理器
     * */
    register: function (state: any, payload: {
      action: string,
      key?: string,
      callback: (e: Event) => any,
    }): any {
      // console.debug('inputRegister', payload.key, payload.action)
      if (!state.onInput[payload.action]) state.onInput[payload.action] = {};
      const key = payload.key ? payload.key : `evt_key_${(new Date()).valueOf()}`;
      state.onInput[payload.action][key] = payload.callback;
    },
    /**
     * 释放事件处理器
     * */
    release: function (state: any, payload: {
      action: string,
      key: string,
    }): any {
      // console.debug('inputRelease', payload.key, state.onInput[payload.action])
      if (!payload.key) return;
      if (!state.onInput[payload.action]) return;
      if (state.onInput[payload.action][payload.key]) delete state.onInput[payload.action][payload.key];
    },
  },
} as StoreOptions<any>;
