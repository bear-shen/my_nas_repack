<template>
  <div class="setting_item">
    <div v-for="(item,index) in list" :key="`set_add_media_${index}`">
      <template v-if="item.edit">
        <hinter
          class="title"
          :fetch="dir_hinter_fetch"
          :text-process="dir_hinter_process"
          :submit="dir_hinter_submit"
          :value="item.title"
          :extra="index"
        ></hinter>
        <select v-model="item.target_type"
                class="type"
        >
          <option>audio</option>
          <option>video</option>
          <option>image</option>
          <option>binary</option>
          <option>text</option>
          <option>pdf</option>
        </select>
        <div class="operate">
          <button @click="saveItem(index)">save</button>
          <button @click="deleteItem(index)">delete</button>
        </div>
      </template>
      <template v-else>
        <div class="title">{{ item.tree ? '/ ' + item.tree.title.join(' / ') : '' }} / {{ item.title }}</div>
        <div class="type">{{ item.target_type }}</div>
        <div class="operate">
          <button @click="editItem(index)">edit</button>
          <button @click="deleteItem(index)">delete</button>
        </div>
      </template>
    </div>
    <div rowspan="3">
      <button @click="addItem">add</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.setting_item {
  height: auto;
  > div {
    height: $fontSize*2;
    line-height: $fontSize*2;
    display: flex;
    justify-content: space-between;
    > * {
      height: $fontSize*2;
      line-height: $fontSize*2;
      display: inline-block;
    }
    button {
      padding: 0 $fontSize;
      vertical-align: top;
    }
    .title {
      min-width: 70%;
    }
    .type {}
    .operate {}
  }
  > div:nth-child(2n-1) {
    background-color: map-get($colors, list_l2_bk);
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {Modal as ModalConstructor, ModalCreatorConfig} from '@/lib/ModalLib';
import {ModalMeta, NodeItem} from '@/struct';
import Hinter from '@/components/Hinter.vue';
import {FileType} from '@/columns';
// import ContentEditable from '@/components/ContentEditable.vue';

@Options({
  emits: ['close'],
  props: {
    modalMeta: Object as unknown as ModalMeta,
  },
  components: {
    Hinter,
    // ContentEditable,
  },
  data: function () {
    return {
      list: [
        {
          id: 1,
          title: 'audio',
          tree: {
            id: [0, 1, 2, 3, 4,],
            title: ['root', 'path1', 'path2', 'path3', 'path4',],
          },
          target_type: 'audio',
          edit: false
        },
        {
          id: 2,
          title: 'video',
          tree: {
            id: [0, 1, 2, 3, 4,],
            title: ['root', 'path1', 'path2', 'path3', 'path4',],
          },
          target_type: 'video',
          edit: false,
        },
      ] as Array<NodeItem & {
        target_type: FileType | null,
        edit: boolean,
      }>,
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
            } as NodeItem,
            callback: async (to: NodeItem) => {
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
    saveItem: async function (index: number) {
      const item = this.list[index];
      item.edit = false;
    },
    deleteItem: async function (index: number) {
      const item = this.list[index];
      this.list.splice(index, 1);
    },
    editItem: async function (index: number) {
      const item = this.list[index];
      item.edit = true;
    },
    addItem: async function (index: number) {
      const item = this.list[index];
      this.list.push({
        title: '',
        target_type: 'image',
        edit: true,
      });
    },
    dir_hinter_fetch: async function (key: string) {
      const queryRes = await this.$query(
        'file/list', {
          title: key, type: 'directory', total: 1, level: 'index',
        });
      if (queryRes === false) return [];
      // console.debug(fileList);
      return queryRes.list;
    },
    dir_hinter_process: function (item: NodeItem) {
      return `${
        (item.tree?.title as Array<string>).join(' \\ ')
      } \\ ${
        item.title
      }`;
    },
    dir_hinter_submit: function (item: NodeItem, index: any) {
      const target = this.list[index];
      target.id = item.id;
      target.title = item.title;
      target.tree = item.tree;
      console.info(target);
    },
  },
})
export default class AddMedia extends Vue {
}
</script>
