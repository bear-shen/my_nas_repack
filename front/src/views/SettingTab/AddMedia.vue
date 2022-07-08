<template>
  <div class="setting_item setting_add_media">
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
          <option>any</option>
        </select>
        <div class="operate">
          <button @click="saveItem(index)">save</button>
          <button @click="deleteItem(index)">delete</button>
        </div>
      </template>
      <template v-else>

        <div class="title">
          <input type="text" v-model="item.index" class="index" @blur="triggerSort(index)">
          {{ item.tree ? '/ ' + item.tree.title.join(' / ') : '' }} / {{ item.title }}
        </div>
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

<style lang="scss">
.setting_add_media {
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
      //vertical-align: top;
    }
    .title {
      min-width: 70%;
    }
    .type {
      padding: 0 $fontSize/2;
    }
    .operate {}
    .index {
      width: $fontSize*2.5;
    }
  }
  > div:nth-child(2n-1) {
    background-color: map-get($colors, list_l2_bk);
  }
  input {
    padding: 0 $fontSize/2;
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {Modal as ModalConstructor, ModalCreatorConfig} from '@/lib/ModalLib';
import {ModalMeta, NodeItem, MediaDirDefinition} from '@/struct';
import Hinter from '@/components/Hinter.vue';
import {FileType, nodeListFields} from '@/columns';
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
      list: [] as Array<MediaDirDefinition>,
    };
  },
  created: function () {
    console.debug(this);
    return '';
  },
  watch: {},
  mounted: function () {
    this.fetch();
  },
  methods: {
    fetch: async function () {
      const res = await this.$query('config/get', {
        name: 'media_folder',
      });
      if (res === false) return;
      console.info(res);
      this.list = res.value;
    },
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
      const res = await this.$query('config/set', {
        name: 'media_folder',
        value: JSON.stringify(this.list),
      });
      if (res === false) return;
      console.info(res);
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
    triggerSort: async function (index: number) {
      console.info('this.triggerSort', index);
      this.list.sort((
        a: MediaDirDefinition,
        b: MediaDirDefinition
      ) => {
        console.info(a.index, b.index);
        return a.index - b.index;
      });
      console.info(this.list);
      for (let i1 = 0; i1 < this.list.length; i1++) {
        this.list[i1].index = i1;
      }
      const res = await this.$query('config/set', {
        name: 'media_folder',
        value: JSON.stringify(this.list),
      });
    },
    dir_hinter_fetch: async function (key: string) {
      const queryRes = await this.$query(
        'file/list', {
          title: key, type: 'directory', total: 1, flag: ['tree'],
        } as nodeListFields);
      if (queryRes === false) return [];
      // console.debug(fileList);
      return queryRes.list;
    },
    dir_hinter_process: function (item: NodeItem) {
      return `${
        (item.tree?.title as Array<string>).join(' / ')
      } / ${
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
