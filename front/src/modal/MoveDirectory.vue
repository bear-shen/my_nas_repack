<template>
  <div class="modal_mv_dir" ref="modalComponentFrame">
    <label><input
      type="text" placeholder="search directory ..."
      v-model="search"
    /></label>
    <div class="list">
      <template v-for="(item,index) in list" :key="index">
        <div
          v-if="
          !(item.tree&&item.tree.id.indexOf(modalMeta.data.item.id)!==-1)
          &&item.id!==modalMeta.data.item.id
          &&item.id!==modalMeta.data.item.id_parent
"
          @click="set(index)">
          <template v-if="item.id">\ {{ item.tree.title.join(' \\ ').trim() }}</template>
          \ {{ item.title }}
        </div>
      </template>
    </div>
    <div class="operate">
      <button @click="close()">close</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal_mv_dir {
  //display: flex;
  //flex-direction: column;
  //justify-content: space-between;
  //height: 100%;
  label {
    input {
      width: 100%;
      padding: $fontSize*0.5 0;
      text-indent: 1em;
    }
  }
  .list {
    //min-height: $fontSize*16;
    //max-height: 80%;
    margin: $fontSize*0.5 0;
    div {
      line-height: $fontSize*1.5;
      height: $fontSize*1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      //margin-bottom: $fontSize*0.25;
    }
    div:hover {
      background-color: map-get($colors, input_bk_active);
    }
  }
  .operate {
    text-align: center;
    button {
      display: inline-block;
    }
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import fileListDemo from '@/demo/getFileList';
import {Modal as ModalConstructor} from '@/lib/ModalLib';
import Modal from '@/framework/Modal.vue';
import {ModalMeta, NodeItem} from '@/struct';

@Options({
  emits: ['close'],
  props: {
    modalMeta: Object as unknown as (
      ModalMeta & {
      data?: {
        callback?: (item: NodeItem) => any,
        data?: NodeItem,
      }
    }),
    // input: Object,
    //模态框的基本设置
    // modal: Object as unknown as ModalConstructor,
    //模态框的DOM`
    // frame: Object as unknown as HTMLElement,
  },
  components: {},
  data: function () {
    return {
      search: '',
      list: [],
    };
  },
  watch: {
    search: async function (to, from) {
      // console.debug('search', to, from);
      if (!to.trim().length) {
        this.list = [];
        this.resize();
        return;
      }
      await this.get();
      this.resize();
    },
  },
  created: function () {
    return '';
  },
  mounted: function () {
    this.resize();
  },
  methods: {
    set: async function (index: number) {
      await (this.modalMeta as ModalMeta).data.callback(this.list[index]);
      this.$emit('close');
    },
    get: async function () {
      const queryRes = await this.$query(
        'file/list', {
          title: this.search, type: 'directory', total: 1, level: 'index',
        });
      if (queryRes === false) return;
      if ('root'.indexOf(this.search) !== -1) {
        queryRes.list.unshift({
          id: 0,
          title: 'root',
          tree: {id: [], title: [],},
        } as unknown as NodeItem);
      }
      this.list = queryRes.list;
    },
    close: function () {
      this.$emit('close');
    },
    resize: function () {
      setTimeout(() => {
        if (!(this.modalMeta as ModalMeta).dom) return this.resize();
        const componentHeight = this.$refs.modalComponentFrame.scrollHeight;
        const titleHeight = (this.modalMeta as ModalMeta).dom.querySelector('.modal_title_bar')?.scrollHeight;
        (this.modalMeta as ModalMeta).modal.layout.h = componentHeight + titleHeight + 16;
      }, 50);
    },
  },
})
export default class MoveDirectory extends Vue {
}
</script>
