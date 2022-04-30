<template>
  <div id="frame_header">
    <div class="logo">Hentai.</div>
    <ul class="navi">
      <li class="active">Nas</li>
      <li>Hypervisor</li>
      <li>Router</li>
      <li>Spider</li>
      <li>Github</li>
    </ul>
    <div class="config">settings</div>
  </div>
</template>

<style lang="scss" scoped>
#frame_header {
  position: fixed;
  top: 0;
  left: 0;
  height: $headerHeight;
  line-height: $headerHeight;
  width: 100vw;
  background-color: map-get($colors, bar_bk);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .logo {
    padding-left: $fontSize;
  }
  .navi {
    li:hover{
      background-color: map-get($colors,bar_menu_active);
    }
    white-space: nowrap;
    li {
      display: inline-block;
      padding: 0 $fontSize*0.25;
    }
  }
  .config {
    padding-right: $fontSize;
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
    return '';
  },
  watch: {},
  mounted: function () {
    return '';
  },
  methods: {},
})
export default class Header extends Vue {
}
</script>
