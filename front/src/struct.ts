import {Vue} from 'vue-class-component';
import {Modal, ModalComponentConstruct} from './lib/ModalLib';

export class Tag {
  public id?: number;
  public id_group?: number;
  public title?: string;
  public alt?: Array<string>;
  public description?: string;
  public status?: number;
  public time_create?: string;
  public time_update?: string;
}

export class TagGroup {
  public id?: number;
  public title?: string;
  public description?: string;
  public id_dir?: number;
  public status?: number;
  public time_create?: string;
  public time_update?: string;
  public dir?: {
    id?: number, title?: string,
  };
  public tree?: {
    id?: Array<number>,
    title?: Array<string>,
  }
  public sub?: Array<Tag>;
}

export class User {
  public id?: number;
  public name?: string;
  public mail?: string;
  public password?: string;
  public status?: number;
  public time_create?: string;
  public time_update?: string;
}

export class UserGroup {
  public id?: number;
  public title?: string;
  public description?: string;
  public status?: number;
  public time_create?: string;
  public time_update?: string;
  public auth?: Array<{
    dir?: {
      id?: number, title?: string,
    };
    tree?: {
      id?: Array<number>,
      title?: Array<string>,
    }
    allow_r?: boolean | number,
    allow_w?: boolean | number,
  }>;
  public user?: Array<User>;
}

export class File {
  public id?: number;
  public path_cover?: string;
  public path_preview?: string;
  public path_raw?: string;
  // public path_subtitle?: string;
  public path_normal?: string;
  // public path_raw?: string;
}

export class Node {
  public id?: number;
  public id_parent?: number;
  public title?: string;
  public description?: string;
  public type?: string;

  public is_file?: number;
  public is_fav?: number;
  public status?: number;

  public cover?: File

  //这么写方便操作，反正这块后端也得手工处理
  public tree?: {
    id?: Array<number>,
    title?: Array<string>,
  }

  public tag?: Array<TagGroup>

  public file?: File;

  public time_create?: string;
  public time_update?: string;
}

export class ModalMeta {
  //如果有事件的话，调用这里注册事件，由modal.vue内部管理
  //外部事件向内部传入，
  register: {
    resize: (key: string, callback: () => any) => any;
  };
  release: {
    resize: (key: string) => any;
  };
  //这个按道理可以用emit，但是麻烦点，总之先加上去了
  close: () => any;
  // reg: ModalMetaReg;
  // release: ModalMetaReg;
  dom: HTMLElement;//prev:frame -> $refs.modalFrame
  // instance: Vue;
  // modal_index: number;
  component_index: number;
  modal: Modal;//prev:modal -> $store.state.modal.list ->
  data: { [key: string]: any };//component.data modal sub data ModalComponentConstruct->data

  constructor(data: { [key: string]: any }) {
    this.register = data.register;
    this.release = data.release;
    this.close = data.close;
    this.dom = data.dom;
    // this.instance = data.instance;
    this.modal = data.modal;
    this.data = data.data;
    // this.modal_index = data.modal_index;
    this.component_index = data.component_index;
  }
}

export class BrowserMeta {
  navi: {
    next: () => any;
    prev: () => any;
    refresh: () => any;
  }
  act: {
    detail: () => any;
    download: () => any;
    share: () => any;
  }
  status: {
    detail: boolean;
    next: boolean;
    prev: boolean;
  }

  constructor(data: { [key: string]: any }) {
    this.navi = data.navi;
    this.act = data.act;
    this.status = data.status;
  }
}
