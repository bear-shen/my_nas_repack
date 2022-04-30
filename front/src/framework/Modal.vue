<template>
  <div id="frame_modal" ref="modalFrame">
    <template v-for="(modal) in $store.state.modal.list.values()" :key="modal.nid">
      <!--      {{modal}}{{modalIndex}}-->
      <div
        v-if="!modal.closed"
        :data-index="modal.nid"
        :id="`modal_item_${modal.nid}`"
        :class="{
      alpha:modal.base.alpha,
      modal_item:true,
      }" :style="{zIndex:modal.layout.index}"
        :data-zi="modal.layout.index"
      >
        <div class="modal_frame"
             :style="{
        width:modal.layout.w+modal.layout.unit,
        height:modal.layout.h+modal.layout.unit,
        left:modal.layout.x+modal.layout.unit,
        top:modal.layout.y+modal.layout.unit,
           }"
             @click="onClick(modal.nid)"
             @mousedown="onMousedown(modal.nid)"
        >
          <div class="modal_body">
            <div class="modal_title_bar" @mousedown="onResizeStart(modal.nid,$event)">
              <div class="title" v-html="modal.base.title"></div>
              <div class="operator" @click.stop @mousedown.stop>
                <template v-if="modal.layout.resizable&&modal.layout.movable">
                  <span class="sysIcon sysIcon_maximize" v-if="!modal.layout.fullscreen" @click="fullscreen(modal.nid)"></span>
                  <span class="sysIcon sysIcon_windowize" v-else @click="resetWindow(modal.nid)"></span>
                </template>
                <span class="sysIcon sysIcon_close" @click="close(modal.nid)"></span>
              </div>
            </div>
            <div class="modal_content">
              <div class="content"
                   v-if="modal.content.text"
                   v-html="modal.content.text"
              ></div>
              <div class="form" v-if="modal.content.form.length">
                <div
                  v-for="(formItem,formIndex) in modal.content.form" :key="`_${modal.nid}_${formIndex}`"
                >
                  <label v-html="formItem.name" :for="`_${modal.nid}_${formIndex}`"></label>
                  <div v-if="false">
                  </div>
                  <div v-else-if="formItem.type==='text'">
                    <input v-model="formItem.value" :id="`_${modal.nid}_${formIndex}`">
                  </div>
                  <div v-else-if="formItem.type==='textarea'">
                    <textarea v-model="formItem.value" :id="`_${modal.nid}_${formIndex}`"></textarea>
                  </div>
                  <div v-else-if="formItem.type==='date'">
                    <input v-model="formItem.value" type="date" :id="`_${modal.nid}_${formIndex}`">
                  </div>
                  <div v-else-if="formItem.type==='datetime'">
                    <input v-model="formItem.value" type="datetime-local" :id="`_${modal.nid}_${formIndex}`">
                  </div>
                  <div v-else-if="formItem.type==='checkbox'">
                    <input v-model="formItem.value" type="checkbox" :id="`_${modal.nid}_${formIndex}`">
                    <label :for="`_${modal.nid}_${formIndex}`">{{ formItem.name }}</label>
                  </div>
                  <div v-else-if="formItem.type==='radio'">
                    <template v-for="(optionVal,optionKey) in formItem.extra.data" :key="`_${modal.nid}_${formIndex}_${optionKey}`">
                      <input v-model="formItem.value" type="radio" :value="optionVal" :id="`_${modal.nid}_${formIndex}_${optionKey}`">
                      <label :for="`_${modal.nid}_${formIndex}_${optionKey}`">{{ optionVal }}</label>
                    </template>
                  </div>
                  <div v-else-if="formItem.type==='select'" :id="`_${modal.nid}_${formIndex}`">
                    <select v-model="formItem.value">
                      <option v-for="(optionVal,optionKey) in formItem.extra.data" :key="`_${modal.nid}_${formIndex}_s_${optionKey}`"
                              :value="optionKey"
                      >{{ optionVal }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <template
                v-for="(component,componentIndex) in modal.content.component"
                :key="`_${modal.nid}_${componentIndex}`"
              >
                <component
                  :is="component.key"
                  :modal-meta="{
                  register:{
                    resize:regResize.bind(this,modal.nid),
                  },
                  release:{
                    resize:releaseResize.bind(this,modal.nid),
                  },
                  close:close.bind(this,modal.nid),
                  dom:$refs.modalFrame,
                  // instance:this,
                  modal:modal,
                  data:component.data,
                  component_index:componentIndex,
                }"
                  @close="close(modal.nid)"
                ></component>
                <!--              :input="component.data"-->
                <!--              :modal="modal"-->
                <!--              :frame="$refs.modalFrame"-->
              </template>
              <div class="footer">
                <button
                  v-for="(callItem,callIndex) in modal.content.callback" :key="`_${modal.nid}_${callIndex}`"
                  v-html="callItem.name"
                  @click="btnCallback(modal.nid,callItem.key)"
                ></button>
              </div>
            </div>
          </div>
          <div class="modal_controller" v-if="modal.layout.resizable" @mousedown="onResizeStart(modal.nid,$event)">
            <div class="control_b_n"></div>
            <div class="control_b_s"></div>
            <div class="control_b_w"></div>
            <div class="control_b_e"></div>
            <div class="control_b_ne"></div>
            <div class="control_b_nw"></div>
            <div class="control_b_se"></div>
            <div class="control_b_sw"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
