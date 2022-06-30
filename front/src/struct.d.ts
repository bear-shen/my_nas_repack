import {
  FileType,
  NodeCol,
  FileCol,
  UserGroupCol,
  UserCol,
  TagGroupCol,
  TagCol,
  AuthCol,
  QueueCol,
  SettingCol,
} from './columns';

type TagItem = TagCol;

type TagGroupItem = TagGroupCol & {
  dir?: {
    id?: number; title?: string;
  };
  tree?: {
    id?: Array<number>;
    title?: Array<string>;
  };
  sub?: TagItem[];
}

type UserItem = UserCol;

type UserGroupItem = UserGroupCol & {
  user?: Array<UserItem>;
  auth?: Array<{
    id_dir: number;
    allow_r: boolean | number,
    allow_w: boolean | number,
    dir?: {
      id?: number; title?: string;
    };
    tree?: {
      id?: Array<number>;
      title?: Array<string>;
    };
  }>;
}

type FileItem = FileCol & {
  path_cover?: string;
  path_preview?: string;
  path_raw?: string;
  // public path_subtitle?: string;
  path_normal?: string;
  // public path_raw?: string;
}

type NodeItem = NodeCol & {
  is_file?: number;
  is_fav?: number;
  cover?: FileItem;
  //这么写方便操作，反正这块后端也得手工处理
  tree?: {
    id?: Array<number>;
    title?: Array<string>;
  };
  tag?: Array<TagGroupItem>;
  file?: FileItem;
}

interface ModalMeta {
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
}

interface BrowserMeta {
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
}
