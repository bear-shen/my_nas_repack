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
import {nodeListFields} from '@/columns';

@Options({
  components: {
    DirectoryItem
  },
  emits: ['set-current',],
  props: {
    mode: String,
    type: String,
    query: Object as unknown as nodeListFields,
  },
  data: function () {
    return {
      cur_dir: {} as NodeItem,
      list: [] as Array<NodeItem>,
      page_size: 0,
    };
  },
  created: function () {
    return '';
  },
  watch: {
    query: function (to, from) {
      this.fetch();
    },
    // $route: function (to, from) {
    //   this.fetch();
    // },
  },
  mounted: function () {
    this.fetch();
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
      const queryExt = {} as nodeListFields;
      if (this.type === 'recycle') queryExt.filter = 'recycle';
      else if (this.type === 'favourite') queryExt.filter = 'favourite';
      const queryRes = await this.$query('file/list', Object.assign(queryExt, this.query));
      if (queryRes === false) return;
      this.list = queryRes.list;
      // this.list = fileListDemo;

      this.$emit('set-current', queryRes.cur_dir);
      // this.cur_dir = queryRes.cur_dir;
      this.page_size = queryRes.size;

      this.$store.commit(
        'paginator/active',
        {
          count: this.page_size,
          current: this.$route.query.page ? this.$route.query.page * 1 : 1
        });
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
    delFile: function (index: number) {
      console.debug(index, arguments)
      if (this.list[index]) {
        this.list.splice(index, 1);
      }
    },
  },
})
export default class DirectoryLayout extends Vue {
}
</script>
