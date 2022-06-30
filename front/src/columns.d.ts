type FileType = 'audio' | 'video' | 'image' | 'binary' | 'text' | 'subtitle' | 'pdf';

interface NodeCol {
  id?: number,
  id_parent?: number,
  // id_cover?: number,
  // id_file?: number,
  type?: FileType | 'directory',
  title?: string,
  description?: string,
  sort?: number,
  //@deprecated
  //想加的，但是想了一想就这样吧
  // -1 级联删除
  //  0 删除
  //  1 正常
  status?: number,
  //文件是否建立完成
  // 0 完成
  // 1 等待加载
  building?: number,
  //节点树
  list_node?: number[],
  //标签
  list_tag_id?: number[],
  time_create?: string,
  time_update?: string,
  //文件
  index_file_id?: {
    preview?: any,
    normal?: any,
    cover?: any,
    raw: any,
    [key: string]: any,
  },
  //节点索引
  index_node?: { [key: string]: any },
}

interface FileCol {
  id?: number,
  hash?: string,
  type?: FileType,
  suffix?: string,
  // path?: { [key: string]: any },
  path: string
  meta?: { [key: string]: any },
  size?: number,
  status?: number,
  time_create?: string,
  time_update?: string,
}

interface UserGroupCol {
  id?: number,
  title?: string,
  description?: string,
  admin?: number,
  status?: number,
  auth?: Array<{
    id_dir: number;
    allow_r: boolean | number,
    allow_w: boolean | number,
  }>,
  time_create?: string,
  time_update?: string,
}

interface UserCol {
  id?: number,
  name?: string,
  mail?: string,
  password?: string,
  id_group?: number,
  status?: number,
  time_create?: string,
  time_update?: string,
}

interface TagGroupCol {
  id?: number,
  title?: string,
  description?: string,
  sort?: number,
  status?: number,
  id_dir?: number,
  time_create?: string,
  time_update?: string,
}

interface TagCol {
  id?: number,
  id_group?: number,
  title?: string,
  alt?: string[],
  description?: string,
  status?: number,
  index_tag?: string,
  time_create?: string,
  time_update?: string,
}

interface AuthCol {
  id?: number,
  uid?: number,
  token?: string,
  time_create?: string,
  time_update?: string,
}

interface QueueCol {
  id?: number,
  type?: string,
  payload?: { [key: string]: any },
  status?: number,
  time_create?: string,
  time_update?: string,
}

interface SettingCol {
  id?: number,
  key?: string,
  value?: { [key: string]: any },
  time_create?: string,
  time_update?: string,
}
