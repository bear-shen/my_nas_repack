<template>
  <div id="frame_navi" :class="{folded:$store.state.framework.fold}">
    <div class="fold" @click="$store.commit('framework/fold')"><span class="sysIcon sysIcon_swap"></span></div>
    <navi-content :records="$routeData" :depth="1"></navi-content>
    <!--    <navi-content :records="$routeData" :depth="1" :fold="$store.state.framework.fold"></navi-content>-->
  </div>
</template>

<style lang="scss">
#frame_navi {
  position: fixed;
  top: $headerHeight;
  left: 0;
  height: calc(100vh - #{$headerHeight} - #{$footerHeight});
  width: $navWidth;
  background-color: map-get($colors, nav_bk);
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  &.folded {
    width: $navFoldWidth;
    text-align: center;
  }
  .fold {
    text-align: center;
    //font-size: $fontSize;
  }
  p, .fold {
    line-height: $fontSize*2;
    padding-right: $fontSize*0.5;
  }
  p span:nth-child(2) {
    margin-left: $fontSize*0.5;
  }
  p:hover, p.active, .fold:hover {
    background-color: map-get($colors, nav_active);
  }
  div p::before, .fold::before {
    width: $fontSize*0.5;
    display: inline-block;
    content: '';
  }
  div div p::before {
    width: $fontSize*1;
  }
  div div div p::before {
    width: $fontSize*1.5;
  }
}
@media (max-width: $narrowWidth) {}
@media (max-width: $tabletWidth) {}
@media (max-width: $mobileWidth) {}

</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import NaviContent from '@/framework/NaviContent.vue';

@Options({
  components: {
    NaviContent
  },
  data: function () {
    // console.debug(this.$routeData);
    // console.debug(this.$store);
    return {};
  },
  created: function () {
    // console.debug(this.$store.getters['framework/getFold']);
    // this.fold = this.$store.state.framework.fold;
    return true;
  },
  watch: {
    /*'$store.state.framework.fold': function (to, from) {
      console.debug('watch:$store.state.framework.fold', to);
      // this.fold = to;
      return true;
    },*/
  },
  mounted: function () {
    return '';
  },
  methods: {
    /*toggleFold: function () {
      this.$store.state.framework.fold = !this.$store.state.framework.fold;
      // this.$store.commit('framework/navi_toggle')w
      return true;
    },*/
  },
})
export default class Navi extends Vue {
}
</script>
