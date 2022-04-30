export class ModalFormConstruct {
  public name?: string;
  public key?: string;
  public value?: any;
  public type?: 'text' | 'textarea' | 'date' | 'datetime' | 'checkbox' | 'radio' | 'select';
  public options?: { [key: string]: string };
  public multiple?: boolean;
  public disabled?: boolean;
}

declare function formCallback(form?: Array<ModalFormConstruct>, key?: string, on?: { [key: string]: () => any }): any ;

export class ModalCallbackConstruct {
  public key: string;
  public name: string;
  public callback: (typeof formCallback);

  constructor(data: { [key: string]: any }) {
    this.key = data.key;
    this.name = data.name;
    this.callback = data.callback;
  }
}

export class ModalComponentConstruct {
  public name: string;
  public key: string;
  public data: { [key: string]: any } | any;

  constructor(data: { [key: string]: any }) {
    this.name = data.name;
    this.key = data.key;
    this.data = data.data;
  }
}

// ---------------------------------

export class ModalBase {
  public title: string;
  public alpha: boolean;
  public key: string;
  public single: boolean;

  constructor(data: { [key: string]: any }) {
    this.title = data.title;
    this.alpha = data.alpha;
    this.key = data.key;
    this.single = data.single;
  }
}

export class ModalLayout {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public defX: number;
  public defY: number;
  public defW: number;
  public defH: number;
  //
  public resizable: boolean;
  public movable: boolean;
  public unit: string;
  //
  public active: boolean;
  public index: number;

  // public resized: boolean;
  public fullscreen: boolean;

  constructor(data: { [key: string]: any }) {
    this.x = data.x;
    this.y = data.y;
    this.w = data.w;
    this.h = data.h;
    this.defX = data.defX;
    this.defY = data.defY;
    this.defW = data.defW;
    this.defH = data.defH;
    this.resizable = data.resizable;
    this.movable = data.movable;
    this.unit = data.unit;
    this.active = data.active;
    this.index = data.index;
    // this.resized = data.resized;
    this.fullscreen = data.fullscreen;
  }
}

export class ModalContent {
  public text: string;
  public form: Array<ModalFormConstruct>;
  public component: Array<ModalComponentConstruct>
  public callback: Array<ModalCallbackConstruct>;

  constructor(data: { [key: string]: any }) {
    this.text = data.text;
    this.form = data.form;
    this.component = data.component;
    this.callback = data.callback;
  }
}

export class Modal {
  //nid的作用是映射map
  public nid: number;
  public base: ModalBase;
  public layout: ModalLayout;
  public content: ModalContent;
  public event: {
    [eventName: string]: {
      //其实直接走meta里面的modal也行。。。
      [listenerKey: string]: (modal: Modal) => any,
    },
  }
  public closed: boolean;

  constructor(data: { [key: string]: any }) {
    this.nid = data.nid;
    this.base = data.base;
    this.layout = data.layout;
    this.content = data.content;
    this.event = data.event;
    this.closed = data.closed;
  }
}

// ---------------------------------

export class ModalCreatorConfig {
  //base
  public title?: string;
  public alpha?: boolean;
  public key?: string;
  public single?: boolean;
  //layout
  // public x?: number;
  // public y?: number;
  public width?: number;
  public height?: number;
  public resizable?: boolean;
  public movable?: boolean;
  // public unit?: string;
  //content
  public text?: string;
  public form?:
    Array<ModalFormConstruct>
    | { [name: string]: string }
  ;
  public callback?:
    Array<ModalCallbackConstruct>
    | { [key: string]: (typeof formCallback) }
    | (typeof formCallback)
  ;
  public component?:
    string
    | Array<ModalComponentConstruct>
    | Array<string>
    | { [key: string]: { [key: string]: any } }
}

/**
 * 基本参数  ModalBase
 * 布局     ModalLayout
 * 内容     ModalContent
 *    表单列     [ModalFormConstruct]
 *    回调       [ModalCallbackConstruct]
 * */

