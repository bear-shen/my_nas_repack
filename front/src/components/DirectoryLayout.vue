<template>
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
  props: {
    mode: String,
    type: String,
    query: Object,
  },
  data: function () {
    return {
      cur_dir: {} as NodeItem,
      list: [] as Array<NodeItem>,
    };
  },
  created: function () {
    return '';
  },
  watch: {
    $route: function (to, from) {
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
  },
})
export default class DirectoryLayout extends Vue {
}
</script>
