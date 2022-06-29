<template>
  <div class="content_meta">
    <div class="crumb" v-if="cur_dir &&cur_dir.tree">
      <a class="item"
         v-for="(tree_title,tree_index) in cur_dir.tree.title" :key="tree_index"
         @click="go('node',{id:cur_dir.tree.id[tree_index]})"
      >{{ tree_title }}</a>
      <a class="item">{{cur_dir.title}}</a>
    </div>
    <div class="search">
      <label>
        <span>Title : </span><input type="text" v-model="query.title">
      </label>
      <label>
        <span>Type : </span><select v-model="query.type">
        <option>any</option>
        <option>directory</option>
        <option>audio</option>
        <option>video</option>
        <option>image</option>
        <option>binary</option>
        <option>text</option>
        <option>pdf</option>
        <option>other</option>
      </select>
      </label>
      <label>
        <span>Sort : </span>
        <select v-model="query.sort">
          <option value="id_asc">id ↑</option>
          <option value="id_desc">id ↓</option>
          <option value="name_asc">name ↑</option>
          <option value="name_desc">name ↓</option>
          <option value="crt_asc">crt time ↑</option>
          <option value="crt_desc">crt time ↓</option>
          <option value="upd_asc">upd time ↑</option>
          <option value="upd_desc">upd time ↓</option>
        </select>
      </label>
      <!--      <label>
              <input
                type="checkbox"
                id="content_directory_directory_only_checkbox"
                v-model="query.is_fav"
                :true-value="'1'"
                :false-value="'0'"
              >
              <label for="content_directory_directory_only_checkbox">Fav</label>
            </label>-->
      <label>
        <button @click="search">search</button>
      </label>
    </div>
    <div class="display">
      <a class="sysIcon sysIcon_addfolder" @click="addFolder"></a>
      <a class="sysIcon sysIcon_addfile" @click="addFile"></a>
      <a class="sysIcon sysIcon_fengefu"></a>
      <a
        :class="['sysIcon' ,'sysIcon_listType_detail',{active:mode==='detail'}]"
        @click="setMode('detail')"
      ></a>
      <a
        :class="['sysIcon' ,'sysIcon_listType_text',{active:mode==='text'}]"
        @click="setMode('text')"
      ></a>
      <a
        :class="['sysIcon' ,'sysIcon_listType_img',{active:mode==='img'}]"
        @click="setMode('img')"
      ></a>
    </div>
  </div>
  <div :class="['content_body', 'content_directory',mode]">
    <directory-item
      v-for="(item ,index) in list" :key="index"
      :item="item" :mode="mode" :index="index"
      @delete="delFile(index)"
      @go="go(...$event)"
    ></directory-item>
  </div>
</template>

