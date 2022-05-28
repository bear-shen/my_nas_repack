<template>
  <template v-if="!item||!item.is_file"></template>
  <template v-else-if="item.type==='image'">
    <image-browser
      :item="item"
      :modal-meta="modalMeta"
      :browser-meta="{
  navi: {
    next: next,
    prev: prev,
    refresh: refresh,
  },
  act: {
    detail: actDetail,
    download: actDownload,
    share: actShare,
  },
  status: {
    detail:show_detail,
    next:has_next,
    prev:has_prev,
  },
      }"
    ></image-browser>
  </template>
  <template v-else-if="item.type==='video'">
    <video-browser
      :item="item"
      :modal-meta="modalMeta"
      :browser-meta="{
  navi: {
    next: next,
    prev: prev,
    refresh: refresh,
  },
  act: {
    detail: actDetail,
    download: actDownload,
    share: actShare,
  },
  status: {
    detail:show_detail,
    next:has_next,
    prev:has_prev,
  },
      }"
    >
    </video-browser>
  </template>
  <template v-else-if="item.type==='audio'">
    <audio-browser
      :item="item"
      :modal-meta="modalMeta"
      :browser-meta="{
  navi: {
    next: next,
    prev: prev,
    refresh: refresh,
  },
  act: {
    detail: actDetail,
    download: actDownload,
    share: actShare,
  },
  status: {
    detail:show_detail,
    next:has_next,
    prev:has_prev,
  },
      }"
    >
    </audio-browser>
  </template>
  <template v-else-if="item.type==='pdf'">
    <pdf-browser
      :item="item"
      :modal-meta="modalMeta"
      :browser-meta="{
  navi: {
    next: next,
    prev: prev,
    refresh: refresh,
  },
  act: {
    detail: actDetail,
    download: actDownload,
    share: actShare,
  },
  status: {
    detail:show_detail,
    next:has_next,
    prev:has_prev,
  },
      }"
    >
    </pdf-browser>
  </template>
  <!--  text 这个要做的话就没完了，什么保存啊查看啊上传啊另存为啊都要做。。。 -->
  <!--  <template v-else-if="item.type==='text'">
      <browser-base        :item="item"        :modal-meta="modalMeta"
        :browser-meta="{
    navi: {      next: next,      prev: prev,      refresh: refresh,    },
    act: {      detail: actDetail,      download: actDownload,      share: actShare,    },
    status: {      detail:show_detail,      next:has_next,      prev:has_prev,    },
        }"
      >
        <template v-slot:browser_content>          todo,type:{{ item.type }}        </template>
      </browser-base>
    </template>
    <template v-else-if="item.type==='other'">
      <browser-base        :item="item"        :modal-meta="modalMeta"
        :browser-meta="{
    navi: {      next: next,      prev: prev,      refresh: refresh,    },
    act: {      detail: actDetail,      download: actDownload,      share: actShare,    },
    status: {      detail:show_detail,      next:has_next,      prev:has_prev,    },
        }"
      >
        <template v-slot:browser_content>          todo,type:{{ item.type }}        </template>
      </browser-base>
    </template>-->
  <template v-else>
    <browser-base
      :item="item"
      :modal-meta="modalMeta"
      :browser-meta="{
  navi: {
    next: next,
    prev: prev,
    refresh: refresh,
  },
  act: {
    detail: actDetail,
    download: actDownload,
    share: actShare,
  },
  status: {
    detail:show_detail,
    next:has_next,
    prev:has_prev,
  },
      }"
    >
      <template v-slot:browser_content>
        <div class="browser_default_content">
          <!--          <iframe :src="item.file.path_raw"></iframe>-->
          <p :class="['listIcon', `listIcon_file_${item.type}`,]"></p>
          <p class="title">{{ item.title }}</p>
          <p>{{ item.type }}</p>
          <p>{{ item.description }}</p>
          <p>{{ $util.kmgt(item.file ? item.file.size : 0) }}</p>
          <p>{{ item.time_update }}</p>
        </div>
      </template>
    </browser-base>
  </template>
</template>

