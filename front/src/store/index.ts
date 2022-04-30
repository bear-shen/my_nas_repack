import {createStore, StoreOptions} from 'vuex'
import framework from './framework';
import modal from './modal';
import event from './event';
import paginator from './paginator';
import browser from './browser';
import focus from './focus';

export default {
  state: {},
  mutations: {},
  actions: {},
  modules: {
    framework,
    modal,
    event,
    paginator,
    browser,
    focus
  },
  getters: {},
} as StoreOptions<any>
