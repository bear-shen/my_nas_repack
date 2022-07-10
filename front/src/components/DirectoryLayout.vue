<template>
  <div :class="['content_body', 'content_directory',mode]">
    <directory-item
      v-for="(item ,index) in list" :key="index"
      :item="item" :mode="mode" :index="index"
      @delete="delFile(index)"
      @go="go(...$event)"
    ></directory-item>
    <!--
    @delete="$emit('delete',index)"
    @go="$emit('go',$event)"
    -->
    <!--
    @delete="delFile(index)"
    @go="go(...$event)"
    -->
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
  emits: ['go', 'delete', 'setCurDir'],
  props: {
    mode: String,
    // type: String,
    // list: Array as unknown as Array<NodeItem>,
    queryExt: Object as unknown as nodeListFields,
  },
  data: function () {
    return {
      count: 0,
      query: {
        page: 0,
        flag: ['file', 'tag'],
      } as nodeListFields,
      list: [] as Array<NodeItem>,
    };
  },
  created: function () {
    return '';
  },
  watch: {
    queryExt: function (to, from) {
      console.info('DirectoryLayout queryExt:', to, from);
      for (const key in this.query) {
        if (!Object.prototype.hasOwnProperty.call(this.query, key)) continue;
        // this.query[key] = this.$route.query[key] || this.query_origin[key] || '';
        this.query[key] = this.$route.query[key] || '';
      }
      this.fetch();
    },
    /*$route: function (to, from) {
      //path不同的时候反正会重新
      console.info('DirectoryLayout route:', to, from);
      if (to.path !== from.path) return;
      for (const key in this.query) {
        if (!Object.prototype.hasOwnProperty.call(this.query, key)) continue;
        // this.query[key] = this.$route.query[key] || this.query_origin[key] || '';
        this.query[key] = this.$route.query[key] || '';
      }
      this.fetch();
    },*/
  },
  beforeUnmount: function () {
    console.info('DirectoryLayout unmounted',);
  },
  mounted: function () {
    console.info('DirectoryLayout mounted',);
    for (const key in this.query) {
      if (!Object.prototype.hasOwnProperty.call(this.query, key)) continue;
      // this.query[key] = this.$route.query[key] || this.query_origin[key] || '';
      this.query[key] = this.$route.query[key] || '';
    }
    this.fetch();
  },
  methods: {
    fetch: async function () {
      console.debug('directory:fetch', JSON.stringify(this.query));
      this.list = [];
      const query =
        Object.assign(
          Object.assign(
            {}, this.query
          ), this.queryExt
        ) as nodeListFields;
      /*console.info(
        JSON.stringify(this.queryExt),
        JSON.stringify(this.$route.query),
        JSON.stringify(query),
      )*/
      /*this.crumb = [
        {
          id: '0',
          type: 'node',
          title: 'root',
        },
      ];*/
      // const queryExt = {} as nodeListFields;
      // if (this.type === 'recycle') queryExt.filter = 'recycle';
      // else if (this.type === 'favourite') queryExt.filter = 'favourite';
      query.flag = ['tag', 'file'];
      const queryRes = await this.$query('file/list', query);
      if (queryRes === false) return;
      this.list = queryRes.list;
      // this.list = fileListDemo;
      this.$emit('setCurDir', queryRes.cur_dir);
      // this.cur_dir = queryRes.cur_dir;
      // this.$emit('set-current', queryRes.cur_dir);
      // this.cur_dir = queryRes.cur_dir;
      this.count = queryRes.size;

      this.$store.commit(
        'paginator/active',
        {
          count: Math.ceil(this.count / 5),
          current: this.$route.query.page ? this.$route.query.page * 1 : 1
        });
    },
    //
    go: function (type: string, meta: any, cascade: any) {
      console.debug(arguments,);
      // return;
      switch (type) {
        case 'tag':
          this.goTag(meta.id);
          break;
        case 'node':
          this.goDetail(meta, cascade);
          break;
      }
    },
    goTag: function (tagId: number) {
      const query =
        Object.assign(
          {
            tag: tagId,
          }, this.queryExt
        ) as nodeListFields;
      this.$router.push({path: this.$route.path, query});
    },
    goDetail: function (item: NodeItem, cascade: boolean) {
      //注意：导航条上转入的时候只有文件id
      if (!cascade && !item.is_file) {
        const query = {} as nodeListFields;
        // const query = this.$util.copy(this.query);
        query.id = item.id;
        // console.debug(this.$route.path, query);
        this.$router.push({path: this.$route.path, query});
        return;
      }
      console.info('call detail', this.$route.query)
      const queryExt = this.$util.copy(this.queryExt) as nodeListFields;
      if (cascade) queryExt.cascade = 1;
      queryExt.type = 'file';
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
  }
})
export default class DirectoryLayout extends Vue {
}
</script>
