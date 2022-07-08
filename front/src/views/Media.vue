<template>
  <div class="content_body content_media">
    <!--    -->
    <div class="media_nav" v-if="cur_dir">
      <div
        v-for="(item,index) in dir_list" :key="`media_nav_${index}`"
        @click="selNodeList(index)"
        :class="{
          active:item.id===cur_dir.id&&item.target_type===cur_dir.target_type
        }"
      >
        <div class="title" v-html="item.title"></div>
        <div class="description" v-html="item.description"></div>
      </div>
    </div>
    <directory-layout
      v-if="cur_dir"
      :mode="'img'"
      :list="list"
      @go="go(...$event)"
      @delete="delFile(...$event)"
    ></directory-layout>
  </div>
</template>

<style lang="scss" scoped>
#frame_content {
  div.content_media {
    margin-bottom: 0;
  }
}
.content_media {
  padding-bottom: 0;
  height: 100%;
  position: relative;
  //display: flex;
  justify-content: left;
  flex-direction: row;
  .media_nav {
    height: 100%;
    width: $fontSize*10;
    background-color: map-get($colors, nav_2_bk);
    overflow-x: hidden;
    overflow-y: auto;
    z-index: $hinterIndex;
    @include smallScroll();
    //float: left;
    > div {
      padding: $fontSize*0.5;
      line-height: $fontSize*1.2;
    }
    .title {
      padding-bottom: $fontSize*0.25;
    }
    .description {
      color: map-get($colors, font_sub);
    }
    .active {
      background-color: map-get($colors, nav_2_active);
    }
  }
  .media_content {
    //float: left;
    //这边用了flex所以不用严格限定宽度
    //width: calc(100% - #{$fontSize});
    width: 100%;
    padding: $fontSize*0.5;
    background-color: map-get($colors, list_l1_bk);
    overflow-x: hidden;
    overflow-y: auto;
    z-index: $hinterIndex;
    @include smallScroll();
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import HelloWorld from '@/components/HelloWorld.vue'
import ContentEditable from '@/components/ContentEditable.vue';
import {MediaDirDefinition, NodeItem} from '@/struct';
import {ModalCreatorConfig} from '@/lib/ModalLib';
// import ImportFiles from '@/views/SettingTab/ImportFiles.vue';
import Demo from '@/views/SettingTab/Demo.vue';
import AddMedia from '@/views/SettingTab/AddMedia.vue';
import {shallowRef} from 'vue'
import {FileType, nodeListFields} from '@/columns';
import DirectoryLayout from '@/components/DirectoryLayout.vue';

@Options({
  components: {
    DirectoryLayout,
    ContentEditable,
  },
  data: function () {
    return {
      cur_dir: null as unknown as MediaDirDefinition,
      dir_list: [] as Array<MediaDirDefinition>,
      type: 'directory',
      mode: '',
      dir_query: {
        target_type: '',
        id_dir: 0,
      },
      query: {
        id: 0,
        title: '',
        type: 'any',
        cascade: 1,
        flag: ['file', 'tag', 'tree'],
        // is_file: false,
      } as nodeListFields,
      list: [] as Array<NodeItem>,
      count: 0,
    };
  },
  created: function () {
    return '';
  },
  watch: {
    $route: function (to, from) {
      console.info(to, this.cur_dir, this.dir_list);
      this.getCurNodeList();
    }
  },
  mounted: async function () {
    await this.fetchNodeList();
  },
  methods: {
    fetchNodeList: async function () {
      const res = await this.$query('config/get', {
        name: 'media_folder',
      });
      if (res === false) return;
      this.dir_list = res.value;
      this.getCurNodeList();
    },
    selNodeList: function (index: number) {
      const target = this.dir_list[index];
      this.$router.push(
        {
          path: this.$route.path,
          query: {
            target_type: target.target_type,
            id_dir: target.id,
          },
        });
    },
    getCurNodeList: function () {
      const dirId = this.$route.query.id_dir;
      const targetType = this.$route.query.target_type;
      //
      if (!dirId || !targetType) {
        return this.selNodeList(0);
      }
      for (let i1 = 0; i1 < this.dir_list.length; i1++) {
        const cur = this.dir_list[i1];
        if (cur.id.toString() !== dirId) continue;
        if (cur.target_type.toString() !== targetType) continue;
        this.cur_dir = cur;
      }
      this.fetch();
    },
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
      queryExt.flag = ['tag', 'file'];
      const queryRes = await this.$query('file/list', Object.assign(queryExt, this.query));
      if (queryRes === false) return;
      this.list = queryRes.list;
      // this.list = fileListDemo;
      this.cur_dir = queryRes.cur_dir;
      // this.$emit('set-current', queryRes.cur_dir);
      // this.cur_dir = queryRes.cur_dir;
      this.count = queryRes.size;

      this.$store.commit(
        'paginator/active',
        {
          count: Math.ceil(this.count / 100),
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
export default class Media extends Vue {
}
</script>
