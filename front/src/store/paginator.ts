import {ActionContext, Store, StoreOptions} from 'vuex'

function genPageNo(state: any): any {
  console.debug('genPageNo');
  if (state.current >= state.count) state.current = state.count;
  //
  /*const pages = {
    bef: Array<{ [key: string]: any }>(),
    cur: Array<{ [key: string]: any }>(),
    aft: Array<{ [key: string]: any }>(),
  };*/
  // const pages=Array<{ [key: string]: any }>();
  const pages = Array<number | string>();
  pages.push(state.current);
  let pageCount = 1;
  for (let i1 = 0; i1 < state.listSize; i1++) {
    const pA = state.current + (i1 + 1);
    if (pA <= state.count) {
      pages.push(pA);
      pageCount += 1;
      if (pageCount >= state.listSize) break;
    }
    //
    const pB = state.current - (i1 + 1);
    if (pB >= 1) {
      pages.unshift(pB);
      pageCount += 1;
      if (pageCount >= state.listSize) break;
    }
  }
  // console.debug(state.current, pages);
  //加个...
  if (state.current > 3) {
    pages.shift();
    pages.shift();
    pages.unshift('...');
    pages.unshift(1);
  }
  if (state.current < state.count - 2) {
    pages.pop();
    pages.pop();
    pages.push('...');
    pages.push(state.count);
  }
  // console.debug(state.current, pages);
  const pageData = Array<{ [key: string]: any }>();
  for (let i1 = 0; i1 < pages.length; i1++) {
    pageData.push({
        no: pages[i1],
        active: pages[i1] === state.current,
      }
    );
  }
  // state.list = [];
  state.list = pageData;
}

export default {
  namespaced: true,
  state: {
    active: false,
    count: 0,//分页的总数，分页内不考虑每页有多少数据
    current: 0,//当前的分页
    // size: 5,
    listSize: 9,//分页标签的数量
    list: Array<{ no: number, active: boolean }>(),
    change: ((to: number) => null),
    // focusDOM: document.body,
  },
  mutations: {
    active: function (state, payload: {
      count: number,
      current?: number,
      // size?: number,
      change?: ((to: number) => any)
    }) {
      console.debug('active', payload);
      state.active = true;
      state.change = payload.change ? payload.change : null;
      state.count = payload.count;
      state.current = payload.current ? payload.current : 1;
      // state.size = payload.size ? payload.size : 100;
      state.list = [];
      genPageNo(state);
    },
    inactive: function (state) {
      state.active = false;
    },
  },
  // Action 提交的是 mutation，而不是直接变更状态。
  // Action 可以包含任意异步操作。
  actions: {},
  modules: {},
  getters: {},
} as StoreOptions<any>;
