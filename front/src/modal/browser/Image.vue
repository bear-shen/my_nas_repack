<template>
  <browser-base
    :item="item"
    :modal-meta="modalMeta"
    :browser-meta="browserMeta"
    ref="browser"
  >
    <template v-slot:browser_content>
      <img class="browser_content_img" ref="image" :src="item.file?.path_normal"/>
    </template>
    <template v-slot:browser_detail>
      <p>{{ item.title }}</p>
      <p>{{ item.description }}</p>
    </template>
    <template v-slot:btn_spec>
      <button :class="['sysIcon','sysIcon_zoomout',]" @click="onZoomButton('down')"></button>
      <button @click="onZoomButton('reset')">{{ Math.round(scale * 100) }}%</button>
      <!--      <button :class="['sysIcon','sysIcon_fangdajing1',]">{{ Math.round(scale * 100) }}%</button>-->
      <button :class="['sysIcon','sysIcon_zoomin',]" @click="onZoomButton('up')"></button>
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
    img {
      max-width: 100%;
      max-height: 100%;
      //transition: 0.1s cubic-bezier(0, 0.5, 0.5, 1) all;
      //transition: 0.1s cubic-bezier(0.5, 0, 1, 0.5) all;
      //transition: 0.1s all;
      //因为没有做过渡，css特效会导致定位出现问题。。。
      //加速特效还是得用js做，不然根本没法贴合。。。
      //transition: 0.1s cubic-bezier(0, 0.5, 0.5, 1) width,
      //0.1s cubic-bezier(0, 0.5, 0.5, 1) height,
      //0.1s cubic-bezier(0, 0.5, 0.5, 1) left,
      //0.1s cubic-bezier(0, 0.5, 0.5, 1) top;
      //transition: 0.1s cubic-bezier(0, 0.5, 0.5, 1) width,
      //0.1s cubic-bezier(0, 0.5, 0.5, 1) height;
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
  props: {
    modalMeta: Object as unknown as ModalMeta,
    browserMeta: Object as unknown as BrowserMeta,
    item: Object as unknown as Node,
  },
  components: {
    BrowserBase
  },
  data: function () {
    return {
      //
      scale: 1,
      originScale: 1,
      //基于图片坐标的偏移百分比
      offsetX: 0,
      offsetY: 0,
      //
      scaleLevel: [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 5],
      //
      loaded: false,
      loadTimer: false,
      key: '' + (Math.random() * 100000000)
    };
  },
  created: function () {
    console.debug('ImageBrowser:', this,);
    // console.debug(this.modalMeta``);
  },
  watch: {
    item: function (to, from) {
      console.debug('ImageBrowser:watch:item', to, from, this);
      if (from.id === to.id) return;
      this.offsetX = 0;
      this.offsetY = 0;
      this.checkComplete();
    },
  },
  mounted: function () {
    console.debug('ImageBrowser:mounted',);
    this.checkComplete();
    (this.modalMeta as ModalMeta).register.resize('browser_image_resize', () => {
      this.onResize();
      this.scale = this.originScale;
      this.toCenter();
      this.fitImg();
    });
    this.$refs.browser.$refs.browserDOM.addEventListener('wheel', this.onScroll, {passive: true});
    // console.info(this.$refs.browser.$refs.browserDOM.querySelector('.browser_content'));
    this.$refs.browser.$refs.browserDOM.addEventListener('mousedown', this.onDragStart);
    // this.$refs.browser.$refs.browserDOM.querySelector('.browser_content').addEventListener('mousedown', this.onDragStart);
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
      key: `hotkey_browser_${curIndex}`,
      callback: this.hotkeyMap.bind(this)
    });
  },
  beforeUnmount: function () {
    console.debug('ImageBrowser:beforeUnmount',);
    //不释放的的话有些情况下会报错
    (this.modalMeta as ModalMeta).release.resize('browser_image_resize');
    //
    const curIndex = (this.modalMeta as ModalMeta).modal.nid;
    this.$store.commit('event/release', {
      action: 'keyup',
      key: `hotkey_browser_${curIndex}`,
    });
  },
  /*updated: function () {
    console.debug('ImageBrowser:updated',);
  },
  beforeUpdate: function () {
    console.debug('ImageBrowser:beforeUpdate',);
  },*/
  methods: {
    checkComplete: function () {
      console.debug('checkComplete',);
      this.loadTimer = setInterval(() => {
        const imgDOM = this.$refs.image;
        if (!imgDOM || !imgDOM.complete) return;
        this.loaded = true;
        clearInterval(this.loadTimer);
        // const modalDOM = (this.modalMeta as unknown as ModalMeta).dom;
        // const browserDOM = this.$refs.browser;
        const browserDOM = this.$refs.browser.$refs.browserDOM;
        const src = {
          nH: imgDOM.naturalHeight,
          nW: imgDOM.naturalWidth,
          dH: browserDOM.clientHeight,
          dW: browserDOM.clientWidth,
        };
        this.scale = Math.min(src.dH / src.nH, src.dW / src.nW);
        this.originScale = this.scale;
        this.toCenter();
        this.onResize();
        this.fitImg();
      }, 100);
    },
    toCenter: function () {
      const imgDOM = this.$refs.image;
      const browserDOM = this.$refs.browser.$refs.browserDOM;
      const src = {
        nH: imgDOM.naturalHeight * this.scale,
        nW: imgDOM.naturalWidth * this.scale,
        dH: browserDOM.clientHeight,
        dW: browserDOM.clientWidth,
      };
      this.offsetX = (src.dW - src.nW) / 2;
      this.offsetY = (src.dH - src.nH) / 2;
    },
    onDragStart: function (e: MouseEvent) {
      // console.debug('onDrag', e);
      // e.stopPropagation();
      e.preventDefault();
      this.$store.commit('event/register', {action: 'mousemove', key: `modal_browser_mousemove_${this.key}`, callback: this.onDragging});
      this.$store.commit('event/register', {action: 'mouseup', key: `modal_browser_mouseup_${this.key}`, callback: this.onDragEnd});
      this.$store.commit('event/register', {action: 'mouseleave', key: `modal_browser_mouseleave_${this.key}`, callback: this.onDragEnd});
      // this.$store.commit('event/register', {action: 'mouseout', key: `modal_browser_mouseout_${this.key}`, callback: this.onDragEnd});
    },
    onDragging: function (e: MouseEvent) {
      // console.debug('onDragging', e);
      this.offsetX += e.movementX;
      this.offsetY += e.movementY;
      this.fitImg();
    },
    onDragEnd: function (e: MouseEvent) {
      // console.debug('onDragEnd', e);
      this.$store.commit('event/release', {action: 'mousemove', key: `modal_browser_mousemove_${this.key}`,});
      this.$store.commit('event/release', {action: 'mouseup', key: `modal_browser_mouseup_${this.key}`,});
      this.$store.commit('event/release', {action: 'mouseleave', key: `modal_browser_mouseleave_${this.key}`,});
      // this.$store.commit('event/release', {action: 'mouseout', key: `modal_browser_mouseout_${this.key}`,});
    },
    onZoomButton: function (type: string) {
      let targetScale = this.scale;
      switch (type) {
        case 'up':
        case 'down':
          targetScale = this.getNextScale(type === 'up');
          this.scale = targetScale;
          this.toCenter();
          // this.fitImg();
          // const windowDOM = this.$refs.browser.$refs.browserDOM;
          // const windowOffsetX = this.$util.nodeOffsetX(windowDOM);
          // const windowOffsetY = this.$util.nodeOffsetY(windowDOM);
          // const windowWidth = windowDOM.offsetWidth;
          // const windowHeight = windowDOM.offsetHeight;
          // this.onScrollOffset({
          //   x: windowOffsetX + 0.5 * windowWidth,
          //   y: windowOffsetY + 0.5 * windowHeight,
          // } as WheelEvent, targetScale);
          break;
        case 'reset':
          targetScale = this.originScale;
          this.scale = targetScale;
          this.toCenter();
          // this.offsetX = 0;
          // this.offsetY = 0;
          // this.fitImg();
          break;
      }
      this.fitImg();
    },
    onScroll: function (e: WheelEvent) {
      // console.debug('wheel evt', e.clientY, e.offsetY, e.pageY, e.y, e);
      if (!e.deltaY) return;
      const up = e.deltaY < 0;
      const targetScale = this.getNextScale(up);
      this.onScrollOffset(e, targetScale);
      this.scale = targetScale;
      // console.debug('target scale', this.scale, up, arr, this.scaleLevel, this.originScale)
      this.fitImg();
    },
    onScrollOffset: function (e: WheelEvent, targetScale: number) {
      // console.info(e.x, e.y);
      //缩放应该从滚轮的中点展开
      //--------------------------
      //取得缩放前鼠标所在的位置
      //取得鼠标相对图片中点的偏移
      //计算缩放后鼠标所在的位置
      //添加鼠标的偏移
      // if ((e.target as HTMLElement).className !== 'browser_content_img') return;
      const windowDOM = this.$refs.browser.$refs.browserDOM;
      const imageDOM = this.$refs.image;
      //
      const windowOffsetX = this.$util.nodeOffsetX(windowDOM);
      const windowOffsetY = this.$util.nodeOffsetY(windowDOM);
      const windowWidth = windowDOM.offsetWidth;
      const windowHeight = windowDOM.offsetHeight;
      //
      const imageOffsetX = this.$util.nodeOffsetX(imageDOM);
      const imageOffsetY = this.$util.nodeOffsetY(imageDOM);
      const imageWidth = imageDOM.offsetWidth;
      const imageHeight = imageDOM.offsetHeight;
      //
      const mouseX = e.x;
      const mouseY = e.y;
      //
      const curScale = this.scale;
      const nextScale = targetScale;
      //鼠标位置相对于图片中点的差值
      const mouseOffsetOnImgX = (mouseX - (imageOffsetX + imageWidth / 2));
      const mouseOffsetOnImgY = (mouseY - (imageOffsetY + imageHeight / 2));
      //修正：当前的鼠标，距离dom的中点，得到的差值
      const mouseOffsetOnDOMX = (mouseX - (windowOffsetX + windowWidth / 2));
      const mouseOffsetOnDOMY = (mouseY - (windowOffsetY + windowHeight / 2));
      //
      const offsetX = mouseOffsetOnImgX * nextScale / curScale - mouseOffsetOnDOMX;
      const offsetY = mouseOffsetOnImgY * nextScale / curScale - mouseOffsetOnDOMY;
      //
      // console.info(offsetX, mouseOffsetOnImgX, mouseOffsetOnDOMX,)
      // this.offsetX = 0.5 * (windowDOM.clientWidth - imageWidth * nextScale) - offsetX;
      // this.offsetX = 0 * (windowDOM.clientWidth - imageWidth * nextScale) + offsetX;
      // this.offsetX = -0.5 * (mouseOffsetOnImgX * nextScale / curScale - mouseOffsetOnDOMX);
      // this.offsetY = 0.5 * (windowDOM.clientHeight - imageHeight * nextScale) - offsetY;
      // this.offsetY = 0 * (windowDOM.clientHeight - imageHeight * nextScale) + offsetY;
      // this.offsetY = -0.5 * offsetY;
      // console.warn(windowDOM.clientWidth, imageWidth, imageWidth * nextScale / curScale);
      //0.5 (ww-iw*ns/cs) - (mx - (ix+iw/2))*ns/cs - (mx - (wx+ww/2))
      //0.5 *ww - 0.5*iw*ns/cs - mx*ns/cs - (ix+iw/2)*ns/cs - mx - (wx+ww/2)
      //0.5*ww - 0.5*iw*ns/cs - mx*ns/cs - (ix+0.5*iw)*ns/cs - mx - wx - 0.5*ww
      //0.5*ww - 0.5*iw*ns/cs - mx*ns/cs - ix*ns/cs - 0.5*iw*ns/cs - mx - wx - 0.5*ww
      // - 0.5*iw*ns/cs - mx*ns/cs - ix*ns/cs - 0.5*iw*ns/cs - mx - wx
      // -1*( 0.5*iw*ns/cs + mx*ns/cs + ix*ns/cs + 0.5*iw*ns/cs + mx + wx)
      // -1*( (0.5*iw + mx + ix + 0.5*iw)*ns/cs + mx + wx)
      // -1*( (iw + mx + ix)*ns/cs + mx + wx)
      // ↑ 话说这tm是啥。。。
      this.offsetX = 0.5 * (windowWidth - imageWidth * nextScale / curScale) - offsetX;
      // this.offsetX = 0.5 * (windowDOM.clientWidth - imageWidth * nextScale);
      this.offsetY = 0.5 * (windowHeight - imageHeight * nextScale / curScale) - offsetY;
      // this.offsetY = 0.5 * (windowDOM.clientHeight - imageHeight * nextScale);
    },
    getNextScale: function (up: boolean) {
      let arr = [];
      let scale = this.scale;
      // const curIndex = 0;
      //获取当前的缩放等级
      let noOrigin = true;
      for (let i1 = 0; i1 < this.scaleLevel.length; i1++) {
        // eslint-disable-next-line eqeqeq
        if (this.scaleLevel[i1] == this.originScale) continue;
        if (noOrigin && this.scaleLevel[i1] > this.originScale) {
          arr.push(this.originScale);
          noOrigin = false;
        }
        arr.push(this.scaleLevel[i1]);
      }
      if (!up) arr = arr.reverse();
      //获取新的缩放等级
      // console.debug(arr, this.scale);
      for (let i1 = 0; i1 < arr.length; i1++) {
        if (up) {
          if (arr[i1] > this.scale) {
            scale = arr[i1];
            break;
          }
        } else {
          if (arr[i1] < this.scale) {
            // console.debug(arr[i1] < this.scale, arr[i1], this.scale)
            scale = arr[i1];
            break;
          }
        }
      }
      return scale;
    },
    onResize: function () {
      // console.debug('ImageBrowser:', 'onResize:',);
      // return;
      const imgDOM = this.$refs.image;
      // const modalDOM = (this.modalMeta as unknown as ModalMeta).dom;
      // const browserDOM = this.$refs.browser;
      const browserDOM = this.$refs.browser.$refs.browserDOM;
      const src = {
        nH: imgDOM.naturalHeight,
        nW: imgDOM.naturalWidth,
        dH: browserDOM.clientHeight,
        dW: browserDOM.clientWidth,
      };
      // console.debug(src);
      // this.scale = Math.min(src.dH / src.nH, src.dW / src.nW);
      this.originScale = Math.min(src.dH / src.nH, src.dW / src.nW);
      // console.info(this.originScale);
      // this.scale = this.originScale;
      // this.fitImg(this.scale, this.offsetX, this.offsetY)
      // this.fitImg();
      /*const tgt = {
        h: 0,
        w: 0,
        l: 0,
        t: 0,
      };*/
      // console.debug(imgDOM, modalDOM, browserDOM, browserDOM.$refs.browserDOM);
    },
    fitImg: function (/*scale, offsetX, offsetY*/) {
      const imgDOM = this.$refs.image;
      const browserDOM = this.$refs.browser.$refs.browserDOM;
      const meta = {
        scale: this.scale,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
      };
      /*console.warn(JSON.stringify({
        width: imgDOM.style.width,
        height: imgDOM.style.height,
        top: imgDOM.style.top,
        left: imgDOM.style.left,
      }));*/
      const target = {
        w: imgDOM.naturalWidth * meta.scale,
        h: imgDOM.naturalHeight * meta.scale,
        x: 0,
        y: 0,
      };
      //居中
      // console.warn(browserDOM.clientWidth, target.w, meta.offsetX);
      // target.x = 0.5 * (browserDOM.clientWidth - target.w) - meta.offsetX;
      target.x = meta.offsetX;
      // target.y = 0.5 * (browserDOM.clientHeight - target.h) - meta.offsetY;
      target.y = meta.offsetY;
      const windowWidth = browserDOM.offsetWidth;
      const windowHeight = browserDOM.offsetHeight;
      //四个方向做一些限制
      if (target.x > windowWidth * 0.5) {
        // console.debug('ovf');
        target.x = windowWidth * 0.5;
      }
      if (target.x + target.w < windowWidth * 0.5) {
        // console.debug('ovf');
        target.x = windowWidth * 0.5 - target.w;
      }
      if (target.y > windowHeight * 0.5) {
        // console.debug('ovf');
        target.y = windowHeight * 0.5;
      }
      if (target.y + target.h < windowHeight * 0.5) {
        // console.debug('ovf');
        target.y = windowHeight * 0.5 - target.h;
      }
      // console.debug('fitImg', meta, target, this.$refs.image);
      imgDOM.style.position = 'absolute';
      imgDOM.style.width = `${target.w}px`;
      imgDOM.style.height = `${target.h}px`;
      imgDOM.style.left = `${target.x}px`;
      imgDOM.style.top = `${target.y}px`;
      imgDOM.style.maxWidth = 'unset';
      imgDOM.style.maxHeight = 'unset';
      /*console.debug(JSON.stringify({
        width: imgDOM.style.width,
        height: imgDOM.style.height,
        top: imgDOM.style.top,
        left: imgDOM.style.left,
      }));*/
    },
    hotkeyMap: async function (e: KeyboardEvent) {
      // console.info(e.type, e.key, e.target, e, this);
      // console.info(e.type, e.key, this.$store.state.focus.last, (this.modalMeta as ModalMeta).modal.nid);
      if (['ArrowLeft', 'ArrowRight', '+', '-',].indexOf(e.key) === -1) return;
      const curIndex = (this.modalMeta as ModalMeta).modal.nid;
      // console.info('here')
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
      // console.info(curId, isCur);
      if (!isCur) return;
      //第一次触发以后，把dom改到modal一层
      // 不然切换浏览器类型的时候会无法遍历
      this.$store.state.focus.last = domWalker;
      // console.info('set pager');
      // console.info(e.key,this.browserMeta.navi);
      switch (e.key) {
        case 'ArrowLeft':
          this.browserMeta.navi.prev();
          break;
        case 'ArrowRight':
          this.browserMeta.navi.next();
          break;
        case '+':
          this.onZoomButton('up');
          break;
        case '-':
          this.onZoomButton('down');
          break;
      }
    },
  },
})
export default class Image extends Vue {
}
</script>
