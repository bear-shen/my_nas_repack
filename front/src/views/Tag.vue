<template>
  <div class="content_meta content_tag_meta">
    <div class="tabs">
      <div
        :class="{tab:true,cur:cGroup.id===group.id}"
        v-for="(group,groupIndex) in groupList" :key="`_${groupIndex}`"
        @click="toggleGroup(groupIndex)"
      >{{ group.dir.title }} - {{ group.title }}
      </div>
      <div class="tab sysIcon sysIcon_plus-square-o" @click="add_group()"></div>
    </div>
  </div>
  <div class="content_body content_tag" v-if="cGroup">
    <div class="group_info">
      <div>
        <div><span>Title : &nbsp;</span><input v-model="cGroup.title" placeholder="title"></div>
        <div><span>Description : &nbsp;</span><input v-model="cGroup.description" placeholder="description"></div>
      </div>
      <div>
        <div><span></span><span>\ {{ cGroup.tree.title.join(' \\ ') + ' \\ ' + cGroup.dir.title }}</span></div>
        <div>
          <span>Directory : &nbsp;</span>
          <hinter
            :fetch="dir_hinter_fetch"
            :text-process="dir_hinter_process"
            :submit="dir_hinter_submit"
            :value="cGroup.dir.title"
          ></hinter>
        </div>
      </div>
      <div class="icons">
        <div class="sysIcon sysIcon_save" @click="edit_group"></div>
        <div class="sysIcon sysIcon_cuowu" @click="del_group"></div>
      </div>
    </div>
    <div class="tag_list">
      <!--      <div class="tag search sysIcon sysIcon_fangdajing1">-->
      <div class="tag search">
        <input placeholder="search..." v-model="query.title">
        <!--        <span class="sysIcon sysIcon_fangdajing1"></span>-->
      </div>
      <template v-if="cTag && cTag.length">
        <div v-for="(tag,tagIndex) in cTag" :key="tagIndex"
             :class="['tag',{edit:tag.edit}]"
        >
          <template v-if="tag.edit">
            <div class="title">
              <content-editable
                v-model="tag.title"
              ></content-editable>
              <div>
                <span class="sysIcon sysIcon_save" @click="edit_tag(tagIndex)"></span>
                <span class="sysIcon sysIcon_cuowu" @click="del_tag(tagIndex)"></span>
              </div>
            </div>
            <content-editable
              v-model="tag.description"
              :class="['description']"
            ></content-editable>
            <div class="alt">
              <template v-for="(altName,altIndex) in tag.alt" :key="altIndex">
                <div class="alt">
                  <content-editable
                    v-model="tag.alt[altIndex]"
                    :class="[`_ce_tag_${tagIndex}_${altIndex}`]"
                  ></content-editable>
                  <div class="sysIcon sysIcon_cuowu" @click="del_alt(tagIndex,altIndex)"></div>
                </div>
              </template>
              <div class="alt add sysIcon sysIcon_plus-square-o" @click="add_alt(tagIndex)"></div>
            </div>
          </template>
          <template v-else>
            <div class="title">
              <div>{{ tag.title }}</div>
              <div>
                <span class="sysIcon sysIcon_edit" @click="edit_tag(tagIndex)"></span>
                <span class="sysIcon sysIcon_delete" @click="del_tag(tagIndex)"></span>
              </div>
            </div>
          </template>
        </div>
      </template>
      <div class="tag add sysIcon sysIcon_plus-square-o" @click="add_tag()"></div>
    </div>
    <!--    <div v-for="(group,groupIndex) in cGroup" :key="`_${groupIndex}`"
             :class="['group',{edit:group.edit}]"
        >
          <template v-if="group.edit">
            <div class="title">
              <div><input v-model="group.title" placeholder="title"></div>
              <div>
                <div class="sysIcon sysIcon_save" @click="editGroup(groupIndex,1)"></div>
                <div class="sysIcon sysIcon_cuowu" @click="editGroup(groupIndex)"></div>
              </div>
            </div>
            <div class="description"><input v-model="group.description" placeholder="description"></div>
            <div class="path">
              <hinter
                :fetch="dir_hinter_fetch"
                :text-process="dir_hinter_process"
                :submit="dir_hinter_submit"
                :value="group.dir.title"
                :extra="groupIndex"
              ></hinter>
              <div>{{ group.dir.title }}</div>
            </div>
          </template>
          <template v-else>
            <div class="title">
              <div>{{ group.title }}</div>
              <div>
                <div class="sysIcon sysIcon_edit" @click="editGroup(groupIndex)"></div>
                <div class="sysIcon sysIcon_delete" @click="delGroup(groupIndex)"></div>
              </div>
            </div>
            <div class="description">{{ group.description }}</div>
            <div class="time">{{ group.time_update }}</div>
            <div class="path">\ {{ group.tree.title.join(' \\ ') + ' \\' }}</div>
          </template>
          <div class="sub">
            <div v-for="(tag,tagIndex) in group.sub" :key="`_${groupIndex}_${tagIndex}`"
                 :class="['tag',{edit:tag.edit}]"
            >
              <template v-if="tag.edit">
                <div class="title">
                  <div><input v-model="tag.title" placeholder="title"></div>
                  <div>
                    <span class="sysIcon sysIcon_save" @click="editTag(groupIndex,tagIndex,1)"></span>
                    <span class="sysIcon sysIcon_cuowu" @click="editTag(groupIndex,tagIndex)"></span>
                  </div>
                </div>
                <div class="description"><input v-model="tag.description" placeholder="description"></div>
                <div class="alt">
                  &lt;!&ndash; -&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; &ndash;&gt;
                  <template v-for="(altName,altIndex) in tag.alt" :key="altIndex">
                    <div class="alt">
                      <content-editable
                        v-model="tag.alt[altIndex]"
                        :class="[`_ce_tag_${groupIndex}_${tagIndex}_${altIndex}`]"
                      ></content-editable>
                      <div class="sysIcon sysIcon_cuowu"
                           @click.stop="delAlt(groupIndex,tagIndex,altIndex)"
                      ></div>
                    </div>
                  </template>
                  <div class="alt add sysIcon sysIcon_plus-square-o"
                       @click="addAlt(groupIndex,tagIndex,)"
                  ></div>
                </div>
                &lt;!&ndash; -&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; &ndash;&gt;
              </template>
              <template v-else>
                <div class="title">
                  <div>{{ tag.title }}</div>
                  <div>
                    <span class="sysIcon sysIcon_edit" @click="editTag(groupIndex,tagIndex)"></span>
                    <span class="sysIcon sysIcon_delete" @click="delTag(groupIndex,tagIndex)"></span>
                  </div>
                </div>
              </template>
            </div>
            <div class="tag add sysIcon sysIcon_plus-square-o" @click="addTag(groupIndex)"></div>
          </div>
        </div>
        <div class="group add sysIcon sysIcon_plus-square-o" @click="addGroup()"></div>-->
  </div>
