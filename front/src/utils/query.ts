import {App} from '@vue/runtime-core';

import util from './util';
import getFileList from '../demo/getFileList';
import config from '@/config';
import {ModalCreatorConfig, ModalFormConstruct} from '@/lib/ModalLib';
import {store} from '@/lib/StoreLib';
import {useRouter} from 'vue-router';

const api = {
  node: {
    get: {
      path: 'node/get',
      query: {
        id: 'number',
        title: 'string',
        type: 'string',
        sort: 'string',
        is_fav: 'number',
        tag: 'number',
        page: 'number',
        total: 'number',
      },
    },
    put: {
      path: 'node/put',
      query: {
        type: 'string',//file|folder
        file: 'file',//has file,add file
      },
    },
    set: {
      path: 'node/set',
      query: {
        id: 'number',
        title: 'string',
        description: 'string',
      },
    },
    mv: {
      path: 'node/mv',
      query: {
        id: 'number',
        dir: 'number',
      },
    },
    op: {
      path: 'node/op',
      query: {
        id: 'number',
        op: 'string',//delete|share
      },
    },
  },
  tag: {
    get: {
      path: 'tag/get',
      query: {
        title: 'string',
        id_dir: 'number',
      },
    },
    set: {
      path: 'tag/set',
      query: {
        id: 'number',
        id_group: 'number',
        title: 'string',
        description: 'string',
        alt: 'array',
      },
    },
    op: {
      path: 'tag/op',
      query: {
        id: 'number',
        op: 'string',//delete
      },
    },
  },
  tag_group: {
    get: {
      path: 'tag_group/get',
      query: {
        title: 'string',
      },
    },
    set: {
      path: 'tag_group/set',
      query: {
        id: 'number',
        title: 'string',
        description: 'string',
        id_dir: 'number',
      },
    },
    op: {
      path: 'tag_group/op',
      query: {
        id: 'number',
        op: 'string',//delete
      },
    },
  },
  user: {
    get: {
      path: 'user/get',
      query: {
        id: 'number',
      },
    },
    set: {
      path: 'user/set',
      query: {
        id: 'number',
        name: 'string',
        mail: 'string',
        password: 'string',
      },
    },
    op: {
      path: 'user/op',
      query: {
        id: 'number',
        op: 'string',//delete
      },
    },
  },
  user_group: {
    get: {
      path: 'user_group/get',
      query: {
        title: 'string',
      },
    },
    set: {
      path: 'user_group/set',
      query: {
        id: 'number',
        title: 'string',
        description: 'string',
        auth: 'array',
      },
    },
    op: {
      path: 'user_group/op',
      query: {
        id: 'number',
        op: 'string',//delete
      },
    },
  },
  config: {
    get: {
      path: 'config/get',
      query: {
        title: 'string',
      },
    },
    set: {
      path: 'config/set',
      query: {
        id: 'number',
        title: 'string',
        description: 'string',
        value: 'any',
      },
    },
    op: {
      path: 'config/op',
      query: {
        id: 'number',
        op: 'string',//delete
      },
    },
  },
}

const query = function (
  path: string, data: { [key: string]: any } | FormData,
  extra?: {
    upload: (e: ProgressEvent) => any
  }
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    let formData: FormData;
    if (data instanceof FormData) {
      formData = data;
      // } else if (data) {
    } else {
      formData = new FormData();
      for (const dataKey in data) {
        if (!Object.prototype.hasOwnProperty.call(data, dataKey)) continue;
        formData.append(dataKey, data[dataKey]);
      }
    }
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 400) reject(xhr.statusText);
      const res = JSON.parse(xhr.responseText);
      switch (res.code) {
        case 10:
          throwLogin();
          // throwError(`${res.code}:${res.msg}`);
          resolve(false);
          break;
        case 100:
          throwError(`${res.code}:${res.msg}`);
          resolve(false);
          break;
        default:
          resolve(res.data);
          break;
      }
    };
    if (extra && extra.upload) xhr.upload.onprogress = extra.upload;
    xhr.open('POST', config.content.apiPath + path);
    const ifAuthed = localStorage.getItem('toshokan_auth_token');
    if (ifAuthed) xhr.setRequestHeader('Auth-Token', ifAuthed);
    xhr.send(formData);
  })
};

function throwLogin() {
  const modal = {
    title: 'check login',
    key: 'check_login',
    alpha: true,
    single: true,
    //不可移动的不能调整大小
    movable: true,
    resizable: true,
    width: 450,
    height: 150,
    // text: 'this is content',
    form: [
      {key: 'name', name: 'name', type: 'text'},
      {key: 'pass', name: 'password', type: 'text'},
    ],
    callback: [
      {
        key: 'login',
        name: 'login',
        callback: async (form: ModalFormConstruct[], key: string, on: { [key: string]: () => any }) => {
          console.info(form);
          const data = {
            name: form[0].value,
            pass: form[1].value,
          };
          const result = await query('user/login', data);
          console.info(data, result);
          if (!result || !result.token) return;
          localStorage.setItem('toshokan_auth_token', result.token);
          console.info(on);
          location.reload();
          if (on) on.close();
        }
      }
    ],
  } as ModalCreatorConfig;
  store.commit('modal/push', modal);
}

function throwError(msg: string) {
  const modal = {
    title: 'error occured',
    key: 'error',
    alpha: false,
    single: false,
    //不可移动的不能调整大小
    movable: true,
    resizable: true,
    width: 300,
    height: 100,
    text: msg,
    callback: (form, key, on) => {
      console.info(on);
      if (on) on.close();
    }
  } as ModalCreatorConfig;
  store.commit('modal/push', modal);
}

export default {
  install: (Vue: App, ...options: any[]): any => {
    Vue.config.globalProperties.$query = query;
    return this;
  },
  content: query,
};
