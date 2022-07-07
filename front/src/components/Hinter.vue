<template>
  <div class="hinter" @click.stop>
    <input type="text"
           v-model="search"
           placeholder="something to search ..."
    />
    <!--  keydown的事件会慢一个字  @keydown="get"-->
    <ul class="hinter_selector" v-if="active">
      <li v-for="(item,index) in list"
          :key="index"
          @click="set(index)"
      >{{ process(item) }}
      </li>
    </ul>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.hinter {
  position: relative;
  > input {}
  .hinter_selector {
    position: fixed;
    //color: map-get($colors, selection);
    background-color: map-get($colors, hinter_bk);
    //top: $fontSize*1.5;
    max-height: $fontSize*10;
    min-width: $fontSize*15;
    max-width: 70vw;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: $hinterIndex;
    @include smallScroll();
    li {
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 $fontSize;
      line-height: $fontSize*1.5;
      height: $fontSize*1.5;
      //border-bottom: solid 1px white;
    }
    li:hover {
      background-color: map-get($colors, hinter_bk_active);
    }
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'

@Options({
  props: {
    fetch: Function,
    textProcess: Function,
    submit: Function,
    value: String,
    extra: undefined,
  },
  data: function () {
    return {
      active: false,
      search: this.value ? this.value : '',
      list: [],
      inactiveKey: (new Date()).valueOf()
    };
  },
  watch: {
    search: function (to, from) {
      // console.debug('search', to, from);
      this.get();
    },
  },
  created: function () {
    // console.debug('created', this.inactiveKey);
    this.$store.commit('event/register', {action: 'click', key: `hinter_inactive_${this.inactiveKey}`, callback: this.inactive.bind(this)});
  },
  beforeUnmount: function () {
    // console.debug('beforeUnmount', this.inactiveKey);
    this.$store.commit('event/release', {action: 'click', key: `hinter_inactive_${this.inactiveKey}`,});
  },
  methods: {
    get: async function () {
      // console.debug(this.search);
      if (this.value && this.search === this.value) {
        this.active = false;
        return;
      }
      if (!this.search) {
        this.active = false;
        return;
      }
      if (!this.fetch) {
        this.active = false;
        return;
      }
      this.list = await this.fetch(this.search);
      // console.info(this.list);
      this.active = true;
    },
    process: function (item: any) {
      if (this.textProcess) return this.textProcess(item);
      return item;
    },
    set: async function (index: number) {
      this.active = false;
      // this.search = this.process(this.list[index]);
      this.search = '';
      await this.submit(this.list[index], this.extra);
      console.info(this.search, this.value, this);
      if (this.value) {
        this.search = this.value;
      }
    },
    inactive: function () {
      this.active = false;
    }
  }
})
export default class Hinter extends Vue {
}
</script>
