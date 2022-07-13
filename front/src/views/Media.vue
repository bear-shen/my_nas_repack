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
      :mode="mode"
      :query-ext="query"
    ></directory-layout>
    <!--    @set-cur-dir="setCurDir"-->
    <!--    -->
    <!--    :list="list"-->
    <!--    @go="go(...$event)"-->
    <!--    @delete="delFile(...$event)"-->
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
  display: flex;
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
  .content_body {
    //float: left;
    //这边用了flex所以不用严格限定宽度
    width: calc(100% - #{$fontSize*11});
    //width: 100%;
    padding: $fontSize*1;
    //background-color: map-get($colors, list_l1_bk);
    //overflow-x: hidden;
    //overflow-y: auto;
    //z-index: $hinterIndex;
    //@include smallScroll();
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
      mode: 'detail',
      query: {
        id: 0,
        type: 'any',
        cascade: 1,
        // is_file: false,
      } as nodeListFields,
      // count: 0,
    };
  },
  created: function () {
    return '';
  },
  watch: {
    $route: function (to, from) {
      if (to.path !== '/media') return;
      console.info(to, this.cur_dir, this.dir_list);
      this.getCurNodeList();
      this.query = this.$util.copy(this.query);
    }
  },
  mounted: function () {
    this.fetchNodeList();
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
        this.setCurDir(cur);
      }
    },
    setCurDir: function (dir: MediaDirDefinition) {
      this.query.id = dir.id;
      this.query.type = dir.target_type;
      this.query.cascade = 1;
      this.query.sort = 'id_asc';
      this.query.filter = 'directory';
      this.cur_dir = dir;
    },
  },
})
export default class Media extends Vue {
}
</script>
