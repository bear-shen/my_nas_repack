<template>
  <div :class="['content_body', 'content_directory',mode]">
    <directory-item
      v-for="(item ,index) in list" :key="index"
      :item="item" :mode="mode" :index="index"
      @delete="$emit('delete',index)"
      @go="$emit('go',$event)"
    ></directory-item>
    <!--
    @delete="$emit('delete',index)"
    @go="$emit('go',$event)"
    -->
    <!--
    @delete="delFile(index)"
    @go="go(...$event)"
    -->
  </div>
</template>

<style lang="scss" scoped>
.content_directory {
  $lineHeight: $fontSize*2;
  //padding: $fontSize*0.25;
  &.detail {
    columns: 4;
    @media (max-width: $narrowWidth) {
      columns: 3;
    }
    @media (max-width: $tabletWidth) {
      columns: 2;
    }
    @media (max-width: $mobileWidth) {
      columns: 1;
    }
    column-span: none;
    //display: flex;
    //flex-wrap: wrap;
    //justify-content: space-between;
    > .item {
      break-inside: avoid;
    }
  }
  &.img {
    //display: flex;
    //flex-wrap: wrap;
    //justify-content: space-around;
    columns: 6;
    @media (max-width: $narrowWidth) {
      columns: 5;
    }
    @media (max-width: $tabletWidth) {
      columns: 3;
    }
    @media (max-width: $mobileWidth) {
      columns: 2;
    }
    > .item {
      break-inside: avoid;
    }
  }
  &.text {
    display: table;
    width: 100%;
    //flex-direction: column;
    //flex-wrap: wrap;
    //justify-content: start;
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import DirectoryItem from '@/components/DirectoryItem.vue';
import fileListDemo from '@/demo/getFileList';
import {ModalCreatorConfig} from '@/lib/ModalLib';
import {NodeItem} from '@/struct';
import {nodeListFields} from '@/columns';

@Options({
  components: {
    DirectoryItem
  },
  emits: ['go', 'delete'],
  props: {
    mode: String,
    // type: String,
    list: Array as unknown as Array<NodeItem>,
    // query: Object as unknown as nodeListFields,
  },
  data: function () {
    return {};
  },
  created: function () {
    return '';
  },
  watch: {
    // query: function (to, from) {
    //
    // },
    // $route: function (to, from) {
    //   this.fetch();
    // },
  },
  mounted: function () {
    return '';
  },
  methods: {}
})
export default class DirectoryLayout extends Vue {
}
</script>
