<template>
  <div class="dir">
    <div class="info" @click="fetch">
      <div>
        <!--        <a @click.stop="setImport(path)">select</a>-->
        <p :style="{paddingLeft:`${level*20}px`}">
          <span :class="{
            sysIcon:true,
            sysIcon_arrowright:type==='directory' && fold,
            sysIcon_arrowdown:type==='directory' && !fold,
            sysIcon_file:type==='file',
            }"></span>
          <span>{{ path }}</span>
        </p>
      </div>
      <div class="meta">
        <a @click.stop="setDelete(path)">Delete</a>
        <a v-if="type==='directory'" @click.stop="setUpload(path)">Upload</a>
        <a v-if="type==='file'" @click.stop="setDownload(path)">Download</a>
        <a v-if="type==='directory'" @click.stop="setImport(path)">Import</a>
        <p>{{ $util.kmgt(size) }}</p>
        <p>{{ type }}</p>
        <p>{{ auth }}</p>
      </div>
    </div>
    <template v-if="!fold">
      <import-files-sub class="sub" v-for="(item,index) in list"
                        :key="`setting_imp_f_${index}`"
                        :path="item.path"
                        :name="item.name"
                        :size="item.size"
                        :type="item.type"
                        :auth="item.auth"
                        :level="level+1"
      >
      </import-files-sub>
      <!--      @submit="setImport"-->
    </template>
  </div>
</template>

<style lang="scss">
.local_file_browser {
  background-color: map-get($colors, list_l2_bk);
  padding: $fontSize*0.5;
  .info {
    display: flex;
    //justify-content: left;
    justify-content: space-between;
    //margin-bottom: $fontSize*0.5;
    //padding-bottom: $fontSize*0.5;
    border-bottom: 1px solid map-get($colors, font_sub);
    p {
      display: inline-block;
      line-height: $fontSize*2;
      margin-left: $fontSize;
    }
    .sysIcon {
      margin-right: $fontSize;
      font-size: $fontSize*0.5;
      color: map-get($colors, font_sub);
    }
    cursor: pointer;
    &:hover {
      background-color: map-get($colors, list_l3_bk);
    }
    div {
      display: flex;
      justify-content: space-between;
    }
    .meta {
      p {
        min-width: $fontSize*5;
      }
    }
  }
  .dir {
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import {Modal as ModalConstructor, ModalCreatorConfig, ModalFormConstruct} from '@/lib/ModalLib';
import {ModalMeta, Node} from '@/struct';
import ContentEditable from '@/components/ContentEditable.vue';
import config from '@/config';

@Options({
  emits: ['submit'],
  props: {
    path: String,
    name: String,
    size: Number,
    type: String,
    auth: String,
    level: Number,
  },
  components: {
    ContentEditable,
    // ImportFilesSub,
  },
  data: function () {
    return {
      list: [],
      fold: true,
    };
  },
  created: function () {
    // console.debug(this);
    return '';
  },
  watch: {},
  mounted: function () {
    return '';
  },
  methods: {
    fetch: async function () {
      if (this.type !== 'directory') return;
      if (!this.fold) {
        this.fold = true;
        return;
      }
      if (this.list.length) {
        this.fold = false;
        return;
      }
      const res = await this.$query('local/ls', {
        path: this.path,
      });
      this.list = res;
      this.fold = false;
    },
    setDelete: async function () {
      console.info('setDelete');
    },
    setUpload: async function () {
      console.info('setUpload');
    },
    setDownload: async function () {
      console.info('setDownload');
      window.open(
        `${
          config.content.apiPath
        }local/get?token=${
          localStorage.getItem('toshokan_auth_token')
        }&path=${encodeURIComponent(this.path)}`
      )
    },
    setImport: async function (path: string) {
      const mvModal = {
        title: `import [${this.path}] to:`,
        key: 'setting_directory_import_confirm',
        alpha: true,
        single: true,
        //不可移动的不能调整大小
        movable: true,
        resizable: true,
        width: 480,
        height: 240,
        // width: 480,
        // height: 240,
        component: {
          MoveDirectory: {
            item: {
              id: -1,
              id_parent: -1,
            } as Node,
            callback: async (to: Node) => {
              console.debug(to, this.path);
              return;
              // console.debug('callback close');
              const res = await this.$query('file/dir_import', {
                dir_path: this.path,
                dir_id: to.id,
              });
            },
          },
        },
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', mvModal);
    },
  },
})
export default class ImportFilesSub extends Vue {
}
</script>
