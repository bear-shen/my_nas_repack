<template>
  <div class="file_browser" ref="browserDOM"
       @mouseenter="browserMeta.act.detail($event)"
       @mouseleave="browserMeta.act.detail($event)"
  >
    <div class="browser_content">
      <slot name="browser_content"></slot>
    </div>
    <div class="browser_navi">
      <div v-if="browserMeta.status.prev" class="left" @click="browserMeta.navi.prev"><span class="sysIcon sysIcon_arrowleft"></span></div>
      <div v-if="browserMeta.status.next" class="right" @click="browserMeta.navi.next"><span class="sysIcon sysIcon_arrowright"></span></div>
    </div>
    <!--    <div class="browser_meta" :style="{opacity:1}">-->
    <div class="browser_meta" :style="{
      opacity:
          ($store.state.browser.config.lock_detail||browserMeta.status.detail)?
          1:0
          }">
      <div class="browser_detail">
        <slot name="browser_detail"></slot>
      </div>
      <div class="browser_tool">
        <div class="btn_spec">
          <slot name="btn_spec"></slot>
        </div>
        <div class="btn_base">
          <button :class="['sysIcon',`sysIcon_player_${playMode}`]" @click="onPlayerMode"></button>
          <button :class="[
            'sysIcon','sysIcon_info-cirlce-o',{'active':$store.state.browser.config.lock_detail},
            ]" @click="browserMeta.act.detail"
          ></button>
          <!--          <button :class="['sysIcon','sysIcon_link',]" @click="browserMeta.act.share"></button>-->
          <button :class="['sysIcon','sysIcon_download',]" @click="browserMeta.act.download"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.file_browser {
  $naviWidth: $fontSize*2;
  width: 100%;
  height: 100%;
  overflow: hidden;
  //width: calc(100% - #{$fontSize*0.5});
  //height: calc(100% - #{$fontSize*0.5});
  position: relative;
  //background-color: white;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  //align-items: center;
  //align-content: center;
  > div {
    width: 100%;
  }
  > div {
  }
  .browser_content {
  }
  .browser_navi {
    position: absolute;
    height: 100%;
    pointer-events: none;
    .left, .right {
      pointer-events: all;
      position: absolute;
      top: 0;
      height: 100%;
      width: $naviWidth;
      color: map-get($colors, modal_browser_navi_font);
      background-color: map-get($colors, modal_browser_navi_alpha);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      &:hover {
        opacity: 1;
      }
    }
    .left {
      left: 0;
    }
    .right {
      right: 0;
    }
  }
  .browser_meta {
    width: calc(100% - 2 * #{$naviWidth});
    //width: 50%;
    position: relative;
    //left: $naviWidth;
    margin: 0 auto;
    //transition: opacity;
    /*opacity: 0;
    &:hover {
      opacity: 1;
    }*/
  }
  .browser_detail {
    width: 95%;
    margin: 0 auto;
    //height: $fontSize*2;
    line-height: $fontSize;
    font-size: $fontSize;
    text-shadow: black 2px 2px 4px,
    black 2px -2px 4px,
    black -2px 2px 4px,
    black -2px -2px 4px;
    > * {
      white-space: nowrap;
      //overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: $fontSize*0.5;
    }
    /*> *:last-child {
      margin-bottom: $fontSize;
    }*/
  }
  .browser_tool {
    margin: $fontSize*0.25 0 0;
    display: flex;
    justify-content: space-between;
    > div {
      white-space: nowrap;
      &.btn_spec {
        min-width: 70%;
      }
      > * {
        display: inline-block;
        vertical-align: bottom;
        align-items: normal;
        box-sizing: content-box;
        //button
        padding: $fontSize*0.5 $fontSize*0.25;
        font-size: $fontSize*1.25;
        height: $fontSize;
        line-height: $fontSize;
        background-color: map-get($colors, modal_browser_btn_alpha);
        &:hover, &.active {
          background-color: map-get($colors, modal_browser_btn_alpha_active);
        }
      }
    }
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {Modal as ModalConstructor} from '@/lib/ModalLib';
import {BrowserMeta, ModalMeta, Node} from '@/struct';
import fileListDemo from '@/demo/getFileList';

@Options({
  emits: ['close'],
  props: {
    modalMeta: Object as unknown as ModalMeta,
    browserMeta: Object as unknown as BrowserMeta,
    item: Object as unknown as Node,
  },
  components: {},
  data: function () {
    return {
      list: [] as Array<Node>,
      playMode: 'loop',
      // dt: true,
      // cur: 0,
      // item: false as unknown as Node,
      // show_detail: false,
    };
  },
  created: function () {
    console.debug('browser:base', this);
    /*const data = Object.assign({
      query: {},
      cur_id: 0,
    }, this.input)*/
    // const a = this.$store.framework.fold;
  },
  watch: {},
  mounted: function () {
    this.playMode = this.$store.state.browser.config.media_play_mode || 'loop';
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
      action: 'keyup',
      key: `hotkey_browser_base_${curIndex}`,
      callback: this.hotkeyMap.bind(this)
    });
  },
  beforeUnmount: function () {
    //
    const curIndex = (this.modalMeta as ModalMeta).modal.nid;
    this.$store.commit('event/release', {
      action: 'keyup',
      key: `hotkey_browser_base_${curIndex}`,
    });
  },
  methods: {
    onPlayerMode: function () {
      const modes = [
        'queue', 'loop', 'single', 'shuffle',
      ];
      let curIndex = modes.indexOf(this.playMode);
      curIndex += 1;
      if (curIndex >= modes.length) curIndex = 0;
      this.playMode = modes[curIndex];
      this.$store.commit('browser/set',
        {key: 'media_play_mode', value: this.playMode}
      );
      (this.browserMeta as BrowserMeta).navi.refresh();
      // console.debug('playMode:', this.playMode);
      // this.saveConf();
    },
    hotkeyMap: async function (e: KeyboardEvent) {
      // console.info(e.type, e.key, e.target, e);
      // console.info(e.type, e.key, this.$store.state.focus.last, (this.modalMeta as ModalMeta).modal.nid);
      if (['ArrowLeft', 'ArrowRight',].indexOf(e.key) === -1) return;
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
        // console.info(domWalker.className, domWalker.id, curIndex, domWalker.parentNode);
        if (domWalker.className === 'modal_item') {
          isCur = domWalker.id === curId;
          break;
        }
        domWalker = domWalker.parentNode;
      }
      // console.info(modalExists);
      if (!isCur) return;
      const isDefault = !!(domWalker.getElementsByClassName('browser_default_content').length);
      if (!isDefault) return;
      //第一次触发以后，把dom改到modal一层
      // 不然切换浏览器类型的时候会无法遍历
      this.$store.state.focus.last = domWalker;
      // console.info('set pager');
      // console.info(e.key);
      switch (e.key) {
        case 'ArrowLeft':
          this.browserMeta.navi.prev();
          break;
        case 'ArrowRight':
          this.browserMeta.navi.next();
          break;
      }
    },
  },
})
export default class Base extends Vue {
}
</script>
