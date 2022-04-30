import {createRouter, createWebHashHistory, RouteRecordName, RouteRecordRaw} from 'vue-router'
import Home from './views/Home.vue'
//
import Directory from './views/Directory.vue'
import Setting from './views/Setting.vue'
import Tag from './views/Tag.vue'
// import User from '../views/User.vue'
import Group from './views/Group.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Home',
    component: Home,
    meta: {icon: '', hide: true,},
  },
  {
    path: '/',
    name: 'Directory',
    component: Directory,
    meta: {icon: 'sysIcon_folder',},
    children: [
      /*{
        path: '/favourite',
        name: 'Favourite',
        component: Directory,
        meta: {icon: 'sysIcon_star-o',},
      },*/
      /*{
        path: '/share',
        name: 'Share',
        component: Directory,
        meta: {icon: 'sysIcon_link',},
      },*/
      {
        path: '/recycle',
        name: 'Recycle',
        component: Directory,
        meta: {icon: 'sysIcon_delete',},
      },
    ],
  },
  {
    path: '/tag',
    name: 'Tag',
    component: Tag,
    meta: {icon: 'sysIcon_tagso',},
  },
  {
    path: '/group',
    name: 'Group',
    component: Group,
    meta: {icon: 'sysIcon_team',},
    /*children: [
      {
        path: '/user',
        name: 'User',
        component: Group,
        meta: {icon: 'sysIcon_user',},
      },
    ],*/
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting,
    meta: {icon: 'sysIcon_setting',},
  },
];
export default routes;
