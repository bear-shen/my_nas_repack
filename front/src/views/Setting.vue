<template>
  <div class="content_body content_setting">
    <!--    -->
    <div class="setting_nav">
      <div
        v-for="(item,index) in list" :key="`setting_nav_${index}`" @click="go(index)"
        :class="{active:item.key===cur.key}"
      >
        <div class="title" v-html="item.title"></div>
        <div class="description" v-html="item.description"></div>
      </div>
    </div>
    <component
      class="setting_content" :is="cur.model"
    ></component>
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

@Options({
  components: {
    ContentEditable,
  },
  data: function () {
    const list = [
      /*{
        key: 'import_files',
        title: 'import files',
        description: 'import files from local dir',
        model: ImportFiles,
      },*/
      {
        key: 'demo',
        title: 'a demo',
        description: 'this is a demo',
        model: Demo,
      },
    ];
    return {
      list: list,
      cur: list[0],
    };
  },
  created: function () {
    return '';
  },
  watch: {},
  mounted: function () {
    return '';
  },
  methods: {
    go: function (index: number): any {
      this.cur = this.list[index];
      // return index;
    },
  },
})
export default class Setting extends Vue {
}
</script>
