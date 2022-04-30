<template>
  <div id="frame_content" :class="{naviFold:$store.state.framework.fold}">
    <slot></slot>
    <!--    <slot name=""></slot>-->
  </div>
</template>

<style lang="scss">
#frame_content {
  position: fixed;
  top: $headerHeight;
  height: calc(100vh - #{$headerHeight} - #{$footerHeight});
  //
  left: $navWidth;
  width: calc(100vw - #{$navWidth});
  &.naviFold {
    left: $navFoldWidth;
    width: calc(100vw - #{$navFoldWidth});
  }
  overflow: auto;
  > div {
    margin-bottom: $fontSize;
    &:last-child {
      //margin-bottom: 0;
    }
  }
  @include smallScroll();
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'

@Options({
  components: {},
  data: function () {
    return {};
  },
  created: function () {
    return '';
  },
  watch: {
    $route: function (to, from) {
      console.debug('app: route to', this.$route, from.path, to.path);
      if (from.path !== to.path) {
        this.$store.commit('paginator/inactive');
      }
    },
  },
  mounted: function () {
    return '';
  },
  methods: {},
})
export default class Content extends Vue {
}
</script>