<style lang="scss">
.file_browser {
  iframe {
    width: 100%;
    height: 100%;
  }
  .browser_default_content {
    text-align: center;
    width: 100%;
    //height: 100%;
    .listIcon {
      font-size: $fontSize*5;
      line-height: $fontSize*5;
      color: map-get($colors, font);
    }
    .title {
      font-size: $fontSize*1.25;
      line-height: $fontSize*1.25;
      word-break: break-all;
      color: map-get($colors, font);
    }
    p {
      margin-top: $fontSize*0.25;
      word-break: break-all;
      white-space: pre-line;
      color: map-get($colors, font_sub);
      line-height: 1.25em;
    }
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {Modal as ModalConstructor} from '@/lib/ModalLib';
import {ModalMeta, Node, BrowserMeta} from '@/struct';
import fileListDemo from '@/demo/getFileList';
import ImageBrowser from './browser/Image.vue';
import VideoBrowser from './browser/Video.vue';
import AudioBrowser from './browser/Audio.vue';
import PdfBrowser from './browser/Pdf.vue';
import BrowserBase from '@/modal/browser/Base.vue';

@Options({
  emits: ['close'],
  props: {
    modalMeta: Object as unknown as ModalMeta
    // input: Object as unknown as {
    //   item: Node,
    // },
    //模态框的基本设置
    // modal: Object as unknown as ModalConstructor,
    //模态框的DOM`
    // frame: Object as unknown as HTMLElement,
  },
  components: {
    ImageBrowser,
    VideoBrowser,
    AudioBrowser,
    PdfBrowser,
    BrowserBase,
  },
  data: function () {
    return {
      list: [] as Array<Node>,
      cur: 0,
      item: false as unknown as Node,
      show_detail: false,
      has_next: false,
      has_prev: false,
      hide_type: ['directory', 'subtitle'],
    };
  },
  created: function () {
    console.debug('Browser:created:', this, (this.modalMeta as ModalMeta).data);
    // console.debug(this.$store);
    // if (!this.modalMeta.modal.layout.resized) {
    // this.init();
    this.fetch();
    // }
    this.$store.commit('browser/load');
  },
  watch: {},
  mounted: function () {
    console.debug('Browser:mounted:', this, (this.modalMeta as ModalMeta).data);
    //
    /*setTimeout(() => {
     //toggleFocus函数因为写在app里，所以比翻页执行的晚，此时需要手工重定位focus
     //这么看focus其实写的很废物。。。
     this.$store.state.focus.last = document.getElementById(`modal_item_${
     (this.modalMeta as ModalMeta).modal.nid
     }`);
     }, 100);
     const curIndex = (this.modalMeta as ModalMeta).modal.nid;
     this.$store.commit('event/register', {
     action: 'keyup',
     key: `hotkey_browser_frame_${curIndex}`,
     callback: this.hotkeyMap.bind(this)
     });*/
  },
  beforeUnmount: function () {
    console.debug('Browser:beforeUnmount:', this, (this.modalMeta as ModalMeta).data);
    //
    /*const curIndex = (this.modalMeta as ModalMeta).modal.nid;
     this.$store.commit('event/release', {
     action: 'keyup',
     key: `hotkey_browser_frame_${curIndex}`,
     });*/
  },
  methods: {
    fetch: async function () {
      const query = JSON.parse(JSON.stringify((this.modalMeta as ModalMeta).data.query));
      console.debug('FileBrowser:Base:fetch', query);
      query.total = 1;
      const queryRes = await this.$query('file/list', query);
      if (queryRes === false) return;
      this.list = queryRes.list;
      // this.list = fileListDemo;
      for (let i1 = 0; i1 < this.list.length; i1++) {
        if (!(this.modalMeta as ModalMeta).data.item) continue;
        if ((this.modalMeta as ModalMeta).data.item.id !== this.list[i1].id) continue;
        this.cur = i1;
        this.item = this.list[i1];
        (this.modalMeta as ModalMeta).modal.base.title = this.item.title;
        if (this.$store.state.browser.config.media_play_mode === 'queue') {
          if (i1 !== 0) this.has_prev = true;
          if (i1 < this.list.length - 1) this.has_next = true;
        } else {
          this.has_prev = true;
          this.has_next = true;
        }
      }
    },
    init: function () {
      const modal = (this.modalMeta as ModalMeta).modal;
      // modal.layout.resized = true;
      const targetW = 480;
      const targetH = 320;
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      Object.assign(
        modal.layout,
        {
          defW: targetW,
          defH: targetH,
          w: targetW,
          h: targetH,
          x: (iw - targetW) / 2,
          y: (ih - targetH) / 2,
        }
      );
    },
    next: async function () {
      //遇到一个问题，现在视频和普通文件是写一起的，
      //但是视频又要支持各种随机播放循环播放之类的东西
      //所以在考虑设定成queue模式下不支持循环，且切换到普通文件之后重置为queue
      //
      //或者干脆就全部设置循环算了，
      //另外还有一个字幕的问题，这个再想
      console.debug('FileBrowser:next');
      const index = this.nextIndex();
      // console.info(index);
      if (index === -1) return;
      this.cur = index;
      this.item = this.list[this.cur];
      (this.modalMeta as ModalMeta).modal.base.title = this.item.title;
      this.has_prev = true;
      this.nextIndex();
    },
    prev: async function () {
      console.debug('FileBrowser:prev');
      const index = this.prevIndex();
      if (index === -1) return;
      this.cur = index;
      this.item = this.list[this.cur];
      (this.modalMeta as ModalMeta).modal.base.title = this.item.title;
      this.has_next = true;
      this.prevIndex();
    },
    refresh: function () {
      this.nextIndex();
      this.prevIndex();
    },
    nextIndex: function () {
      const mode = this.$store.state.browser.config.media_play_mode;
      //
      let fileCount = 0;
      for (let i = 0; i < this.list.length; i++) {
        if (this.hide_type.indexOf(this.list[i].type) !== -1) continue;
        fileCount++;
      }
      //
      let nextIndex = -1;
      for (let i = this.cur + 1; i < this.list.length; i++) {
        if (this.hide_type.indexOf(this.list[i].type) !== -1) continue;
        nextIndex = i;
        break;
      }
      //
      let truncatedNextIndex = -1;
      for (let i = 0; i < this.list.length; i++) {
        if (this.hide_type.indexOf(this.list[i].type) !== -1) continue;
        truncatedNextIndex = i;
        break;
      }
      // console.info(mode, fileCount, nextIndex, truncatedNextIndex);
      //
      let shuffleIndex = -1;
      switch (mode) {
        case 'queue':
          this.has_next = nextIndex !== -1;
          return nextIndex;
          break;
        case 'loop':
        case 'single':
          this.has_next = true;
          if (nextIndex === -1) nextIndex = truncatedNextIndex;
          return nextIndex;
          break;
        case 'shuffle':
          this.has_next = true;
          do {
            if (fileCount < 2) break;
            shuffleIndex = this.$util.randInt(0, this.list.length);
            if (shuffleIndex === this.cur) continue;
            if (!this.list[shuffleIndex]) continue;
            if (this.hide_type.indexOf(this.list[shuffleIndex].type) !== -1) continue;
            break;
          } while (true);
          return shuffleIndex;
          break;
        default:
          return -1;
      }
    },
    prevIndex: function () {
      const mode = this.$store.state.browser.config.media_play_mode;
      //
      let fileCount = 0;
      for (let i = 0; i < this.list.length; i++) {
        if (this.hide_type.indexOf(this.list[i].type) !== -1) continue;
        fileCount++;
      }
      //
      let nextIndex = -1;
      for (let i = this.cur - 1; i > -1; i--) {
        if (this.hide_type.indexOf(this.list[i].type) !== -1) continue;
        nextIndex = i;
        break;
      }
      //
      let truncatedNextIndex = -1;
      for (let i = this.list.length - 1; i > -1; i--) {
        if (this.hide_type.indexOf(this.list[i].type) !== -1) continue;
        truncatedNextIndex = i;
        break;
      }
      //
      let shuffleIndex = -1;
      switch (mode) {
        case 'queue':
          this.has_prev = nextIndex !== -1;
          return nextIndex;
          break;
        case 'loop':
        case 'single':
          this.has_prev = true;
          if (nextIndex === -1) nextIndex = truncatedNextIndex;
          return nextIndex;
          break;
        case 'shuffle':
          this.has_prev = true;
          do {
            if (fileCount < 2) break;
            shuffleIndex = this.$util.randInt(0, this.list.length);
            if (shuffleIndex === this.cur) continue;
            if (!this.list[shuffleIndex]) continue;
            if (this.hide_type.indexOf(this.list[shuffleIndex].type) !== -1) continue;
            break;
          } while (true);
          return shuffleIndex;
          break;
        default:
          return -1;
      }
    },
    /*chkNext: function () {
     let index = -1;
     for (let i = this.cur + 1; i < this.list.length; i++) {
     if (this.hide_type.indexOf(this.list[i].type)!==-1) continue;
     index = i;
     break;
     }
     this.has_next = index !== -1;
     console.debug('chkNext', index, this.has_next);
     return index;
     },
     chkPrev: function () {
     let index = -1;
     for (let i = this.cur - 1; i > -1; i--) {
     if (this.hide_type.indexOf(this.list[i].type)!==-1) continue;
     index = i;
     break;
     }
     this.has_prev = index !== -1;
     console.debug('chkPrev', index, this.has_prev);
     return index;
     },*/
    actDetail: async function (e: MouseEvent) {
      //穿透给base用的

      // console.info(e.type);
      let out, dom;
      switch (e.type) {
        case 'click':
          this.$store.commit('browser/set',
            {
              key: 'lock_detail',
              value: !this.$store.state.browser.config.lock_detail
            }
          );
          break;
        case 'mouseenter':
        case 'mouseover':
        case 'mouseleave':
        case 'mouseout':
          out = e.type === 'mouseleave' || e.type === 'mouseout';
          //这个是规范的写法，（path写法似乎也不是标准的）
          //但是用这个遇到v-if切dom的操作时会有问题
          // let dom = e.relatedTarget as HTMLElement;
          //target也是规范的，但是和srcElement一样对mouseout没效果，单独处理倒是可以。。。
          // let dom = e.target
          // let dom = e.srcElement
          // let dom = e.toElement
          //
          dom = e.target;
          if (!dom || (dom as HTMLElement).className !== 'file_browser') return;
          // console.debug(e.type, (dom as HTMLElement).className);

          this.show_detail = !out;
          break;
      }
    },
    actDownload: async function () {
      console.debug('FileBrowser:download');
      window.open(this.item.file.path_raw, '_blank');
    },
    actShare: async function () {
      console.debug('FileBrowser:share');
    },
    close: async function () {
      this.$emit('close');
    },
  },
})
export default class Browser extends Vue {
}
</script>
