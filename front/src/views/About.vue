<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src

@Options({
  components: {
    HelloWorld
  },
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
export default class Home extends Vue {
}
</script>
