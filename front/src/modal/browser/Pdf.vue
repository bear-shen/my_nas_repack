<template>
  <browser-base
    :item="item"
    :modal-meta="modalMeta"
    :browser-meta="browserMeta"
    ref="browser"
  >
    <template v-slot:browser_content>
      <template v-if="show">
        <iframe :src="item.file.path_raw"></iframe>
      </template>
    </template>
    <template v-slot:browser_detail>
    </template>
    <template v-slot:btn_spec>
    </template>
  </browser-base>
</template>

<style lang="scss">
.file_browser {
  $naviWidth: $fontSize*2;
  > div {
  }
  .browser_content {
    position: absolute;
    top: 0;
    //left: $naviWidth;
    //width: calc(100% - 2 * #{$naviWidth});
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    audio {
      display: none;
    }
  }
  .browser_navi {
  }
  .browser_meta {
  }
  .browser_detail {
  }
  .browser_tool {
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {Modal as ModalConstructor} from '@/lib/ModalLib';
import {BrowserMeta, ModalMeta, Node} from '@/struct';
import fileListDemo from '@/demo/getFileList';
import BrowserBase from './Base.vue';

@Options({
  props        : {
    modalMeta  : Object as unknown as ModalMeta,
    browserMeta: Object as unknown as BrowserMeta,
    item       : Object as unknown as Node,
  },
  components   : {
    BrowserBase
  },
  data         : function () {
    return {
      show: true,
    };
  },
  created      : function () {
    console.debug('MediaBrowser:', this, this.input);
    // console.debug(this.modalMeta``);
  },
  watch        : {
    item: function (to, from) {
      // console.debug('MediaBrowser:watch:item', to, from, this, this.has_next, this.has_prev);
      if (from.id === to.id) return;
      this.show = false;
      //加个延迟切一下media，不然切不过去的
      setTimeout(() => {
        this.show = true;
        // this.initMeta();
      }, 10);
    },
  },
  mounted      : function () {
    // console.debug('MediaBrowser:mounted',);
    (this.modalMeta as ModalMeta).register.resize('browser_media_resize', this.onResize);
    const curIndex = (this.modalMeta as ModalMeta).modal.nid;
  },
  beforeUnmount: function () {
    const curIndex = (this.modalMeta as ModalMeta).modal.nid;
  },
  methods      : {
    onResize: function () {
      return '';
    },
  },
})
export default class Pdf extends Vue {
}
</script>