<style lang="scss" scoped>
.content_meta {
  display: flex;
  justify-content: space-between;
  background-color: map-get($colors, content_meta_bk);
  flex-wrap: wrap;
  $lineHeight: $fontSize*2;
  .crumb {
    //display: flex;
    line-height: $lineHeight;
    //height: $fontSize*1.5;
    //font-size: $fontSize*0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 50%;
    .item {
      $padH: ($lineHeight - $fontSize)/2;
      //line-height: $lineHeight;
      display: inline;
      //margin: 0 $fontSize*0.25 0 0;
      padding: $padH $fontSize*0.25 $padH 0;
    }
    .item::before {
      display: inline-block;
      content: '\\';
      padding: 0 $fontSize*0.25;
    }
    .item:hover {
      background-color: black;
    }
  }
  .search {
    line-height: $lineHeight;
    //height: $fontSize*1.5;
    > * {
      padding: 0 $fontSize*0.5;
      display: inline-block;
    }
    input, select, button, option {
      line-height: $lineHeight;
      height: $lineHeight;
      //padding: 0;
      vertical-align: top;
      font-size: $fontSize;
      padding: 0 $fontSize*0.5;
      max-width: $fontSize*7.5;
    }
    select {
    }
    input, select {
      border-bottom: 1px solid map-get($colors, input_font);
      line-height: calc(#{$lineHeight} - 1px);
      height: calc(#{$lineHeight} - 1px);
      background: transparent;
    }
    option {
      background-color: map_get($colors, input_button_bk);
    }
    input[type='checkbox'] + label {
      height: $lineHeight;
      padding: 0 $fontSize*0.5;
      line-height: $lineHeight;
      vertical-align: top;
    }
    input[type='checkbox'] + label::before {
      font-family: "sysIcon";
      font-size: 16px;
      font-style: normal;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      padding-right: $fontSize*0.5;
      content: '\e600';
    }
    input[type='checkbox']:checked + label::before {
      content: '\e62c';
    }
  }
  .display {
    font-size: $fontSize;
    line-height: $lineHeight;
    a {
      display: inline-block;
      width: $fontSize*1.5;
      text-align: center;
    }
    a:hover, a.active {
      background-color: map-get($colors, input_button_bk_active);
    }
  }
}
.content_directory {
  $lineHeight: $fontSize*2;
  //padding: $fontSize*0.25;
  &.detail {
    columns: 4;
    @media (max-width: $narrowWidth) {
      columns: 3;
    }
    @media (max-width: $tabletWidth) {
      columns: 2;
    }
    @media (max-width: $mobileWidth) {
      columns: 1;
    }
    column-span: none;
    //display: flex;
    //flex-wrap: wrap;
    //justify-content: space-between;
    > .item {
      break-inside: avoid;
    }
  }
  &.img {
    //display: flex;
    //flex-wrap: wrap;
    //justify-content: space-around;
    columns: 6;
    @media (max-width: $narrowWidth) {
      columns: 5;
    }
    @media (max-width: $tabletWidth) {
      columns: 3;
    }
    @media (max-width: $mobileWidth) {
      columns: 2;
    }
    > .item {
      break-inside: avoid;
    }
  }
  &.text {
    display: table;
    width: 100%;
    //flex-direction: column;
    //flex-wrap: wrap;
    //justify-content: start;
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import DirectoryItem from '@/components/DirectoryItem.vue';
import fileListDemo from '@/demo/getFileList';
import {ModalCreatorConfig} from '@/lib/ModalLib';
import {NodeItem} from '@/struct';

@Options({
  components: {
    DirectoryItem
  },
  data: function () {
    return {
      crumb: [],
      type: 'directory',
      mode: '',
      query: {
        id: '0',
        title: '',
        type: 'any',
        sort: 'id_asc',
        tag_id: '0',
        is_fav: '0',
        // is_file: false,
      },
      page_size: 0,
      cur_dir: {} as NodeItem,
      list: [] as Array<NodeItem>,
    };
  },
  created: function () {
    this.getMode();
    this.type = this.getType(this.$route.path);
    this.query = this.$util.copy(this.$route.query);
    //
    this.fetch();
  },
  watch: {
    $route: function (to, from) {
      const type = this.getType(to.path);
      if (!type) return;
      this.type = type;
      this.query = this.$util.copy(to.query);
      //
      this.fetch();
    }
  },
  mounted: function () {
    return '';
  },
  methods: {
    fetch: async function () {
      console.debug('directory:fetch', JSON.stringify(this.query));
      this.list = [];
      /*this.crumb = [
        {
          id: '0',
          type: 'node',
          title: 'root',
        },
      ];*/
      const queryExt = {} as { [key: string]: any };
      if (this.type === 'recycle') queryExt.recycle = 1;
      if (this.type === 'favourite') queryExt.favourite = 1;
      const queryRes = await this.$query('file/list', Object.assign(queryExt, this.query));
      if (queryRes === false) return;
      this.list = queryRes.list;
      // this.list = fileListDemo;
      this.cur_dir = queryRes.cur_dir;
      this.page_size = queryRes.size;

      this.$store.commit(
        'paginator/active',
        {
          count: this.page_size,
          current: this.$route.query.page ? this.$route.query.page * 1 : 1
        });
    },
    search: function () {
      const query = this.$util.copy(this.query);
      this.$router.push({
        query: query,
        path: this.$route.path,
      });
    },
    addFile: function () {
      //todo
      const addFileModal = {
        title: `upload to: ${this.cur_dir.title}`,
        key: 'directory_upload_file',
        alpha: false,
        single: true,
        //不可移动的不能调整大小
        movable: true,
        resizable: true,
        width: 320,
        height: 180,
        // text: 'this is content',
        component: {
          Uploader: {
            item: this.cur_dir,
            callback: () => {
              console.debug('call');
            },
          },
        },
        /*callback: () => {
          console.debug('call close');
          return '';
        },*/
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', addFileModal);
    },
    addFolder: function () {
      //todo
      const addFolderModal = {
        title: `add folder to: ${this.cur_dir.title}`,
        key: 'add_folder',
        alpha: false,
        single: true,
        //不可移动的不能调整大小
        movable: true,
        resizable: true,
        width: 320,
        height: 180,
        // text: 'this is content',
        form: [
          {name: 'title', type: 'text',},
          {name: 'description', type: 'textarea',},
        ],
        callback: [
          {
            key: 'create',
            name: 'create',
            callback: async (form, key, on) => {
              console.info(form, key, on);
              const queryRes = await this.$query('file/add_folder', {
                parent_id: this.cur_dir.id,
                title: (form as any)[0].value,
                description: (form as any)[1].value,
              });
              if (queryRes === false) return;
              (on as any).close();
            },
          },
          {
            key: 'close',
            name: 'close',
            callback: (form, key, on) => (on as any).close(),
          },
        ],
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', addFolderModal);
    },
    go: function (type: string, meta: any) {
      console.debug(arguments,);
      // return;
      switch (type) {
        case 'tag':
          this.goTag(meta.id);
          break;
        case 'node':
          this.goDetail(meta);
          break;
      }
    },
    goTag: function (tagId: number) {
      const query = this.$util.copy(this.query);
      query.tag = tagId;
      this.$router.push({path: this.$route.path, query});
    },
    goDetail: function (item: NodeItem) {
      //注意：导航条上转入的时候只有文件id
      if (!item.is_file) {
        const query = {} as { [key: string]: any };
        // const query = this.$util.copy(this.query);
        query.id = item.id;
        // console.debug(this.$route.path, query);
        this.$router.push({path: this.$route.path, query});
        return;
      }
      console.info('call detail', this.$route.query)
      const queryExt = this.$util.copy(this.$route.query) as { [key: string]: any };
      if (this.type === 'recycle') queryExt.recycle = 1;
      if (this.type === 'favourite') queryExt.favourite = 1;
      const openFileModal = {
        title: 'file detail',
        key: 'file_detail',
        alpha: false,
        single: false,
        //不可移动的不能调整大小
        movable: true,
        resizable: true,
        width: 480,
        height: 320,
        // text: 'this is content',
        component: {
          FileBrowser: {
            item: item,
            query: queryExt,
            fetch: this.fetch,
          },
        },
        /*call: () => {
          console.debug('call close');
          return '';
        },*/
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', openFileModal);
    },
    delFile: function (index: number) {
      console.debug(index, arguments)
      if (this.list[index]) {
        this.list.splice(index, 1);
      }
    },
    // ------------------------------------------------
    getType: function (path: string) {
      // console.debug(to);
      let curType: string | boolean = false;
      switch (path) {
        case '/':
          curType = 'directory';
          break;
        case '/favourite':
          curType = 'favourite';
          break;
        case '/share':
          curType = 'share';
          break;
        case '/recycle':
          curType = 'recycle';
          break;
      }
      return curType;
    },
    // ------------------------------------------------
    copy: function (data: any) {
      return JSON.parse(JSON.stringify(data));
    },
    setMode: function (mode: string) {
      this.mode = mode;
      localStorage.setItem('toshokan_directory_mode', mode);
    },
    getMode: function () {
      let cur = localStorage.getItem('toshokan_directory_mode');
      if (!cur) cur = 'detail';
      this.mode = cur;
    },
  },
})
export default class Directory extends Vue {
}
</script>
