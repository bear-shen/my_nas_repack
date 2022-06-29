<template>
  <div class="content_body content_local">
<!--    <content-editable v-model="from"></content-editable>
    <div>
      <a @click="submitImport" type="button">submit</a>
      <a @click="searchDir" type="button">import to</a>
      <span>
            <template v-if="to_dir.tree.title.length">\ {{ to_dir.tree.title.join(' \\ ').trim() }}</template>
            \ {{ to_dir.title }}</span>
    </div>-->
    <import-files-sub class="sub local_file_browser"
                      path="/"
                      name="root"
                      :size="0"
                      type="directory"
                      auth=""
                      :level="0"
    >
    </import-files-sub>
<!--    @submit="setImport"-->
  </div>
</template>

<style lang="scss">
.content_local {
  > div {
    margin-bottom: $fontSize*0.5;
    > a {
      margin-right: $fontSize*0.5;
    }
  }
  a {
    line-height: $fontSize;
    display: inline-block;
    background-color: map_get($colors, input_button_bk);
    color: map_get($colors, input_button_font);
    padding: map_get($sizeConf, btn_padding);
    &:hover, &.active, &.disabled {
      background-color: map_get($colors, input_button_bk_active);
      color: map_get($colors, input_button_font_active);
    }
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import userGroupList from '@/demo/getUserGroupList';
import userList from '@/demo/getUserList';
import fileList from '@/demo/getFileList';
import Hinter from '@/components/Hinter.vue';
import UserListInGroup from '@/components/UserListInGroup.vue';
import {ModalMeta, NodeItem} from '@/struct';
import ContentEditable from '@/components/ContentEditable.vue';
import ImportFilesSub from '@/components/ImportFilesSub.vue';
import {ModalCreatorConfig, ModalFormConstruct} from '@/lib/ModalLib';

@Options({
  emits: ['close'],
  props: {
  },
  components: {
    ContentEditable,
    ImportFilesSub,
  },
  data: function () {
    return {
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
    setImport: function (path: string) {
      console.info(path);
      this.$refs.body.scrollTop = 0;
      this.from = path;
    },
    //zzz
    searchDir: function () {
      const mvModal = {
        title: `import [${this.from}] to :`,
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
              this.to_dir = to;
              this.to = to.id;
            },
          },
        },
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', mvModal);
    },
  },
})
export default class Local extends Vue {
}
</script>
