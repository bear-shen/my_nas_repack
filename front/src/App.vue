<template>
  <framework-header></framework-header>
  <framework-navi></framework-navi>
  <framework-footer></framework-footer>
  <framework-modal></framework-modal>
  <framework-content>
    <router-view/>
  </framework-content>
</template>

<style lang="scss">
body {
  //padding-top: $headerHeight+$headerPad;
  //padding-bottom: $footerHeight+$footerPad;
  //padding-left: $navWidth;
  //
  //height: calc(100vw);
}
#frame_header {
  z-index: $indexFrame;
}
#frame_navi {
  z-index: $indexFrame;
}
#frame_footer {
  z-index: $indexFrame;
}
#frame_modal {
  z-index: $indexModal;
}
#frame_content {
  z-index: $indexContent;
}
@media (max-width: $narrowWidth) {}
@media (max-width: $tabletWidth) {}
@media (max-width: $mobileWidth) {}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import FrameworkHeader from '@/framework/Header.vue'
import FrameworkNavi from '@/framework/Navi.vue'
import FrameworkFooter from '@/framework/Footer.vue'
import FrameworkModal from '@/framework/Modal.vue'
import FrameworkContent from '@/framework/Content.vue'

@Options({
  components: {
    FrameworkHeader,
    FrameworkNavi,
    FrameworkFooter,
    FrameworkModal,
    FrameworkContent,
  },
  watch: {},
  data: function () {
    return {};
  },
  created: function () {
    const preventEvtList = this.$store.state.event.prevents;
    for (let i1 = 0; i1 < preventEvtList.length; i1++) {
      switch (preventEvtList[i1]) {
        case 'resize':
          window.addEventListener(preventEvtList[i1], (e: Event) => {
            this.$store.commit('event/submit', {action: preventEvtList[i1], event: e});
            // 默认事件给干掉之后存在一大堆问题，跳到事件内部去执行吧
            // e.preventDefault();
          });
          break;
        default:
          document.addEventListener(preventEvtList[i1], (e: Event) => {
            this.$store.commit('event/submit', {action: preventEvtList[i1], event: e});
            // 默认事件给干掉之后存在一大堆问题，跳到事件内部去执行吧
            // e.preventDefault();
          });
          break;
      }
    }
  },
  mounted: function () {
    this.$store.commit('event/register', {
      action: 'click',
      key: 'focus_watcher',
      callback: this.toggleFocus.bind(this)
    });
    /*this.$store.commit('event/register', {
      action: 'keyup',
      key: 'hotkey_app',
      callback: this.hotkeyMap.bind(this)
    });*/
  },
  beforeUnmount: function () {
    this.$store.commit('event/release', {
      action: 'click',
      key: 'focus_watcher',
    });
    /*this.$store.commit('event/release', {
      action: 'keyup',
      key: 'hotkey_app',
    });*/
  },
  methods: {
    toggleFocus: function (e: MouseEvent) {
      const target = (e.target as HTMLElement);
      // console.info('toggleFocus:', target, target.tagName, e,);
      switch (target.tagName) {
        default:
          this.$store.state.focus.last = target;
          break;
        case 'BUTTON':
          //focus会影响弹窗，但是这样你就无法选择任何一个按钮了
          target.blur();
          break;
      }
    },
    /*hotkeyMap: async function (e: KeyboardEvent) {
      console.info('hotkeyMap:', e.type, e.key, e.target, e);
    }*/
  },
})
export default class App extends Vue {
}
</script>