</template>

<style lang="scss">
.content_meta {
  background-color: map-get($colors, content_meta_bk);
  .tabs {
    //display: flex;
    //flex-wrap: wrap;
    line-height: $fontSize*2;
    .tab {
      display: inline-block;
      white-space: nowrap;
      padding: 0 $fontSize*0.5;
      &.cur, &:hover {
        background-color: map-get($colors, bar_menu_active);
      }
    }
  }
}
#frame_content > div.content_tag_meta {
  margin-bottom: 0;
}
.content_tag {
  $subSize: $fontSize*2;
  .hinter_selector {
    li {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      direction: rtl;
    }
  }
  > div {
    padding: 0 $fontSize;
  }
  //line-height: 1em;
  .group_info {
    //background-color: map-get($colors, content_meta_bk);
    background-color: map-get($colors, bar_menu_active);
    display: flex;
    padding-bottom: $fontSize*0.5;
    > div {
      margin-right: $fontSize;
    }
    > div > div {
      display: flex;
      justify-content: space-between;
      > * {
        display: inline-block;
      }
    }
    span {
      line-height: $subSize;
    }
    input {
      padding: 0 $fontSize*0.5;
      background-color: transparent;
      position: relative;
      border-bottom: 1px solid map-get($colors, input_font);
      line-height: calc(#{$subSize} - 1px);
      height: calc(#{$subSize} - 1px);
    }
    .icons {
      > div {
        align-self: flex-end;
        line-height: $subSize*0.75;
        font-size: $subSize*0.75;
        margin-top: $subSize*0.25;
        //padding: $subSize*0.125;
      }
    }
  }
  //$subSize: $fontSize*0.9;
  $subSize: $fontSize;
  .tag_list {
    margin-top: $fontSize;
    columns: 8;
    column-span: none;
    @media (max-width: $narrowWidth) {
      columns: 6;
    }
    @media (max-width: $tabletWidth) {
      columns: 3;
    }
    @media (max-width: $mobileWidth) {
      columns: 2;
    }
    .tag.search {
      padding: 0 $subSize*0.5 $subSize*0.5;
      white-space: nowrap;
      position: relative;
      /*&.sysIcon {
        font-size: $subSize*2;
        line-height: $subSize*2;
      }
      &:before {
        position: absolute;
        right: 0;
        height: 0;
      }*/
      input {
        padding: 0;
        //width: calc(100% - #{$subSize*2});
        width: 100%;
        background-color: transparent;
        position: relative;
        border-bottom: 1px solid map-get($colors, input_font);
        line-height: calc(#{$subSize} * 2 - 1px);
        height: calc(#{$subSize} * 2 - 1px);
      }
    }
    .tag {
      break-inside: avoid;
      //display:block;
      padding: $subSize*0.5;
      //margin: $fontSize*0.5 0;
      background-color: map-get($colors, list_l2_bk);
      &:hover {
        background-color: map-get($colors, list_l1_bk);
      }
      //font-size: $fontSize;
      //line-height: $fontSize*1.25;
      position: relative;
      > div {
        margin-bottom: $subSize*0.125;
        line-height: $subSize*1.5;
      }
      > .description, > .time, > .alt {
        color: map-get($colors, font_sub);
      }
      > .title {
        display: flex;
        justify-content: space-between;
        font-size: $subSize;
      }
      > .alt {
        font-size: $subSize;
      }
      .sysIcon {
        margin-left: $subSize*0.25;
        cursor: pointer;
        font-size: $subSize;
      }
    }
    .tag.sysIcon {
      cursor: pointer;
      font-size: $subSize*5;
      line-height: $subSize*5;
    }
    .tag.edit {
      //width: 100%;
      display: block;
      background-color: map-get($colors, list_l1_bk);
      .editable {
        word-break: break-all;
      }
      > .title, > .description {
        min-width: $subSize*4;
        border-bottom: 1px solid map-get($colors, list_l4_bk);
      }
      > .alt {
        margin-top: $subSize*0.5;
        color: map-get($colors, font);
        > div {
          display: inline-block;
          background-color: map-get($colors, list_l3_bk);
          margin: 0 $subSize*0.25 $subSize*0.25 0;
          padding: 0 $subSize*0.25;
          .editable {
            padding: 0 $subSize*0.25;
          }
          > div {
            display: inline-block;
          }
        }
        > div.alt_name:after {
          content: "\e600";
          margin-left: $subSize*0.25;
        }
      }
    }
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import tagGroupList from '@/demo/getTagGroupList';
import fileList from '@/demo/getFileList';

import Hinter from '@/components/Hinter.vue';
import ContentEditable from '@/components/ContentEditable.vue';
import {NodeItem, TagItem, TagGroupItem} from '@/struct';

@Options({
  components: {Hinter, ContentEditable,},
  data: function () {
    return {
      query: {
        title: '',
        // id_dir: '',
        // id_group: '',
        page: 1,
        // with_group_meta: '',
      },
      groupList: [],
      cGroup: null,
      cTag: [],
    };
  },
  created: async function () {
    // if (this.$route.query.page) this.query.page = this.$route.query.page;
    // this.query = this.$util.copy(this.$route.query);
    await this.fetchGroup();
  },
  watch: {
    'query.title': function (to) {
      console.debug(to);
      // if (!to || !to.length) return;
      this.query.page = 1;
      this.fetchTag();
      return null;
    },
    'query.page': function (to) {
      console.debug(to);
      // if (!to || !to.length) return;
      // this.query.page = 1;
      this.fetchTag();
      // return null;
    },
    /*$route: function (to, from) {
      // this.query = this.$util.copy(to.query);
      if (to.query.page) this.query.page = to.query.page;
      this.fetchTag();
    }*/
  },
  mounted: function () {
    return '';
  },
  methods: {
    fetchGroup: async function () {
      // const res = await this.$query('tag_group/list', {with_tag: 1});
      const res = await this.$query('tag_group/list',);
      if (res === false) return;
      this.groupList = res;
      this.cGroup = res[0];
      console.info(res);
      this.fetchTag();
      //tag这布局怎么看也不需要太多分页，所以一次性加载了算了
      /*for (let i1 = 0; i1 < tagGroupList.length; i1++) {
        this.list.push(tagGroupList[i1]);
        this.list.push(tagGroupList[i1]);
        this.list.push(tagGroupList[i1]);
        this.list.push(tagGroupList[i1]);
        this.list.push(tagGroupList[i1]);
      }*/
    },
    fetchTag: async function () {
      console.warn('fetchTag');
      if (!this.cGroup) return;
      const res = await this.$query('tag/list', {
        id_group: this.cGroup.id,
        page: this.query.page ? this.query.page : 1,
        title: this.query.title ? this.query.title : '',
      });
      if (res === false) return;
      this.cTag = res.list;
      this.$store.commit(
        'paginator/active',
        {
          count: res.size,
          current: res.page ? res.page * 1 : 1,
          change: this.setPage
        });
      console.info(res);
    },
    setPage: function (page: number) {
      this.query.page = page;
    },
    toggleGroup: function (index: number) {
      this.cGroup = this.groupList[index];
      this.query.page = 1;
      this.fetchTag();
    },
    add_group: async function () {
      const cGroup = {
        id: 0,
        title: 'group title',
        description: '',
        status: 0,
        id_dir: 0,
        dir: {id: 0, title: 'root'},
        tree: {id: [0], title: ['root']},
        sub: [],
      } as TagGroupItem;
      this.groupList.push(cGroup);
      this.cGroup = cGroup;
    },
    edit_group: async function () {
      const queryRes = await this.$query(
        'tag_group/mod', {
          id: this.cGroup.id,
          title: this.cGroup.title,
          description: this.cGroup.description,
          sort: this.cGroup.sort,
          id_dir: this.cGroup.id_dir,
        });
      if (queryRes === false) return;
      console.info('edit_group complete');
    },
    del_group: async function () {
      if (!this.cGroup.id) {
        const queryRes = await this.$query(
          'tag_group/delete', {id: this.cGroup.id,});
        if (queryRes === false) return;
      }
      //
      let index = 0;
      for (let i1 = 0; i1 < this.groupList.length; i1++) {
        if (this.groupList[i1].id !== this.cGroup.id) continue;
        index = i1;
      }
      let i2 = index - 1;
      if (i2 < 0) i2 = 1;
      if (!this.groupList[i2]) {
        this.add_group();
        i2 = this.groupList.length - 1;
      }
      this.cGroup = this.groupList[i2];
      console.info(index, i2, this.cGroup?.title);
      //
      this.groupList.splice(index, 1);
    },
    edit_tag: async function (index: number) {
      if (this.cTag[index].edit) {
        const tag = this.cTag[index] as TagItem;
        const queryRes = await this.$query(
          'tag/mod', {
            id: tag.id,
            title: tag.title,
            description: tag.description,
            alt: tag.alt,
          });
        if (queryRes === false) return;
      }
      this.cTag[index].edit = !this.cTag[index].edit;
    },
    del_tag: async function (index: number) {
      const tag = this.cTag[index] as TagItem;
      if (this.cTag[index].id) {
        const queryRes = await this.$query('tag/delete', {id: tag.id,});
        if (queryRes === false) return;
      }
      this.cTag.splice(index, 1);
    },
    add_tag: function () {
      this.cTag.push({
        id: 0,
        id_group: this.cGroup.id,
        title: 'title',
        alt: [],
        description: 'description',
        status: 1,
        edit: 1,
      } as TagItem);
    },
    add_alt: function (index: number) {
      this.cTag[index].alt.push('');
      const altIndex = this.cTag[index].alt.length - 1;
      setTimeout(() => {
        const target = document.querySelector(`._ce_tag_${index}_${altIndex}`);
        if (target) {
          (target as HTMLDivElement).focus();
        }
      }, 50);
    },
    del_alt: function (index: number, altIndex: number) {
      this.cTag[index].alt.splice(altIndex, 1);
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
        (item.tree?.title as Array<string>).join(' / ')
      } / ${
        item.title
      }`;
    },
    dir_hinter_submit: function (item: NodeItem,) {
      console.info(item,);
      Object.assign(
        this.cGroup, {
          id_dir: item.id,
          dir: {
            id: item.id,
            title: item.title,
          },
          tree: {
            id: item.tree?.id,
            title: item.tree?.title,
          },
        });
    },
  },
})
export default class Tag extends Vue {
}
</script>
