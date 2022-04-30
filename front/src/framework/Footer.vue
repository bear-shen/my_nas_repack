<template>
  <div id="frame_footer">
    <div class="timer"></div>
    <div class="paginator">
      <ul v-if="$store.state.paginator.active">
        <li
          class="page_l sysIcon sysIcon_caretleft"
          @click="go('prev')"
        ></li>
        <li
          v-for="(pageInfo,pageNo) in $store.state.paginator.list"
          :key="pageNo"
          :class="{active:pageInfo.active}"
          @click="go(pageInfo.no)"
        >{{ pageInfo.no }}
        </li>
        <li
          class="page_r sysIcon sysIcon_caretright"
          @click="go('next')"
        ></li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#frame_footer {
  position: fixed;
  bottom: 0;
  left: 0;
  height: $footerHeight;
  line-height: $footerHeight;
  width: 100vw;
  background-color: map-get($colors, bar_bk);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .paginator ul {
    display: flex;
    flex-direction: row;
    li {
      width: $fontSize*2;
      text-align: center;
    }
    .active, li:hover {
      background-color: map-get($colors, nav_active);
    }
  }
}
@media (max-width: $narrowWidth) {}
@media (max-width: $tabletWidth) {}
@media (max-width: $mobileWidth) {}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'

@Options({
  components: {},
  data: function () {
    return {};
  },
  created: function () {
    // this.$store.commit('paginator/active', {count: 8, current: 2});
    // this.$store.commit('paginator/active', {count: 8, current: 3});
    // this.$store.commit('paginator/active', {count: 8, current: 4});
    // this.$store.commit('paginator/active', {count: 8, current: 5});
    // this.$store.commit('paginator/active', {count: 8, current: 6});
    // this.$store.commit('paginator/active', {count: 8, current: 7});
    // this.$store.commit('paginator/active', {count: 8, current: 8});
    // this.$store.commit('paginator/active', {count: 80, current: 1});
    // this.$store.commit('paginator/active', {count: 80, current: 10});
    // this.$store.commit('paginator/active', {count: 80, current: 78});
    // console.debug(this.$storge.state.paginator);
    return '';
  },
  watch: {},
  mounted: function () {
    this.$store.commit('event/register', {
      action: 'keyup',
      key: 'hotkey_pager',
      callback: this.hotkeyMap.bind(this)
    });
  },
  methods: {
    go: function (target: number | string) {
      let targetPage = 0;
      switch (target) {
        case 'prev':
          targetPage = this.$store.state.paginator.current - 1;
          if (targetPage < 1) targetPage = 0;
          break;
        case 'next':
          targetPage = this.$store.state.paginator.current + 1;
          if (targetPage > this.$store.state.paginator.count) targetPage = 0;
          break;
        case '...':
          break;
        default:
          if (target < 1) targetPage = 0;
          else if (target > this.$store.state.paginator.count) targetPage = 0;
          else if (target === this.$store.state.paginator.current) targetPage = 0;
          else targetPage = target as number;
          break;
      }
      console.debug('Footer go:', targetPage);
      // console.debug()
      if (targetPage) {
        if (this.$store.state.paginator.change) {
          this.$store.state.paginator.change(targetPage);
        } else {
          const query = this.$util.copyObject(this.$route.query);
          query.page = targetPage;
          this.$router.push({path: this.$route.path, query: query});
        }
      }
    },
    hotkeyMap: function (e: KeyboardEvent) {
      if (['ArrowLeft', 'ArrowRight',].indexOf(e.key) === -1) return;
      // console.info(e.type, e.key, e.target, e);
      //输入不在body时禁用（input之类的）
      if (e.target && (e.target as HTMLElement).tagName !== 'BODY') return;
      //上次点击的内容在模态里，
      //判断一下这个模态还在不在（是否关闭）
      //在的话就不允许翻页（模态内部处理）
      // let inModal = false;
      let domWalker = this.$store.state.focus.last;
      // console.info(domWalker);
      let modalExists = false;
      while (domWalker && domWalker.tagName !== 'BODY' && domWalker.tagName !== 'HTML') {
        // if (domWalker.id === 'frame_modal') inModal = true;
        // console.info(domWalker.className, domWalker.id, domWalker);
        if (domWalker.className === 'modal_item') {
          modalExists = !!document.getElementById(domWalker.id);
          break;
        }
        domWalker = domWalker.parentNode;
      }
      // console.info(modalExists);
      if (modalExists) return;
      //
      // console.info('set pager');
      switch (e.key) {
        case 'ArrowLeft':
          this.go('prev');
          break;
        case 'ArrowRight':
          this.go('next');
          break;
      }
    },
  },
})
export default class Footer extends Vue {
}
</script>