export function createModal(config: ModalCreatorConfig): Modal {
  const base = {
    title: config.title ? config.title : '',
    key: config.key ? config.key : '',
    alpha: config.alpha ? !!config.alpha : false,
    single: config.single ? !!config.single : false,
  } as ModalBase;
  // -------------------------------------------------------------------
  const content = {
    text: config.text ? config.text : '',
    form: [],
    component: [],
    callback: [],
  } as ModalContent;
  //--- form ---
  if (!config.form) {
  } else if (config.form instanceof Array) {
    for (let i1 = 0; i1 < config.form.length; i1++) {
      content.form.push(Object.assign({
        name: '',
        key: '',
        value: '',
        type: 'text',
        options: false,
        multiple: false,
        disabled: false,
      }, config.form[i1]));
    }
  } else {
    for (const formKey in config.form) {
      if (!Object.prototype.hasOwnProperty.call(config.form, formKey)) continue;
      content.form.push({
        name: formKey,
        key: formKey,
        value: config.form[formKey],
        type: 'text',
        options: {},
        multiple: false,
        disabled: false,
      });
    }
  }
  //--- call---
  // let callClose = false;
  if (!config.callback) {
  } else if (config.callback instanceof Array) {
    for (let i1 = 0; i1 < config.callback.length; i1++) {
      // if (config.callback[i1].key === 'close') callbackClose = true;
      content.callback.push(Object.assign({
        name: config.callback[i1] && config.callback[i1].name ? config.callback[i1].name : '',
        key: config.callback[i1] && config.callback[i1].key ? config.callback[i1].key : '',
        callback: config.callback[i1]
          ? config.callback[i1].callback
          : function (form?: Array<ModalFormConstruct>, key?: string, on?: { [key: string]: () => any }): boolean {
            return true;
          },
      } as ModalCallbackConstruct, config.callback[i1]));
    }
  } else if (config.callback instanceof Function) {
    // callClose = true;
    content.callback.push({
      name: 'close',
      key: 'close',
      callback: config.callback,
    } as ModalCallbackConstruct);
  } else {
    for (const callKey in config.callback) {
      // console.debug(callKey);
      if (!Object.prototype.hasOwnProperty.call(config.callback, callKey)) continue;
      // if (callKey === 'close') callClose = true;
      content.callback.push({
        name: callKey,
        key: callKey,
        callback: config.callback[callKey] as (form?: Array<ModalFormConstruct>, key?: string, on?: { [key: string]: () => any }) => any,
      } as ModalCallbackConstruct);
    }
  }
  /*if (!callClose) {
    content.callback.push({
      name: 'close',
      key: 'close',
      callback: function (form: Array<ModalFormConstruct>, key?: string): boolean {
        return true;
      },
    } as ModalCallbackConstruct);
  }*/
  // ------------
  if (!config.component) {
  } else if (typeof config.component === 'string') {
    content.component.push({
      name: '',
      key: config.component,
      data: {},
    } as ModalComponentConstruct);
    // content.component[config.component] = {};
  } else if (config.component instanceof Array) {
    for (let i1 = 0; i1 < config.component.length; i1++) {
      if (typeof config.component[i1] === 'string') {
        content.component.push({
          name: '',
          key: config.component[i1],
          data: {},
        } as ModalComponentConstruct);
      } else {
        const component = Object.assign({
          name: '',
          key: '',
          data: {},
        }, config.component[i1]) as ModalComponentConstruct;
        if (!component.key) continue;
        content.component.push(component);
      }
    }
  } else {
    for (const componentKey in config.component) {
      if (!Object.prototype.hasOwnProperty.call(config.component, componentKey)) continue;
      const component = {
        name: '',
        key: componentKey,
        data: config.component[componentKey],
      } as ModalComponentConstruct;
      content.component.push(component);
    }
  }
  // -------------------------------------------------------------------
  const iw = window.innerWidth;
  const ih = window.innerHeight;
  //
  let defW = 250;
  let defH = 150;
  // if (content.form.length > 4 || content.callback.length > 2) {
  if (content.form.length > 4) {
    defW = 480;
    defH = 360;
    // defW = 250;
    // defH = 150;
  }
  if (config.width) defW = config.width;
  if (config.height) defH = config.height;
  // console.info()
  const targetW = config.width ? config.width : defW;
  const targetH = config.height ? config.height : defH;
  // console.warn(targetH, config.height, config.height, defH);
  //不可移动的不可变形
  //可移动的可变形
  //可移动的不可变形
  let resizable = config.resizable !== false;
  const movable = config.movable !== false;
  if (!movable) {
    resizable = false;
  }
  const diff = base.alpha ? 1000000000 : 100000000;
  const nid = ((new Date()).valueOf() % diff) + diff;
  const layout = {
    x: (iw - targetW) / 2,
    y: (ih - targetH) / 2,
    w: targetW,
    h: targetH,
    defX: (iw - defW) / 2,
    defY: (ih - defH) / 2,
    defW: config.resizable !== false ? defW : targetW,
    defH: config.resizable !== false ? defH : targetH,
    resizable: resizable,
    movable: movable,
    unit: 'px',
    active: false,
    fullscreen: false,
    index: nid,
    // resized: false,
  } as ModalLayout;
  //
  // console.debug(layout.h);
  return {
    nid,
    base,
    layout,
    content,
    event: {},
  } as Modal;
}