#frame_modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  .modal_item.alpha {
    background-image: url('../assets/bg.png');
    &:before {
      z-index: -1;
      filter: blur($fontSize*0.05);
      backdrop-filter: blur($fontSize*0.05);
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
  }
  .modal_item {
    pointer-events: none;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    //display: flex;
    //justify-content: center;
    //align-items: center;
  }
  .modal_item.alpha {
    pointer-events: all;
  }
  .modal_item {
    z-index: 1000;
  }
  /*.modal_item.active {
    z-index: 10000;
  }*/
  .modal_frame {
    pointer-events: all;
    //max-width: 75vw;
    //max-height: 75vh;
    background-color: map-get($colors, modal_bk);
    position: relative;
    &:before {
      z-index: -1;
      filter: blur($fontSize*0.25);
      backdrop-filter: blur($fontSize*0.25);
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      //background-color: inherit;
    }
    .modal_body {
      width: 100%;
      height: 100%;
      //overflow: auto;
      overflow: hidden;
    }
    .modal_title_bar {
      line-height: $fontSize*1.2;
      height: $fontSize*1.2;
      display: flex;
      justify-content: space-between;
      background-color: map-get($colors, modal_title);
      cursor: grab;
      * {
        display: inline-block;
        white-space: nowrap;
      }
      .title {
        padding: 0 $fontSize*0.5;
        max-width: 70%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .operator {
        cursor: pointer;
        font-size: 0;
        span {
          padding: 0 $fontSize*0.25;
        }
        span:hover {
          background-color: map-get($colors, modal_btn);
        }
      }
    }
    .modal_content {
      padding: $fontSize*0.5;
      //font-size: 0;
      height: calc(100% - #{$fontSize} * (1.2 + 0.5 * 2));
      overflow: auto;
      @include smallScroll();
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      .content {
        padding: 0 0 $fontSize*0.5 0;
        text-align: center;
        word-break: break-all;
      }
      .form {
        > div {
          display: flex;
          justify-content: space-between;
          padding: 0 0 $fontSize*0.5 0;
          align-items: center;
          align-self: center;
          div, label {
            display: inline-block;
          }
          div {
            min-width: 50%;
            //textarea, input[type=text] {
            //  width: 100%;
            //}
          }
        }
      }
    }
    .footer {
      display: flex;
      justify-content: space-around;
      //padding: 0 0 $fontSize*0.5 0;
    }
  }
}
.modal_controller {
  $transparentBorderSize: $fontSize*0.75;
  div {
    //border-color: map-get($colors, app_bar);
    //border-style: solid;
    //border-width: 0;
    background-color: transparent;
    position: absolute;
    //z-index: -1;
    z-index: 0;
  }
  .control_b_n, .control_b_s {
    width: 100%;
    left: $fontSize*0;
  }
  .control_b_n {
    top: -1*( $transparentBorderSize);
    cursor: n-resize;
    height: $transparentBorderSize;
  }
  .control_b_s {
    bottom: -1*( $transparentBorderSize);
    cursor: n-resize;
    height: $transparentBorderSize;
  }
  .control_b_w, .control_b_e {
    height: 100%;
    top: $fontSize*0;
  }
  .control_b_w {
    left: -1*( $transparentBorderSize);
    cursor: w-resize;
    width: $transparentBorderSize;
  }
  .control_b_e {
    right: -1*( $transparentBorderSize);
    cursor: e-resize;
    width: $transparentBorderSize;
  }
  .control_b_ne, .control_b_nw, .control_b_se, .control_b_sw {
    height: $fontSize;
    width: $fontSize;
  }
  //两边边框不缩的话和长边会有瑕疵
  .control_b_ne {
    right: -1*( $transparentBorderSize);
    top: -1*( $transparentBorderSize);
    cursor: ne-resize;
  }
  .control_b_nw {
    left: -1*( $transparentBorderSize);
    top: -1*( $transparentBorderSize);
    cursor: nw-resize;
  }
  .control_b_se {
    right: -1*( $transparentBorderSize);
    bottom: -1*( $transparentBorderSize);
    cursor: se-resize;
  }
  .control_b_sw {
    left: -1*( $transparentBorderSize);
    bottom: -1*( $transparentBorderSize);
    cursor: sw-resize;
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
// import * as n from '@/lib/ModalLib.ts'
import {Modal as ModalConstructor,} from '@/lib/ModalLib'
// import modalDemo from '@/demo/createModal.ts'
import modalComponents from '@/modal/index';
import {ModalMeta} from '@/struct';

// console.debug(ModalConstructor);
// const createModal=n.createModal;

@Options({
  components: modalComponents,
  watch: {},
  data: function () {
    return {
      resizing: false,
      resizingIndex: -1,
    };
  },
  created: function () {
    // this.$store.commit('modal/push', modalDemo);
    this.$store.commit('event/register', {action: 'resize', key: 'modal_window_resize', callback: this.onWindowResize.bind(this)});
    this.$store.state.modal.onPush = this.onPush;
    return true;
  },
  mounted: function () {
    return '';
  },
  beforeUnmount: function () {
    return '';
  },
  methods: {
    onPush: async function (modalNid: number) {
      setTimeout(() => {
        const item = document.getElementById(`modal_item_${modalNid}`);
        // console.info(item, this.$store.state.focus.last, this.$store.state.focus);
        if (!item) return;
        this.$store.state.focus.last = item;
        // console.info(item, this.$store.state.focus.last, this.$store.state.focus);
      }, 50);
      this.$store.commit('event/register', {
        action: 'keyup',
        key: `hotkey_modal_frame_${modalNid}`,
        callback: this.hotkeyMap.bind(this, modalNid)
      });
    },
    btnCallback: async function (modalNid: number, callKey: string) {
      console.debug('btnCallback');
      const app = this.$store.state.modal.list.get(modalNid) as ModalConstructor;
      console.debug(app, callKey);
      if (callKey) {
        for (let i1 = 0; i1 < app.content.callback.length; i1++) {
          if (app.content.callback[i1].key !== callKey) continue;
          console.debug(app.content.callback[i1], app.content.callback[i1].callback)
          app.content.callback[i1].callback(
            app.content.form, callKey, {
              close: () => {
                console.info('oncall-close');
                this.close(modalNid);
              }
            });
          break;
        }
      }
      // this.$store.state.modal.list.splice(modalNid, 1);
    },
    close: async function (modalNid: number) {
      console.info('close', modalNid);
      // const app = this.$store.state.modal.list.get(modalNid) as ModalConstructor;
      // const callLen = app.content.callback.length;
      // if (callLen) {
      //   await app.content.callback[callLen - 1].callback(app.content.form, 'close');
      // }
      // console.debug(app);
      // app.closed = true;
      // setTimeout(() => {
      this.$store.state.modal.list.delete(modalNid);
      // }, 200);
      //
      // const curIndex = (this.modalMeta as ModalMeta).modal.nid;
      this.$store.commit('event/release', {
        action: 'keyup',
        key: `hotkey_modal_frame_${modalNid}`,
      });
      //
      setTimeout(() => {
        const modalMap = (this.$store.state.modal.list as Map<number, ModalConstructor>);
        const modalIndexList = [] as number[];
        modalMap.forEach(modal => modalIndexList.push(modal.layout.index));
        const maxIndex = Math.max(...modalIndexList);
        let topModalId = '';
        modalMap.forEach(modal => {
          if (modal.layout.index !== maxIndex) return;
          topModalId = `modal_item_${modal.nid}`;
        });
        if (topModalId) {
          const dom = document.getElementById(topModalId);
          if (dom) {
            this.$store.state.focus.last = dom;
          }
        }
      }, 50)
      //
    },
    resetWindow: function (modalNid: number) {
      const app = this.$store.state.modal.list.get(modalNid) as ModalConstructor;
      app.layout.x = app.layout.defX;
      app.layout.y = app.layout.defY;
      app.layout.w = app.layout.defW;
      app.layout.h = app.layout.defH;
      app.layout.fullscreen = false;
      this.callResize(app.nid);
    },
    fullscreen: function (modalNid: number) {
      const borderW = 40;
      const borderH = 40;
      const app = this.$store.state.modal.list.get(modalNid) as ModalConstructor;
      const iw = this.$refs.modalFrame.offsetWidth;
      const ih = this.$refs.modalFrame.offsetHeight;
      // app.layout.movable = false;
      app.layout.x = borderW;
      app.layout.y = borderH;
      app.layout.w = iw - borderW * 2;
      app.layout.h = ih - borderH * 2;
      app.layout.fullscreen = true;
      // setTimeout(() => {
      this.callResize(app.nid);
      // }, 100);
    },
    hotkeyMap: async function (modalNid: number, e: KeyboardEvent) {
      // console.info(e.type, e.key, e.target, e);
      // console.info(e.type, e.key, this.$store.state.focus.last, (this.modalMeta as ModalMeta).modal.nid);
      const modal = this.$store.state.modal.list.get(modalNid);
      // console.info(modal);
      if (['Escape',].indexOf(e.key) === -1) return;
      // const curIndex = (this.modalMeta as ModalMeta).modal.nid;
      //输入不在body时禁用（input之类的）
      if (e.target && (e.target as HTMLElement).tagName !== 'BODY') return;
      //上次点击的内容在模态里，
      //判断一下这个模态还在不在（是否关闭）
      //在的话就不允许翻页（模态内部处理）
      // let inModal = false;
      let domWalker = this.$store.state.focus.last;
      let isCur = false;
      const curId = `modal_item_${modalNid}`;
      while (domWalker && domWalker.tagName !== 'BODY' && domWalker.tagName !== 'HTML') {
        console.info(domWalker.className, domWalker.id, modalNid, domWalker.parentNode);
        if (domWalker.className.split(' ').indexOf('modal_item') !== -1) {
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
      switch (e.key) {
        case 'Escape':
          this.close(modalNid);
          break;
      }
    },
    //---------------------------------------------------
    // regClose: function (index: number, key: string, callback: () => null) {
    //   console.debug('regClose');
    // },
    /**
     * 通过 regResize 函数注册 resize 事件
     * (this.modalMeta as ModalMeta).register.resize('resize_evt_key', this.onResize);
     * */
    regResize: function (modalNid: number, evtKey: string, callback: () => null) {
      // console.warn('regResize', modalNid);
      const modal = (this.$store.state.modal.list as Map<number, ModalConstructor>).get(modalNid);
      if (!modal) {
        // console.warn('modal not found');
        return;
      }
      if (!modal.event) modal.event = {};
      if (!modal.event.resize) modal.event.resize = {};
      modal.event.resize[evtKey] = callback;
    },
    // callClose: function (index: number, key: string) {
    //   console.debug('callClose');
    // },
    /**
     * 响应内部的 resize 事件
     * */
    callResize: function (modalNid: number) {
      setTimeout(() => {
        // console.warn('callResize', modalNid);
        const modal = (this.$store.state.modal.list as Map<number, ModalConstructor>).get(modalNid);
        if (!modal) {
          console.warn('modal not found');
          return;
        }
        if (!modal.event) modal.event = {};
        if (!modal.event.resize) modal.event.resize = {};
        const evtLs = modal.event.resize;
        // console.info(evtLs);
        for (const k in evtLs) {
          if (!evtLs[k]) continue;
          if (!Object.prototype.hasOwnProperty.call(evtLs, k)) continue;
          evtLs[k](modal);
        }
      }, 50);
    },
    // releaseClose: function (index: number, key: string) {
    //   console.debug('releaseClose');
    // },
    releaseResize: function (modalNid: number, evtKey: string) {
      //随着版本跌打这个函数大概没有用了，但是看起来也没有什么必要删除
      // console.warn('releaseResize', modalNid);
      const modal = (this.$store.state.modal.list as Map<number, ModalConstructor>).get(modalNid);
      if (!modal) {
        // console.warn('modal not found');
        return;
      }
      // console.info(modal.event.resize);
      if (!modal) return;
      if (!modal.event) modal.event = {};
      if (!modal.event.resize) modal.event.resize = {};
      delete modal.event.resize[evtKey];
    },
    //---------------------------------------------------
    onResizeStart: function (modalNid: number, e: MouseEvent) {
      // console.debug('onResizeStart',);
      // console.debug('onResizeStart', e, index);
      if (this.resizing || this.resizingIndex !== -1) return;
      const app = this.$store.state.modal.list.get(modalNid) as ModalConstructor;
      const target = e?.target as HTMLElement;
      // console.debug(target, app.layout.movable, app.layout.resizable);
      // console.debug(target?.className === 'modal_title_bar');
      //不可移动的不可变形
      //可移动的可变形
      //可移动的不可变形
      if (
        app.layout.fullscreen ||
        !app.layout.movable ||
        (!app.layout.resizable && ['modal_title_bar', 'title',].indexOf(target?.className) === -1)
      ) {
        // console.debug('rej', target?.className, app.layout);
        return;
      }
      // app.layout.resized = true;
      this.resizing = {x: e.x, y: e.y, d: target?.className};
      this.resizingIndex = modalNid;
      this.$store.commit('event/register', {action: 'mousemove', key: 'modal_resize_mousemove', callback: this.onResizing.bind(this, this.resizingIndex)});
      this.$store.commit('event/register', {action: 'mouseup', key: 'modal_resize_mouseup', callback: this.onResizeEnd.bind(this, this.resizingIndex)});
      this.$store.commit('event/register', {action: 'mouseleave', key: 'modal_resize_mouseleave', callback: this.onResizeEnd.bind(this, this.resizingIndex)});
      this.$store.commit('event/register', {action: 'mouseout', key: 'modal_resize_mouseout', callback: this.onResizeEnd.bind(this, this.resizingIndex)});
    },
    onResizing: function (modalNid: number, e: MouseEvent) {
      // console.debug('onResizing', e);
      e.preventDefault();
      if (!this.resizing || this.resizingIndex !== modalNid) {
        // console.debug(1);
        return;
      }
      const app = this.$store.state.modal.list.get(modalNid) as ModalConstructor;
      /*if (!app.layout.resizable) {
        // console.debug(2);
        return;
      }*/
      const to = {
        w: app.layout.w,
        h: app.layout.h,
        x: app.layout.x,
        y: app.layout.y,
      };
      // console.debug(this.resizing.d);
      // console.debug(JSON.stringify(to));
      const dx = e.x - this.resizing.x;
      const dy = e.y - this.resizing.y;
      let direction = '';
      switch (this.resizing.d) {
        case 'control_b_n':
          to.h = to.h - dy;
          to.y = to.y + dy;
          //
          direction = 't';
          break;
        case 'control_b_s':
          to.h = to.h + dy;
          //
          direction = 'b';
          break;
        case 'control_b_w':
          to.w = to.w - dx;
          to.x = to.x + dx;
          //
          direction = 'l';
          break;
        case 'control_b_e':
          to.w = to.w + dx;
          //
          direction = 'r';
          break;
        case 'control_b_ne':
          to.h = to.h - dy;
          to.y = to.y + dy;
          //
          to.w = to.w + dx;
          //
          direction = 'tr';
          break;
        case 'control_b_nw':
          to.h = to.h - dy;
          to.y = to.y + dy;
          //
          to.w = to.w - dx;
          to.x = to.x + dx;
          //
          direction = 'tl';
          break;
        case 'control_b_se':
          to.h = to.h + dy;
          //
          to.w = to.w + dx;
          //
          direction = 'br';
          break;
        case 'control_b_sw':
          to.h = to.h + dy;
          //
          to.w = to.w - dx;
          to.x = to.x + dx;
          //
          direction = 'bl';
          break;
        case 'modal_title_bar':
        case 'title':
          to.x = to.x + dx;
          to.y = to.y + dy;
          //
          direction = 'm';
          break;
      }
      // console.debug(JSON.stringify(to));
      if (this.isSafe(app, {...to, direction: direction})) {
        // console.debug('isSafe')
        app.layout.w = to.w;
        app.layout.h = to.h;
        app.layout.x = to.x;
        app.layout.y = to.y;
        this.callResize(app.nid);
      }
      // console.debug(JSON.stringify(to));
      this.resizing.x = e.x;
      this.resizing.y = e.y;
    },
    isSafe: function (app: ModalConstructor, conf: { w: number, h: number, x: number, y: number, direction: string }): boolean {
      const iw = this.$refs.modalFrame.offsetWidth;
      const ih = this.$refs.modalFrame.offsetHeight;
      // return true;
      /*console.debug(
        app, conf,
        (app.layout.defW > conf.h),
        (app.layout.defH > conf.w),
      )*/
      //宽高限制
      if (app.layout.defH > conf.h) {
        // console.debug('if (app.layout.defH > conf.h) {');
        //如果是变大的话，可以变大
        if (app.layout.h > conf.h) {
          return false;
        }
      }
      if (app.layout.defW > conf.w) {
        // console.debug('if (app.layout.defW > conf.w) {');
        if (app.layout.w > conf.w) {
          return false;
        }
      }
      const plot = {
        //左上
        left: conf.x,
        top: conf.y,
        //右下
        right: conf.x + conf.w,
        bottom: conf.y + conf.h,
      };
      const curPlot = {
        //左上
        left: app.layout.x,
        top: app.layout.y,
        //右下
        right: app.layout.x + app.layout.w,
        bottom: app.layout.y + app.layout.h,
      };
      const gap = 5;
      /*console.debug(
        (plot.xa < gap || plot.xa > iw - gap * 2),
        (plot.xb < gap || plot.xb > iw - gap * 2),
        (plot.ya < gap || plot.ya > ih - gap * 2),
        (plot.yb < gap || plot.yb > ih - gap * 2),
      );*/
      // if (plot.xa < gap || plot.xa > iw - gap * 2) return false;
      // if (plot.ya < gap || plot.ya > ih - gap * 2) return false;
      // if (plot.xb < gap || plot.xb > iw - gap * 2) return false;
      // if (plot.yb < gap || plot.yb > ih - gap * 2) return false;
      // @todo x过一遍y过一遍
      // @todo 基本规则：
      // @todo 左，下，右在窗口内部至少保留0.5个窗口最小尺寸
      // @todo 上不得超出窗口
      // @todo    如果是上部超出窗口，窗口弹回页面
      // @todo    其他部分超出窗口
      // @todo        如果趋势是回归到窗口内，可以执行
      const unsafe = {
        t: true,
        l: true,
        b: true,
        r: true,
      };
      // if (plot.top < gap) {
      if (plot.top < gap || plot.top > ih - gap * 2) {
        // console.debug('if (plot.ya < gap || plot.ya > ih - gap * 2) {');
        unsafe.t = false;
      }
      // if (plot.left < gap - conf.w * 0.75) {
      if (plot.left < gap - conf.w * 0.5 || plot.left > iw - gap * 2) {
        // console.debug('if (plot.xa < gap || plot.xa > iw - gap * 2) {');
        unsafe.l = false;
      }
      // if (plot.right > iw - gap * 2 + conf.w * 0.75) {
      if (plot.right < gap || plot.right > iw - gap * 2 + conf.w * 0.5) {
        // console.debug('if (plot.xb < gap || plot.xb > iw - gap * 2 + conf.w / 2) {');
        unsafe.r = false;
      }
      // if (plot.bottom > ih - gap * 2 + conf.h * 0.75) {
      if (plot.bottom < gap || plot.bottom > ih - gap * 2 + conf.h * 0.5) {
        // console.debug('if (plot.yb < gap || plot.yb > ih - gap * 2 + conf.h / 2) {');
        unsafe.b = false;
      }
      //移动和缩放窗口的时候，根据移动方向做出一个基本的方向判定
      //这方向属实不知道怎么算的。。。反正这样能用
      if (['m', 'w'].indexOf(conf.direction) !== -1) {
        const adjDirection = ['', '',];
        if (!adjDirection[0].length && curPlot.top > plot.top) adjDirection[0] = 't';
        if (!adjDirection[0].length && curPlot.bottom < plot.bottom) adjDirection[0] = 'b';
        if (!adjDirection[1].length && curPlot.left > plot.left) adjDirection[1] = 'l';
        if (!adjDirection[1].length && curPlot.right < plot.right) adjDirection[1] = 'r';
        // adjDirection = adjDirection.slice(0, 2);
        if (adjDirection[0] || adjDirection[1]) conf.direction = adjDirection.join('');
        /*console.debug('adjDirection:', adjDirection,
          `${curPlot.top} < ${plot.top} = ${(curPlot.top < plot.top) ? '1' : '0'}`,
          `${curPlot.bottom} < ${plot.bottom} = ${(curPlot.bottom < plot.bottom) ? '1' : '0'}`,
          `${curPlot.left} < ${plot.left} = ${(curPlot.left < plot.left) ? '1' : '0'}`,
          `${curPlot.right} < ${plot.right} = ${(curPlot.right < plot.right) ? '1' : '0'}`,
        );*/
      }
      //ex. 如果下面超出了边框，但是一样可以向上拉伸
      switch (conf.direction) {
        case 't':
          unsafe.r = unsafe.l = unsafe.b = true;
          break;
        case 'b':
          unsafe.r = unsafe.l = unsafe.t = true;
          break;
        case 'l':
          unsafe.r = unsafe.t = unsafe.b = true;
          break;
        case 'r':
          unsafe.l = unsafe.t = unsafe.b = true;
          break;
        case 'tr':
          unsafe.l = unsafe.b = true;
          break;
        case 'tl':
          unsafe.r = unsafe.b = true;
          break;
        case 'br':
          unsafe.l = unsafe.t = true;
          break;
        case 'bl':
          unsafe.r = unsafe.t = true;
          break;
        case 'm':
          break;
        case 'w':
          break;
      }
      return unsafe.t &&
        unsafe.l &&
        unsafe.b &&
        unsafe.r &&
        true
        ;
    },
    onResizeEnd: function (modalNid: number, e: MouseEvent) {
      e.preventDefault();
      if (!this.resizing || this.resizingIndex !== modalNid) return;
      // console.debug('onResizeEnd', e);
      //只处理mouseup的事件，其他的不管了
      if (e.type !== 'mouseup') {
        return;
        /*const composedPath = e.composedPath() as HTMLElement[];
        for (let i1 = 0; i1 < composedPath.length; i1++) {
          if (composedPath[i1].id === 'frame_window') return;
          if (composedPath[i1].id === 'frame_desktop') return;
        }
        //窗口外回来是这个
        const targetNode = e.target as HTMLElement;
        if (targetNode.nodeName === 'HTML') return;*/
      }
      // console.debug('onResizeEnd');
      this.resizing = false;
      this.resizingIndex = -1;
      this.$store.commit('event/release', {action: 'mousemove', key: 'modal_resize_mousemove'});
      this.$store.commit('event/release', {action: 'mouseup', key: 'modal_resize_mouseup'});
      this.$store.commit('event/release', {action: 'mouseleave', key: 'modal_resize_mouseleave'});
      this.$store.commit('event/release', {action: 'mouseout', key: 'modal_resize_mouseout'});
    },
    onClick: async function (modalNid: number) {
      // console.debug('onclick');
      (this.$store.state.modal.list as Map<number, ModalConstructor>).forEach(modal => {
        modal.layout.active = modal.nid === modalNid;
      });
    },
    onMousedown: async function (modalNid: number) {
      // console.debug('onMousedown');
      const val = (new Date()).valueOf();
      const cur = this.$store.state.modal.list.get(modalNid) as ModalConstructor;
      const alpha = cur.base.alpha;
      //注意，chrome下zIndex最大值为 2147483647
      // time smp
      //m: 2147483647
      //t: 1650474926094
      //2: 1000000000
      //1: 100000000
      //s: 1000000
      //d: 86400
      //d: 86400000 ms
      const diff = alpha ? 1000000000 : 100000000;
      cur.layout.index = (val % diff) + diff;
    },
    onWindowResize: async function () {
      (this.$store.state.modal.list as Map<number, ModalConstructor>).forEach(modal => {
        // console.debug(modal);
        const iw = this.$refs.modalFrame.offsetWidth;
        const ih = this.$refs.modalFrame.offsetHeight;
        const plot = {w: modal.layout.w, h: modal.layout.h, x: modal.layout.x, y: modal.layout.y,};
        if (modal.layout.fullscreen) {
          const borderW = 40;
          const borderH = 40;
          modal.layout.x = borderW;
          modal.layout.y = borderH;
          modal.layout.w = iw - borderW * 2;
          modal.layout.h = ih - borderH * 2;
          this.callResize(modal.nid);
          return;
        }
        if (this.isSafe(modal, {...plot, direction: 'w'})) return;
        let target = 0;
        if (plot.w * 0.5 + plot.x > iw) {
          target = iw - plot.w * 0.5;
          if (target > 0) {
            modal.layout.x = target;
          }
        }
        if (plot.h * 0.5 + plot.y > ih) {
          target = ih - plot.h * 0.5;
          if (target > 0) {
            modal.layout.y = target;
          }
        }
        this.callResize(modal.nid);
      });
    },
  },
})
export default class Modal extends Vue {
}
</script>
