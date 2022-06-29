<template>
  <browser-base
    :item="item"
    :modal-meta="modalMeta"
    :browser-meta="browserMeta"
    ref="browser"
  >
    <template v-slot:browser_content>
      <template v-if="show">
        <video
          class="browser_content_media" ref="media" :item_id="item.id"
          :poster="item.file?.path_preview"
          @loadedmetadata="initMeta()"
          @ended="onEnd"
          @click="onStatus($event)"
          crossorigin="use-credentials"
        >
          <source :src="item.file?.path_normal">
          <track v-if="subtitles.length"
                 :src="subtitles[subtitleIndex].path"
                 kind="subtitles"
                 default
          >
        </video>
      </template>
    </template>
    <template v-slot:browser_detail>
      <p>{{ item.title }}</p>
      <p v-if="item.description">{{ item.description }}</p>
      <p class="subtitle">
        <span v-for="(subtitle,subIndex) in subtitles" :key="subIndex"
              :class="['sysIcon','sysIcon_filetext',{active:subIndex===subtitleIndex},]"
              @click="toggleSubtitle(subIndex)"
        >{{ subtitle.sub }}</span>
      </p>
    </template>
    <template v-slot:btn_spec>
      <button v-if="play" :class="['sysIcon','sysIcon_pause',]" @click="onStatus"></button>
      <button v-else :class="['sysIcon','sysIcon_caretright',]" @click="onStatus"></button>
      <div class="time_bar"
           @mousedown="onTimelineStart($event)"
           ref="timeline"
      >
        <div class="time_bar_item"></div>
      </div>
      <button class="time_stamp line_2">
        {{ parseTime(time) }}<br>
        {{ parseTime(duration) }}
      </button>
      <button :class="['sysIcon',{'sysIcon_volume':!mute},{'sysIcon_mute':mute},'line_2',]" @click="onMute()"><br>{{ volume }}</button>
      <button :class="['sysIcon','sysIcon_arrowsalt',]" @click="onFullscreen()"></button>
      <!--      <button :class="['sysIcon','sysIcon_shrink',]" @click="onFullscreen()"></button>-->
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
    video {
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      //transition: 0.1s cubic-bezier(0, 0.5, 0.5, 1) all;
      //transition: 0.1s cubic-bezier(0.5, 0, 1, 0.5) all;
      //transition: 0.1s all;
      //因为没有做过渡，css特效会导致定位出现问题。。。
      //transition: 0.1s cubic-bezier(0, 0.5, 0.5, 1) width,
      //0.1s cubic-bezier(0, 0.5, 0.5, 1) height,
      //0.1s cubic-bezier(0, 0.5, 0.5, 1) left,
      //0.1s cubic-bezier(0, 0.5, 0.5, 1) top;
    }
  }
  .browser_navi {
  }
  .browser_meta {
  }
  .browser_detail {
    .subtitle {
      span {
        margin-right: $fontSize;
      }
    }
  }
  .browser_tool {
    * {
      //font-size: $fontSize*0.75;
    }
    .time_bar, .time_stamp {
      padding-left: $fontSize*0.25;
      padding-right: $fontSize*0.25;
    }
    .time_bar {
      width: 45%;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      &::before {
        //position: absolute;
        content: '';
        background: map-get($colors, input_button_font);
        width: 100%;
        height: 2px;
      }
      .time_bar_item {
        left: $fontSize*0.25;
        position: absolute;
        content: '';
        background: map-get($colors, input_button_font);
        width: 2px;
        height: 50%;
      }
    }
    .line_2 {
      position: relative;
      font-size: $fontSize*0.75;
      line-height: $fontSize;
      padding-top: 0;
      padding-bottom: 0;
      height: $fontSize*2;
    }
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {Modal as ModalConstructor} from '@/lib/ModalLib';
import {BrowserMeta, ModalMeta, NodeItem} from '@/struct';
import fileListDemo from '@/demo/getFileList';
import BrowserBase from './Base.vue';

@Options({
  props: {
    modalMeta: Object as unknown as ModalMeta,
    browserMeta: Object as unknown as BrowserMeta,
    item: Object as unknown as NodeItem,
  },
  components: {
    BrowserBase
  },
  data: function () {
    return {
      //
      play: false,
      fullscreen: false,
      //
      mute: false,
      volume: 100,
      //
      time: 0,
      duration: 0,
      // init
      show: true,
      initTimer: 0,
      key: '' + (Math.random() * 100000000),
      //
      subtitles: [],
      subtitleIndex: 0,
    };
  },
  created: function () {
    console.debug('MediaBrowser:', this, this.input);
    // console.debug(this.modalMeta``);
  },
  watch: {
    item: function (to, from) {
      // console.debug('MediaBrowser:watch:item', to, from, this, this.has_next, this.has_prev);
      if (from.id === to.id) return;
      this.show = false;
      //加个延迟切一下media，不然切不过去的
      setTimeout(() => {
        this.show = true;
        // this.loadSubtitle();
        // this.initMeta();
      }, 10);
    },
  },
  mounted: function () {
    // console.debug('MediaBrowser:mounted',);
    (this.modalMeta as ModalMeta).register.resize('browser_media_resize', this.onResize);
    this.$refs.browser.$refs.browserDOM.addEventListener('wheel', this.onScroll, {passive: true});
    // console.info(this.$refs.browser.$refs.browserDOM.querySelector('.browser_content'));
    this.$refs.browser.$refs.browserDOM.querySelector('.browser_content').addEventListener('mousedown', this.onDragStart);
    // this.init();
    //在 this.$store.commit('browser/load'); 初始化
    this.mute = this.$store.state.browser.config.media_mute || false;
    this.volume = this.$store.state.browser.config.media_volume || 100;
    //
    setTimeout(() => {
      //toggleFocus函数因为写在app里，所以比翻页执行的晚，此时需要手工重定位focus
      //这么看focus其实写的很废物。。。
      this.$store.state.focus.last = document.getElementById(`modal_item_${
        (this.modalMeta as ModalMeta).modal.nid
      }`);
    }, 50);
    const curIndex = (this.modalMeta as ModalMeta).modal.nid;
    this.$store.commit('event/register', {
      //keydown显然体验更好，
      // 但是因为其他部分都是keyup，
      // 所以如果这边用keydown的话切时间切到头会多跳一次
      action: 'keyup',
      key: `hotkey_browser_${curIndex}`,
      callback: this.hotkeyMap.bind(this)
    });
  },
  beforeUnmount: function () {
    (this.modalMeta as ModalMeta).release.resize('browser_media_resize');
    //
    const curIndex = (this.modalMeta as ModalMeta).modal.nid;
    this.$store.commit('event/release', {
      action: 'keyup',
      key: `hotkey_browser_${curIndex}`,
    });
  },
  methods: {
    initMeta: function () {
      // console.debug('initMeta');
      const dom = (this.$refs.media as HTMLVideoElement);
      if (!dom) {
        this.initTimer = setTimeout(() => {
          this.initMeta();
        }, 10);
        return;
      }
      // console.debug('Browser:Media:init',);
      if (dom.readyState !== 4) return;
      this.loadSubtitle();
      this.time = 0;
      this.duration = dom.duration;
      // this.play = false;
      if (this.play) dom.play();
      else dom.pause();
      dom.volume = this.mute ? 0 : (this.volume / 100);
      this.modTimeLine(0);
      dom.addEventListener('timeupdate', this.onTimeChange);
      // console.info(dom.readyState);
    },
    loadSubtitle: async function () {
      const queryRes = await this.$query('file/list_subtitle', {title: this.item.title});
      if (queryRes === false) return;
      console.info(queryRes);
      this.subtitles = queryRes;
    },
    toggleSubtitle: function (index: number) {
      this.subtitleIndex = index;
    },
    parseTime: function (t: number) {
      const d = {
        h: '' + Math.floor(t / 3600),
        m: '' + Math.floor(t / 60 % 60),
        s: '' + Math.floor(t % 60),
      };
      if (d.m.length < 2) d.m = '0' + d.m;
      if (d.s.length < 2) d.s = '0' + d.s;
      let s = '' + d.s;
      if (d.m || d.h) s = `${d.m}:${s}`
      if (d.h) s = `${d.h}:${s}`
      // console.info(t, d);
      return s;
    },
    onTimelineStart: function (e: MouseEvent) {
      // console.debug('onTimelineStart', e);
      e.preventDefault();
      // this.dragging = {x: e.x, y: e.y,};
      this.onTimelineDragging(e);
      this.$store.commit('event/register', {
        action: 'drag', key: 'modal_browser_media_mousemove', callback: (e: Event) => {
          //drag可能会被触发，很难看。。。
          e.preventDefault();
        }
      });
      this.$store.commit('event/register', {action: 'mousemove', key: 'modal_browser_media_mousemove', callback: this.onTimelineDragging});
      this.$store.commit('event/register', {action: 'mouseup', key: 'modal_browser_media_mouseup', callback: this.onTimelineEnd});
      this.$store.commit('event/register', {action: 'mouseleave', key: 'modal_browser_media_mouseleave', callback: this.onTimelineEnd});
      // this.$store.commit('event/register', {action: 'mouseout', key: 'modal_browser_media_mouseout', callback: this.onTimelineEnd});
      //
    },
    onResize: function () {
      this.modTimeLine(this.time / this.duration);
    },
    onTimeChange: function (e: Event) {
      const vDom = (this.$refs.media as HTMLVideoElement);
      if (!vDom) return;
      // console.debug('onTimeChange', e, vDom.currentTime);
      this.time = vDom.currentTime;
      this.modTimeLine(this.time / this.duration);
    },
    onTimelineDragging: function (e: MouseEvent) {
      const dom = this.$refs.timeline as HTMLDivElement;
      const vDom = (this.$refs.media as HTMLVideoElement);
      const offset = {
        dx: this.$util.nodeOffsetX(dom),
        dpx1: Number.parseFloat(window.getComputedStyle(dom).getPropertyValue('padding-left').replace('px', '')),
        dpx2: Number.parseFloat(window.getComputedStyle(dom).getPropertyValue('padding-right').replace('px', '')),
        ex: e.x,
        // ey: e.y,
      };
      const ttLen = dom.offsetWidth - offset.dpx1 - offset.dpx2;
      const curLen = offset.ex - (offset.dx + offset.dpx1);
      const rate = curLen / ttLen;
      this.modTimeLine(rate);
      vDom.currentTime = rate * this.duration;
      // console.debug(ttLen, curLen);
    },
    onTimelineEnd: function (e: MouseEvent) {
      // console.debug('onTimelineEnd', e.type, e);
      this.$store.commit('event/release', {action: 'mousemove', key: 'modal_browser_media_mousemove'});
      this.$store.commit('event/release', {action: 'mouseup', key: 'modal_browser_media_mouseup'});
      this.$store.commit('event/release', {action: 'mouseleave', key: 'modal_browser_media_mouseleave'});
      // this.$store.commit('event/release', {action: 'mouseout', key: 'modal_browser_media_mouseout'});
    },
    modTimeLine: function (rate: number) {
      if (rate > 1) rate = 1;
      if (rate < 0) rate = 0;
      const dom = this.$refs.timeline as HTMLDivElement;
      const offset = {
        dpx1: Number.parseFloat(window.getComputedStyle(dom).getPropertyValue('padding-left').replace('px', '')),
        dpx2: Number.parseFloat(window.getComputedStyle(dom).getPropertyValue('padding-right').replace('px', '')),
      };
      const ttLen = dom.offsetWidth - offset.dpx1 - offset.dpx2;
      const curLen = rate * ttLen;
      (dom.querySelector('.time_bar_item') as HTMLDivElement).style.left = (curLen + offset.dpx1) + 'px';
    },
    onScroll: function (e: WheelEvent) {
      // console.debug('wheel evt', e.clientY, e.offsetY, e.pageY, e.y, e);
      if (!e.deltaY) return;
      const up = e.deltaY < 0;
      let target = this.volume;
      target += up ? 5 : -5;
      if (target > 100) target = 100;
      if (target < 0) target = 0;
      this.volume = target;
      this.mute = false;
      const dom = (this.$refs.media as HTMLVideoElement);
      dom.volume = this.mute ? 0 : (this.volume / 100);
      // this.saveConf();
      this.$store.commit('browser/set',
        [
          {key: 'media_volume', value: this.volume},
          {key: 'media_mute', value: this.mute},
        ]
      );
      // console.debug(dom.volume);
    },
    onMute: function () {
      this.mute = !this.mute;
      const dom = (this.$refs.media as HTMLVideoElement);
      dom.volume = this.mute ? 0 : (this.volume / 100);
      this.$store.commit('browser/set',
        {key: 'media_mute', value: this.mute}
      );
      // console.debug(dom.volume);
    },
    onStatus: function () {
      this.play = !this.play;
      const dom = (this.$refs.media as HTMLVideoElement);
      if (this.play) dom.play();
      else dom.pause();
      // this.saveConf();
    },
    onEnd: function (e: any) {
      // console.debug('onEnd:', e, this.$store.state.browser.config);
      const dom = (this.$refs.media as HTMLVideoElement);
      switch (this.$store.state.browser.config.media_play_mode) {
        case 'single':
          dom.currentTime = 0;
          dom.play();
          break;
        default:
          (this.browserMeta as BrowserMeta).navi.next();
          break;
      }
    },
    onFullscreen: function () {
      this.fullscreen = !this.fullscreen;
      const dom = (this.$refs.media as HTMLVideoElement);
      dom.requestFullscreen({navigationUI: 'show'});
    },
    hotkeyMap: async function (e: KeyboardEvent) {
      // console.info(e.type, e.key, e.target, e);
      if (['ArrowLeft', 'ArrowRight', ' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown',].indexOf(e.key) === -1) return;
      const curIndex = (this.modalMeta as ModalMeta).modal.nid;
      //输入不在body时禁用（input之类的）
      if (e.target && (e.target as HTMLElement).tagName !== 'BODY') return;
      //上次点击的内容在模态里，
      //判断一下这个模态还在不在（是否关闭）
      //在的话就不允许翻页（模态内部处理）
      // let inModal = false;
      let domWalker = this.$store.state.focus.last;
      let isCur = false;
      const curId = `modal_item_${curIndex}`;
      while (domWalker && domWalker.tagName !== 'BODY' && domWalker.tagName !== 'HTML') {
        // console.info(domWalker.className, domWalker.id, curIndex);
        if (domWalker.className === 'modal_item') {
          isCur = domWalker.id === curId;
          break;
        }
        domWalker = domWalker.parentNode;
      }
      // console.info(modalExists);
      if (!isCur) return;
      //第一次触发以后，把dom改到modal一层
      // 不然切换浏览器类型的时候会无法遍历
      this.$store.state.focus.last = domWalker;
      // console.info('set pager');
      // console.info(e.key);
      let toRate, toVol;
      const dom = (this.$refs.media as HTMLVideoElement);
      switch (e.key) {
        case 'ArrowLeft':
          // this.browserMeta.navi.prev();
          toRate = (dom.currentTime - 5) / this.duration;
          if (toRate <= 0) {
            this.browserMeta.navi.prev();
            break;
          }
          this.modTimeLine(toRate);
          dom.currentTime = toRate * this.duration;
          dom.play();
          this.play = true;
          break;
        case 'ArrowRight':
          // this.browserMeta.navi.next();
          toRate = (dom.currentTime + 5) / this.duration;
          if (toRate >= 1) {
            this.browserMeta.navi.next();
            break;
          }
          this.modTimeLine(toRate);
          dom.currentTime = toRate * this.duration;
          dom.play();
          this.play = true;
          break;
        case ' ':
          this.onStatus();
          break;
        case 'ArrowUp':
          // this.onZoomButton('up');
          this.onScroll({deltaY: -1});
          break;
        case 'ArrowDown':
          // this.onZoomButton('down');
          this.onScroll({deltaY: 1});
          break;
        case 'PageUp':
          this.browserMeta.navi.prev();
          break;
        case 'PageDown':
          this.browserMeta.navi.next();
          break;
      }
    },
  },
})
export default class Video extends Vue {
}
</script>
