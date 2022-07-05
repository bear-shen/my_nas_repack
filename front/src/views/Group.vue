<template>
  <div class="content_body content_group">
    <div
      v-for="(group,groupIndex) in list"
      :key="groupIndex"
      :class="['group',{edit:!!group.edit}]"
    >
      <table>
        <template v-if="!group.edit">
          <tr>
            <td>{{ group.title }}</td>
            <td class="op">
              <span class="sysIcon sysIcon_edit" @click="editGroup(groupIndex)"></span>
              <span class="sysIcon sysIcon_delete" @click="delGroup(groupIndex)"></span>
            </td>
          </tr>
          <tr>
            <td>{{ group.time_update }}</td>
            <td rowspan="2" :class="[
            'op',
            'status',
            'sysIcon',
            group.status?'sysIcon_icon_right':'sysIcon_cuowu',
            ]"></td>
          </tr>
          <tr>
            <td>{{ group.description }}</td>
          </tr>
          <tr
            v-for="(auth,authIndex) in group.auth"
            :key="authIndex"
            class="auth"
          >
            <td> {{ auth.tree.title.length ? ('\\ ' + auth.tree.title.join(' \\ ').trim()) : '' }}
              \ {{ auth.dir.title }}
            </td>
            <td class="op">
              <span :class="[auth.allow_r?'avail':'unavail']">read</span>
              <span :class="[auth.allow_w?'avail':'unavail']">write</span>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="3"><input v-model="group.title"></td>
            <td class="op">
              <span class="sysIcon sysIcon_save" @click="editGroup(groupIndex)"></span>
            </td>
          </tr>
          <tr>
            <td colspan="3"><input
              type="checkbox" v-model="group.admin"
              :id="`user_group_${groupIndex}`"
              :true-value="1"
              :false-value="0"
            ><label
              :for="`user_group_${groupIndex}`"
            >{{ group.admin ? 'admin' : 'user' }}</label></td>
          </tr>
          <tr>
            <td colspan="4"><input v-model="group.description"></td>
          </tr>
          <tr
            v-for="(auth,authIndex) in group.auth"
            :key="authIndex"
            class="auth"
          >
            <td>
              <hinter
                :fetch="dir_hinter_fetch"
                :text-process="dir_hinter_process"
                :submit="dir_hinter_submit"
                :value="auth.title_dir"
                :extra="[groupIndex,authIndex]"
              ></hinter>
            </td>
            <td>{{ auth.tree.title.length ? ('\\ ' + auth.tree.title.join(' \\ ').trim()) : '' }} \ {{ auth.dir.title }}</td>
            <td class="op">
              <input
                type="checkbox" v-model="auth.allow_r"
                :id="`user_group_${groupIndex}_auth_${authIndex}_r`"
                :true-value="1"
                :false-value="0"
              ><label
              :for="`user_group_${groupIndex}_auth_${authIndex}_r`"
            >read</label>
              <input
                type="checkbox" v-model="auth.allow_w"
                :id="`user_group_${groupIndex}_auth_${authIndex}_w`"
                :true-value="1"
                :false-value="0"
              ><label
              :for="`user_group_${groupIndex}_auth_${authIndex}_w`"
            >write</label>
            </td>
            <td class="op">
              <span class="sysIcon sysIcon_delete"
                    @click="delAuth(groupIndex,authIndex)"
              ></span>
            </td>
          </tr>
          <tr>
            <td colspan="4" class="auth add" @click="addAuth(groupIndex)">
              <span class="sysIcon sysIcon_plus-square-o"></span>
            </td>
          </tr>
        </template>
        <tr>
          <td :colspan="group.edit?4:2" @click="loadUser(groupIndex)">
            <user-list-in-group :group-info="group" :user-list="group.user"></user-list-in-group>
          </td>
        </tr>
      </table>
    </div>
    <div
      :class="['group','add','sysIcon','sysIcon_plus-square-o']"
      @click="addGroup"
    ></div>
  </div>
</template>

