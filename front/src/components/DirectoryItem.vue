<template>
  <div :class="['item',mode]">
    <img class="thumb" @click="go('node',item)" v-if="item.cover && item.cover.path_cover" :src="item.cover.path_cover" :alt="item.title">
    <img class="thumb" @click="go('node',item)" v-else-if="item.file && item.file.path_cover" :src="item.file.path_cover" :alt="item.title">
    <div class="thumb" @click="go('node',item)" v-else :class="['icon','listIcon',`listIcon_file_${item.type}`,]"></div>
    <!--    <div class="thumb" @click="go('node',item)">
          <img v-if="item.cover && item.cover.path_cover" :src="item.cover.path_cover">
          <img v-else-if="item.file && item.file.path_cover" :src="item.file.path_cover">
          <div v-else :class="['icon','listIcon',`listIcon_file_${item.type}`,]"></div>
        </div>-->
    <div class="meta">
      <template v-if="this.renaming">
        <div class="title"><label><input v-model="item.title" type="text"/></label></div>
        <div class="description">
          <label><textarea v-model="item.description"></textarea></label>
        </div>
      </template>
      <template v-else>
        <div class="title" @click="go('node',item)"><span :class="['icon','listIcon',`listIcon_file_${item.type}`,]"></span>{{ item.title }}</div>
        <div class="description" @click="go('node',item)">{{ item.description }}</div>
      </template>
      <div class="size">
        <template v-if="item.is_file">{{ $util.kmgt(item.file ? item.file.size : 0) }}</template>
      </div>
      <div class="time">{{ item.time_update }}</div>
      <!--      <div class="time">{{ item.time_update }}</div>-->
      <div class="operate">
        <!---->
        <button v-if="item.is_file" :class="['sysIcon','sysIcon_download',]" @click="op_download">DL</button>
        <button v-if="!item.is_file" :class="['sysIcon','sysIcon_stack',]" @click="go('node',item,true)">IN</button>
        <button :class="['sysIcon','sysIcon_edit',{active:renaming},]" @click="op_rename">RN</button>
        <button :class="['sysIcon','sysIcon_folderopen',]" @click="op_move">MV</button>
        <button :class="['sysIcon','sysIcon_tag-o',{active:tagging},]" @click="op_tag">TAG</button>
        <button :class="['sysIcon','sysIcon_tag-o',]" @click="op_imp_tag_eh">IMP EH TAG</button>
        <button v-if="item.is_file && (item.cover ||(item.file&&item.file.path_cover))"
                :class="['sysIcon','sysIcon_scan',]"
                @click="op_set_cover">COV
        </button>
        <button :class="['sysIcon','sysIcon_star-o',{active:item.is_fav},]" @click="op_set_favourite">FAV</button>
        <!--        <button :class="['sysIcon','sysIcon_link',]" @click="op_share">SHR</button>-->
        <template v-if="item.status">
          <button :class="['sysIcon','sysIcon_delete',]" @click="op_delete">DEL</button>
        </template>
        <template v-else>
          <button :class="['sysIcon','sysIcon_delete',]" @click="op_delete_forever">rDEL</button>
          <button :class="['sysIcon','sysIcon_delete',]" @click="op_delete">REC</button>
        </template>
        <!---->
      </div>
    </div>
    <template v-if="tagging">
      <div class="tag">
        <div class="group" v-for="(tagGroup,groupIndex) in item.tag" :key="groupIndex">
          <div class="title">{{ tagGroup.title }} :</div>
          <div class="list">
            <div
              class="title"
              v-for="(tag,tagIndex) in tagGroup.sub" :key="tagIndex"
            >
              {{ tag.title }}&nbsp;
              <span class="sysIcon sysIcon_cuowu" @click="tag_del(groupIndex,tagIndex)"></span>
            </div>
          </div>
        </div>
        <hinter
          :fetch="tag_hinter_fetch"
          :text-process="tag_hinter_process"
          :submit="tag_hinter_submit"
        ></hinter>
      </div>
    </template>
    <template v-else>
      <div class="tag" v-if="item.tag && item.tag.length">
        <div class="group" v-for="(tagGroup,groupIndex) in item.tag" :key="groupIndex">
          <div class="title">{{ tagGroup.title }} :</div>
          <div class="list">
            <div
              class="title" v-for="(tag,tagIndex) in tagGroup.sub" :key="tagIndex"
              @click="go('tag',tag)"
            >
              {{ tag.title }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.item {
  &:hover {
    background-color: map-get($colors, content_meta_bk_active);
  }
  .meta {
    > div {
      line-height: $fontSize*1.25;
      word-break: break-all;
    }
    .title, .description {
      word-break: break-all;
    }
    .description {
      white-space: pre-wrap;
    }
    .description, .time, .size {
      color: map-get($colors, font_sub);
    }
    input, textarea {
      padding: 0 $fontSize*0.5;
      width: calc(100% - #{$fontSize});
    }
    textarea {
      resize: vertical;
      height: $fontSize*5;
    }
  }
  .operate {
    button {
      padding: 0 $fontSize*0.25;
      margin: 0 $fontSize*0.125 $fontSize*0.125 0;
      font-size: $fontSize*0.75;
    }
    button.active {
      color: map-get($colors, directory_btn_active);
    }
    button::before {
      padding-right: $fontSize*0.25;
    }
  }
}
.item.detail {
  //这东西你总归还是要写个定值。。。。。
  $thumbSize: $fontSize*8;
  //$metaSize: $fontSize*12;
  //$tagSize: $fontSize*16;
  display: flex;
  flex-wrap: wrap;
  padding: $fontSize*0.5;
  /*> div {
    margin-right: $fontSize*0.5;
    &:last-child {
      margin-right: 0;
    }
  }*/
  .thumb {
    margin-right: $fontSize*0.5;
    width: calc(33% - #{$fontSize*0.5});
    height: $thumbSize;
    line-height: $thumbSize;
    text-align: center;
    //display: flex;
    //justify-content: center;
    //align-items: center;
    //align-self: center;
    /*img {
      max-width: 100%;
      max-height: 100%;
    }*/
    object-fit: contain;
    &.icon {
      display: inline-block;
      font-size: $thumbSize*0.8;
    }
  }
  .meta {
    display: flex;
    flex-direction: column;
    //justify-content: space-between;
    width: 66%;
    > div {
      margin-bottom: $fontSize*0.25;
      line-height: $fontSize*1.25;
      word-break: break-all;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .title {
      word-break: break-all;
      .icon {
        padding-right: $fontSize*0.25;
        font-size: $fontSize*1.5;
      }
    }
    .type {}
    .time {}
    .description, .time, .size {
      color: map-get($colors, font_sub);
    }
    .operate {
      //max-width: 100%;
    }
  }
  .tag {
    width: 100%;
    .group {
      padding-bottom: $fontSize*0.25;
      line-height: $fontSize*1.25;
      .title, .list {
      }
      .title {
        display: inline-block;
        padding-right: $fontSize*0.5;
      }
      .list {
        display: inline;
        .title {
          color: map-get($colors, font_sub);
        }
        .title:hover {
          color: map-get($colors, font_sub_active);
        }
      }
    }
  }
}
.item.text {
  //这东西你总归还是要写个定值。。。。。
  display: table-row-group;
  padding: $fontSize*0.25 $fontSize;
  line-height: $fontSize*1.5;
  &:nth-child(2n) {
    background-color: map-get($colors, content_meta_bk);
  }
  .thumb {
    display: none;
  }
  .meta {
    //width: 100%;
    display: table-row;
    //justify-content: space-between;
    > div {
      //padding-bottom: 0;
      display: table-cell;
      padding: $fontSize*0.25 0;
      &:first-child {
        padding-left: $fontSize;
      }
      &:last-child {
        padding-right: $fontSize;
      }
      line-height: $fontSize*1.5;
    }
    .title {
      .icon {
        font-size: $fontSize*1.5;
        padding-right: $fontSize*0.5;
      }
      min-width: 25%;
    }
    .description {
      //min-width: 25%;
    }
  }
  .tag {
    display: none;
  }
}
.item.img {
  //这东西你总归还是要写个定值。。。。。
  $thumbSize: $fontSize*6;
  $metaSize: $fontSize*12;
  //$tagSize: $fontSize*18;
  //display: flex;
  padding: $fontSize*0.5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .thumb {
    width: 100%;
    height: $thumbSize;
    line-height: $thumbSize;
    text-align: center;
    //display: flex;
    //justify-content: center;
    //align-items: center;
    //align-self: center;
    //img {
    //  max-width: 100%;
    //  max-height: $thumbSize;
    //}
    object-fit: contain;
    &.icon {
      display: inline-block;
      font-size: $thumbSize*0.8;
    }
  }
  .meta {
    //width: $metaSize;
    align-items: center;
    align-self: center;
    > div {
      padding: $fontSize*0.25 0;
    }
    .title {
      .icon {
        display: none;
      }
    }
    .description, .time, .size {
      display: none;
    }
  }
  .tag {
    display: none;
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import Hinter from '@/components/Hinter.vue';
import tagListDemo from '@/demo/getTagList';
import {Modal as ModalConstructor, createModal, ModalCreatorConfig} from '@/lib/ModalLib'
import {ModalMeta, NodeItem, TagGroupItem} from '@/struct';

@Options({
  components: {
    Hinter
  },
  emits: ['go', 'delete'],
  props: {
    index: Number,
    item: Object as NodeItem,
    mode: String,
  },
  data: function () {
    return {
      renaming: false,
      tagging: false,
    };
  },
  created: function () {
    // console.debug(this.$route);
    // console.debug(this.$route.path);
  },
  methods: {
    go: function (type: string, meta: any, cascade: any) {
      this.$emit('go', [type, meta, cascade]);
    },
    op_download: async function () {
      // console.info(this.item);
      window.open(
        `${this.item.file.path_raw}?filename=${this.item.title}`
        , '_blank');
    },
    op_rename: async function () {
      if (this.renaming) {
        const queryRes = await this.$query(
          'file/edit', {
            id: this.item.id,
            title: this.item.title,
            description: this.item.description,
          });
        if (queryRes === false) return;
      }
      this.renaming = !this.renaming;
    },
    op_move: async function () {
      const mvModal = {
        title: `move [${this.item.title}] to :`,
        key: `directory_item_move_${this.item.id}`,
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
            item: this.item,
            callback: async (to: NodeItem) => {
              // console.debug(index, (this.modalMeta as ModalMeta).data.item, this.list[index]);
              const queryRes = await this.$query(
                'file/move', {
                  id: this.item.id,
                  parent_id: to.id,
                });
              if (queryRes === false) return;
              this.$emit('delete');
            },
          },
        },
        /*callback: () => {
          console.debug('callback close');
          return '';
        },*/
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', mvModal);
    },
    op_tag: async function () {
      //@see tag_hinter_submit
      // if (this.tagging) {
      // }
      this.tagging = !this.tagging;
    },
    op_imp_tag_eh: async function () {
      const mvModal = {
        title: `attach tag from eht.js to [${this.item.title}]:`,
        key: `eht_tag_attach_${this.item.id}`,
        alpha: false,
        single: true,
        //不可移动的不能调整大小
        movable: true,
        resizable: false,
        width: 360,
        height: 150,
        // text: 'this is content',
        form: [
          {
            type: 'textarea',
            name: 'json data',
            value: '',
          },
        ],
        callback: {
          submit: async (form, key, on) => {
            let val;
            if (form && form[0]) {
              val = form[0].value;
            }
            console.debug('callback close', val, this.item.id,);
            const queryRes = await this.$query(
              'tag/import_eht', {
                data: val,
                id: this.item.id,
              });
            if (queryRes === false) return;
            (on as any).close();
          },
          close: async (form, key, on) => {
            console.debug('callback close');
            console.info(form);
            (on as any).close();
          },
        },
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', mvModal);
    },
    tag_del: async function (groupIndex: number, tagIndex: number) {
      if (!this.item.tag[groupIndex]) return;
      if (!this.item.tag[groupIndex].sub[tagIndex]) return;
      const tag = this.item.tag[groupIndex].sub[tagIndex];
      const queryRes = await this.$query(
        'tag/detach', {
          tag_id: tag.id,
          node_id: this.item.id,
        });
      if (queryRes === false) return;
      this.item.tag[groupIndex].sub.splice(tagIndex, 1);
      if (!this.item.tag[groupIndex].sub.length) {
        this.item.tag.splice(groupIndex, 1);
      }
    },
    op_set_cover: async function () {
      const res = await this.$query('file/cover', {
        id_parent: this.item.id_parent,
        id_node: this.item.id,
      });
      if (res === false) return;
      console.info('op_set_cover complete');
      // this.item.is_cover = !this.item.is_cover;
    },
    op_set_favourite: async function () {
      this.item.is_fav = !this.item.is_fav;
    },
    op_share: async function () {
      const shareModal = {
        title: `share [${this.item.title}] `,
        key: `directory_item_share_${this.item.id}`,
        alpha: false,
        single: true,
        //不可移动的不能调整大小
        movable: true,
        resizable: false,
        width: 480,
        height: 80,
        text: `<a href="/" target="_blank">click here to open [${this.item.title}]</a>`,
      } as ModalCreatorConfig;
      this.$store.commit('modal/push', shareModal);
    },
    op_delete: async function () {
      const queryRes = await this.$query(
        'file/delete', {
          id: this.item.id,
        });
      if (queryRes === false) return;
      this.$emit('delete', this.index);
    },
    op_delete_forever: async function () {
      // console.info('op_delete_forever');
      const queryRes = await this.$query(
        'file/delete_forever', {
          id: this.item.id,
        });
      if (queryRes === false) return;
      this.$emit('delete', this.index);
    },
    // ------------------------------------------------
    tag_hinter_fetch: async function (keyword: any) {
      console.debug('tag_hinter_fetch');
      const res = await this.$query('tag/list', {
        title: keyword, id_dir: (this.item as NodeItem).id_parent,
        with_group_meta: 1,
      });
      if (res === false) return;
      // console.info(res)
      return res.list;
    },
    tag_hinter_process: function (item: any) {
      // console.debug('tag_hinter_process', item);
      return `${item.group.title} : ${item.title}`;
    },
    tag_hinter_submit: async function (item: any) {
      console.debug('tag_hinter_submit', item);
      const queryRes = await this.$query(
        'tag/attach', {
          tag_id: item.id,
          node_id: this.item.id,
        });
      if (queryRes === false) return;
      if (!this.item.tag) this.item.tag = [] as Array<TagGroupItem>;
      let groupIndex = -1;
      let itemIndex = -1;
      for (let i1 = 0; i1 < this.item.tag.length; i1++) {
        if (this.item.tag[i1].id !== item.group.id) continue;
        groupIndex = i1;
        for (let i2 = 0; i2 < this.item.tag[i1].sub.length; i2++) {
          if (this.item.tag[i1].sub[i2].id === item.id) itemIndex = i2;
        }
      }
      if (groupIndex === -1) {
        groupIndex = this.item.tag.length;
        this.item.tag.push({id: item.group.id, title: item.group.title, sub: []});
      }
      if (itemIndex === -1) {
        this.item.tag[groupIndex].sub.push({id: item.id, title: item.title,});
      }
      // console.debug(this.item.tag)
    },
  }
})
export default class DirectoryItem extends Vue {
  item!: string
  mode!: string
}
</script>
