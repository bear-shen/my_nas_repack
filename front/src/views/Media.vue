<template>
  <div class="content_body content_setting">
    <!--    -->
    <div class="setting_nav">
      <div
        v-for="(item,index) in dirList" :key="`setting_nav_${index}`"
        @click="go(index)"
        :class="{
          active:item.id===curDir.id&&item.target_type===curDir.target_type
        }"
      >
        <div class="title" v-html="item.title"></div>
        <div class="description" v-html="item.description"></div>
      </div>
    </div>
    <div
      class="setting_content"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
#frame_content {
  div.content_setting {
    margin-bottom: 0;
  }
}
.content_setting {
  padding-bottom: 0;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: left;
  flex-direction: row;
  .setting_nav {
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
  .setting_content {
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
import {FileType} from '@/columns';

@Options({
  components: {
    ContentEditable,
  },
  data: function () {
    return {
      dirList: [] as Array<NodeItem & {
        target_type: FileType | 'any',
      }>,
      curDir: {},
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
      this.dirList = res.value;
    },
    go: function (index: number): any {
      this.curDir = this.dirList[index];
      // return index;
    },
  },
})
export default class Media extends Vue {
}
</script>
