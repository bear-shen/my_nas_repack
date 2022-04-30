<template>
  <div v-if="!expand" @click="toggleExpand" class="folder userList">
    <span class="sysIcon sysIcon_banckward"></span>
    check users
    <span class="sysIcon sysIcon_forward"></span>
  </div>
  <div v-else class="userList">
    <table>
      <tr>
        <th>St.</th>
        <th>Name</th>
        <th>Mail</th>
        <th>Time</th>
        <th>Operate</th>
      </tr>
      <tr v-for="(user,userIndex) in userList" :key="userIndex"
          :class="[{edit:user.edit},{notEdit:!user.edit}]"
      >
        <template v-if="user.edit">
          <td>
            <span>Status :</span>
            <div><input
              type="checkbox" v-model="user.status"
              :id="`user_${userIndex}`"
              :true-value="1"
              :false-value="0"
            ><label
              :for="`user_${userIndex}`"
              :class="['sysIcon',user.status?'sysIcon_icon_right':'sysIcon_cuowu']"
            ></label>
            </div>
          </td>
          <td>
            <span>Name :</span>
            <content-editable v-model="user.name"/>
          </td>
          <td>
            <span>Mail :</span>
            <content-editable v-model="user.mail"/>
          </td>
          <td>
            <span>Password :</span>
            <content-editable v-model="user.password"/>
          </td>
          <td class="operate">
            <span class="sysIcon sysIcon_save" @click="modUser(userIndex)"></span>
            <span class="sysIcon sysIcon_delete" @click="delUser(userIndex)"></span>
          </td>
        </template>
        <template v-else>
          <td><span :class="['sysIcon',user.status?'sysIcon_icon_right':'sysIcon_cuowu']"></span></td>
          <td>{{ user.name }}</td>
          <td>{{ user.mail }}</td>
          <td>{{ user.time_update }}</td>
          <td class="operate">
            <span class="sysIcon sysIcon_edit" @click="modUser(userIndex)"></span>
            <span class="sysIcon sysIcon_delete" @click="delUser(userIndex)"></span>
          </td>
        </template>
        <!--        <td>{{ user.status }}</td>-->
      </tr>
      <tr>
        <td colspan="5" class="folder" @click="addUser">
          <span class="sysIcon sysIcon_plus-square-o"></span>
        </td>
      </tr>
      <tr>
        <td colspan="5" class="folder" @click="toggleExpand">
          <span class="sysIcon sysIcon_forward"></span>
          fold users
          <span class="sysIcon sysIcon_banckward"></span>
        </td>
      </tr>
    </table>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.folder {
  text-align: center;
  color: map-get($colors, font_sub);
  span {
    display: inline-block;
    padding: 0 $fontSize;
  }
}
.userList, table {
  width: 100%;
}
.userList {
  margin-top: $fontSize*0.5;
  background-color: map-get($colors, list_l2_bk);
  tr:nth-child(2n) {
    background-color: map-get($colors, list_l3_bk);
  }
  td {
    line-height: $fontSize*1.5;
    height: $fontSize*1.5;
    word-break: break-all;
    input[type='checkbox'] + label, input[type='radio'] + label {
      display: block;
      width: auto;
      text-align: center;
    }
  }
  .notEdit td:first-child, th:first-child {
    //padding-left: $fontSize;
    text-align: center;
  }
  .notEdit td:last-child, .edit td:last-child, th:last-child {
    padding-right: $fontSize;
  }
  .editable {
    background-color: map-get($colors, list_l4_bk);
  }
  .operate {
    text-align: right;
    span {
      margin-left: $fontSize*0.5;
      display: inline-block;
    }
  }
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import ContentEditable from '@/components/ContentEditable.vue';

@Options({
  components: {ContentEditable},
  props: {
    groupInfo: Object,
    userList: Object,
  },
  watch: {},
  data: function () {
    return {
      expand: false,
      list: [],
    };
  },
  created: function () {
    return null;
  },
  methods: {
    toggleExpand: function () {
      this.expand = !this.expand;
    },
    addUser: function () {
      this.userList.push(
        {
          edit: true,
          id: 0,
          id_group: this.groupInfo.id,
          name: '',
          mail: '',
          password: '',
          status: 1,
          time_create: '',
          time_update: '',
        });
      return null;
    },
    modUser: async function (userIndex: number) {
      if (this.userList[userIndex].edit) {
        const res = await this.$query('user/mod', this.userList[userIndex]);
        if (res === false) return;
        console.info(res);
      }
      this.userList[userIndex].edit = !this.userList[userIndex].edit;
      return null;
    },
    delUser: async function (userIndex: number) {
      const res = await this.$query('user/del', {id: this.userList[userIndex].id});
      if (res === false) return;
      console.info(res);
      this.userList.splice(userIndex, 1);
      return null;
    },
  },
})
export default class UserListInGroup extends Vue {
}
</script>
