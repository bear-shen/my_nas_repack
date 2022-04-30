<template>
  <div>
    <template
      v-for="(record,index) in records"
      :key="index"
    >
      <template v-if="!record.meta.hide">
        <p @click="go(record)"
           :class="{active:record.path===$route.path}"
        >
          <span :class="['sysIcon',record.meta.icon]"></span>
          <span v-if="!$store.state.framework.fold">{{ record.name }}</span>
        </p>
        <!--折叠影响排版，所以干脆先不显示-->
        <navi-content
          v-if="!$store.state.framework.fold && record.children && record.children.length"
          :records="record.children"
          :depth="depth+1"
        ></navi-content>
        <!--<navi-content
                  v-if="record.children && record.children.length"
                  :records="record.children"
                  :depth="depth+1"
                ></navi-content>-->
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {RouteRecordRaw} from 'vue-router';
import SubContent from '@/framework/NaviContent.vue';

@Options({
  components: {
    NaviContent: SubContent,
  },
  props: {
    records: Array,
    depth: Number,
    // fold: Boolean,
  },
  data: function () {
    return {};
  },
  created: function () {
    console.debug('===== NaviContent =====');
    console.debug(this.records);
    return '';
  },
  watch: {},
  mounted: function () {
    return '';
  },
  methods: {
    go: function (route: RouteRecordRaw): void {
      // console.debug(route);
      this.$router.push(route.path)
    },
  },
})
export default class NaviContent extends Vue {
}
</script>
