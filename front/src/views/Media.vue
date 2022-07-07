<template>
  <div class="content_body content_media">
    <!--    -->
    <div class="media_nav" v-if="cur_dir">
      <div
        v-for="(item,index) in dir_list" :key="`media_nav_${index}`"
        @click="go(index)"
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
      :type="'directory'"
      :query="query"
      class="media_content"></directory-layout>
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
import {NodeItem} from '@/struct';
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
      cur_dir: null as unknown as NodeItem & {
        target_type: FileType | 'any',
        edit: boolean,
      },
      dir_list: [] as Array<NodeItem & {
        target_type: FileType | 'any',
        edit: boolean,
      }>,
      type: 'directory',
      mode: '',
      dir_query: {},
      query: {
        id: 0,
        title: '',
        type: 'any',
        cascade: 1,
        flag: ['file', 'tag', 'tree'],
        // is_file: false,
      } as nodeListFields,
    };
  },
  created: function () {
    return '';
  },
  watch: {},
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
      if (this.dir_list.length) {
        this.go(0);
      }
    },
    go: function (index: number): any {
      const dir = this.dir_list[index];
      this.query.id = dir.id;
      this.query.type = dir.target_type;
      this.cur_dir = dir;
      this.query = this.$util.copy(this.query);
      // return index;
    },
  },
})
export default class Media extends Vue {
}
</script>
