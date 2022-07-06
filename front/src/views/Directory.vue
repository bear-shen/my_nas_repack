<template>
  <div class="content_meta">
    <div class="crumb" v-if="cur_dir &&cur_dir.tree">
      <a class="item"
         v-for="(tree_title,tree_index) in cur_dir.tree.title" :key="tree_index"
         @click="go('node',{id:cur_dir.tree.id[tree_index]})"
      >{{ tree_title }}</a>
      <a class="item">{{ cur_dir.title }}</a>
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
  <directory-layout
    :mode="mode"
    :type="type"
    :query="query"
    @set-current="setCurrentDir"
  ></directory-layout>
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
      //vertical-align: top;
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
      //vertical-align: top;
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
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import DirectoryItem from '@/components/DirectoryItem.vue';
import fileListDemo from '@/demo/getFileList';
import {ModalCreatorConfig} from '@/lib/ModalLib';
import {NodeItem} from '@/struct';
import DirectoryLayout from '@/components/DirectoryLayout.vue';
import {nodeListFields} from '@/columns';

@Options({
  components: {
    DirectoryLayout,
    DirectoryItem,
  },
  data: function () {
    return {
      type: 'directory',
      mode: '',
      query: {
        id: 0,
        title: '',
        type: 'any',
        sort: 'id_asc',
        tag: 0,
        // is_file: false,
      } as nodeListFields,
      cur_dir: {} as NodeItem,
    };
  },
  created: function () {
    this.getMode();
    this.type = this.getType(this.$route.path);
    this.query = this.$util.copy(this.$route.query);
    //
    // this.fetch();
  },
  watch: {
    $route: function (to, from) {
      const type = this.getType(to.path);
      if (!type) return;
      this.type = type;
      this.query = this.$util.copy(to.query);
    }
  },
  mounted: function () {
    return '';
  },
  methods: {
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
    //
    setCurrentDir: function (dirInfo: NodeItem) {
      console.info(dirInfo);
      this.cur_dir = dirInfo;
    },
    //
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
        const query = {} as nodeListFields;
        // const query = this.$util.copy(this.query);
        query.id = item.id;
        // console.debug(this.$route.path, query);
        this.$router.push({path: this.$route.path, query});
        return;
      }
      console.info('call detail', this.$route.query)
      const queryExt = this.$util.copy(this.$route.query) as nodeListFields;
      if (this.type === 'recycle') queryExt.filter = 'recycle';
      else if (this.type === 'favourite') queryExt.filter = 'favourite';
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