<style lang="scss">
.content_group {
  //display: flex;
  //flex-wrap: wrap;
  columns: 2;
  column-span: none;
  line-height: 1.5em;
  padding: $fontSize;
  .group {
    break-inside: avoid;
    //margin: 0 $fontSize*0.5 $fontSize*0.5 0;
    margin-bottom: $fontSize*0.5;
    padding: $fontSize*0.5;
    background-color: map-get($colors, list_l1_bk);
    > table {
      width: 100%;
    }
    .op {
      text-align: right;
      white-space: nowrap;
      span {
        margin-left: $fontSize*0.5;
        padding: 0 $fontSize*0.25;
      }
    }
    .status {
      font-size: $fontSize*2;
    }
  }
  .group.add {
    font-size: $fontSize*5;
    line-height: $fontSize*5;
  }
  .auth.add {
    text-align: center;
  }
  input {
    padding: 0 $fontSize*0.5;
    //vertical-align: top;
  }
  .avail {
    background-color: map-get($colors, positive);
  }
  .warn {
    //background-color: map-get($colors, half_negative);
  }
  .unavail {
    background-color: map-get($colors, negative);
  }
  .group.edit {
    tr, td {
      height: $fontSize*1.5;
      padding-bottom: $fontSize*0.25;
    }
    td {
      //white-space: nowrap;
      word-break: break-all;
      //overflow: hidden;
      //text-overflow: ellipsis;
      //max-width: 50%;
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
import {NodeItem} from '@/struct';

@Options({
  components: {Hinter, UserListInGroup,},
  data: function () {
    return {
      list: [],
    };
  },
  created: function () {
    this.fetchGroup();
  },
  watch: {},
  mounted: function () {
    return '';
  },
  methods: {
    fetchGroup: async function () {
      const res = await this.$query('user_group/list', {});
      if (res === false) return;
      console.info(res);
      this.list = res;
    },
    editGroup: async function (groupIndex: number,) {
      if (this.list[groupIndex].edit) {
        const data = {
          id: this.list[groupIndex].id,
          title: this.list[groupIndex].title,
          description: this.list[groupIndex].description,
          admin: this.list[groupIndex].admin,
          status: this.list[groupIndex].status,
          auth: JSON.stringify(this.list[groupIndex].auth),
        };
        const res = await this.$query('user_group/mod', data);
        if (res === false) return;
        console.info(res);
      }
      this.list[groupIndex].edit = this.list[groupIndex].edit ? 0 : 1;
    },
    addGroup: function () {
      this.list.push({
        edit: true,
        id: 0,
        title: '',
        description: '',
        admin: 1,
        status: 1,
        auth: [],
        time_create: '',
        time_update: '',
      },);
      return '';
    },
    delGroup: async function (groupIndex: number,) {
      const res = await this.$query('user_group/del', {id: this.list[groupIndex].id});
      if (res === false) return;
      // console.info(res);
      this.list.splice(groupIndex, 1)
    },
    //
    addAuth: function (groupIndex: number) {
      this.list[groupIndex].auth.push(
        {
          dir: {
            id: 0,
            title: 'root',
          },
          tree: {
            id: [],
            title: [],
          },
          allow_r: 1,
          allow_w: 1,
        },);
    },
    delAuth: async function (groupIndex: number, authIndex: number) {
      this.list[groupIndex].auth.splice(authIndex, 1)
    },
    //
    loadUser: async function (groupIndex: number) {
      if (this.list[groupIndex].user) return;
      const res = await this.$query('user/list', {id_group: this.list[groupIndex].id});
      if (res === false) return;
      // console.info(res);
      this.list[groupIndex].user = res;
      return null;
    },
    //
    dir_hinter_fetch: async function (key: string) {
      const queryRes = await this.$query(
        'file/list', {
          title: key, type: 'directory', total: 1, level: 'index',
        });
      if (queryRes === false) return;
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
    dir_hinter_submit: function (item: NodeItem, meta: Array<number>) {
      console.debug('dir_hinter_submit', item, meta);
      Object.assign(
        this.list[meta[0]].auth[meta[1]], {
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
export default class Group extends Vue {
}
</script>
