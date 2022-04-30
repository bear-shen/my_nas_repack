<template>
  <div class="setting_item">
    a demo
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {Modal as ModalConstructor, ModalCreatorConfig} from '@/lib/ModalLib';
import {ModalMeta, Node} from '@/struct';

@Options({
  emits: ['close'],
  props: {
    modalMeta: Object as unknown as ModalMeta,
  },
  components: {},
  data: function () {
    return {
      imp: {
        from: '/mnt/sn550e',
        to: 0,
        to_dir: {
          id: 0,
          title: 'root',
          tree: {
            id: [],
            title: [],
          },
        },
      },
    };
  },
  created: function () {
    console.debug(this);
    return '';
  },
  watch: {},
  mounted: function () {
    return '';
  },
  methods: {
    searchDir: function () {
      const mvModal = {
        title: `import [${this.imp.from}] to :`,
        key: 'setting_directory_import',
        alpha: false,
        single: true,
        //不可移动的不能调整大小
        movable: true,
        resizable: true,
        width: 480,
        height: 240,
        // text: 'this is content',
        component: {
          MoveDirectory: {
            item: {
              id: -1,
              id_parent: -1,
            } as Node,
            callback: async (to: Node) => {
              console.debug(to);
              this.imp.to_dir = to;
              this.imp.to = to.id;
            },
          },
        },
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', mvModal);
    },
    submitImport: async function () {
      const res = await this.$query('file/dir_import', {
        dir_path: this.imp.from,
        dir_id: this.imp.to_dir.id,
      });
    },
  },
})
export default class Demo extends Vue {
}
</script>
