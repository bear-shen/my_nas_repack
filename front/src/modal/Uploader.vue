<template>
  <div class="file_uploader" ref="modalComponentFrame">
    <ul class="uploader_frame">
      <li v-for="(item,index) in list" :key="index">
        <div class="title_bar">
          <span>{{ item.name }}</span>
          <p>
            <span>{{ item.status }}</span>
            <span>{{ $util.kmgt(item.size, 2) }}</span>
          </p>
        </div>
        <div :class="['status_bar',item.status]" :style="{width:item.percent*100+'%',}"></div>
      </li>
    </ul>
    <div class="uploader_btn">
      <button @click="onFileSelect">Select</button>
      <input type="file" multiple ref="uploadInput" @change="onFileInput($event)">
      <button @click="goUpload">Upload</button>
      <button @click="close">Cancel</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file_uploader {
  height: 100%;
  .uploader_frame {
    height: calc(100% - #{$fontSize*2});
    overflow-y: scroll;
    overflow-x: hidden;
    @include smallScroll();
    background-color: map-get($colors, modal_uploader_alpha);
    li:nth-child(2n - 1) {
      background-color: map-get($colors, modal_uploader_alpha_n);
    }
    li {
      height: $fontSize*1.5;
      line-height: $fontSize*1.5;
      position: relative;
    }
    .title_bar {
      display: flex;
      justify-content: space-between;
      z-index: 2;
      position: relative;
      white-space: nowrap;
      //* {z-index: 2;}
      span {
        display: inline-block;
        padding: 0 $fontSize*0.25;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      p {
        span {
          width: $fontSize*5;
          text-align: right;
        }
      }
    }
    .status_bar {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      //width: 100%;
      z-index: 1;
      &.success, &.uploading {
        background-color: map-get($colors, modal_uploader_success);
      }
      &.error {
        background-color: map-get($colors, modal_uploader_error);
      }
    }
  }
  input[type=file] {
    display: none;
  }
  .uploader_btn {
    display: flex;
    padding: $fontSize*0.5 0 0;
    justify-content: center;
    vertical-align: center;
    button {
      //font-size: $fontSize;
      height: $fontSize*1.5;
      line-height: $fontSize*1.5;
      padding: 0 $fontSize*0.5;
      margin: 0 $fontSize*0.25;
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
import {CurlData} from '@/utils/util';

class fileDef {
  public name?: string;
  public size?: number;
  public file?: File | null;
  public status?: string;
  public percent?: number;
}

@Options({
  emits: ['close'],
  props: {
    modalMeta: Object as unknown as ModalMeta,
    // input: Object,
    //模态框的基本设置
    // modal: Object as unknown as ModalConstructor,
    //模态框的DOM`
    // frame: Object as unknown as HTMLElement,
  },
  components: {},
  data: function () {
    return {
      list: [
        /*{
          name: 'this is title.txt', size: 1024,
          file: null, status: 'waiting', percent: 0.5,
        },
        {
          name: 'this is title.txt', size: 1024,
          file: null, status: 'waiting', percent: 0.5,
        },
        {
          name: 'this is title.txt', size: 1024024,
          file: null, status: 'uploading', percent: 0.7,
        },
        {
          name: 'this is title.txt', size: 1024024024,
          file: null, status: 'success', percent: 1,
        },
        {
          name: 'this is title.txt', size: 1054024024024,
          file: null, status: 'error', percent: 0.25,
        },*/
      ] as Array<fileDef>,
      uploading: false,
      queueSize: 5,
    };
  },
  watch: {},
  created: function () {
    return '';
  },
  mounted: function () {
    console.debug();
    this.$refs.modalComponentFrame.addEventListener('drop', this.onDrop);
    this.$refs.modalComponentFrame.addEventListener('dragover', (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();
    });
    // this.$refs.modalComponentFrame.addEventListener('dragend', this.onDrag);
    // this.$refs.modalComponentFrame.addEventListener('dragenter', this.onDrag);
    // this.resize();
  },
  methods: {
    onDrop: function (e: DragEvent) {
      console.debug('onDrag', e.type, e.dataTransfer?.files, e);
      e.preventDefault();
      e.stopPropagation();
      if (!e.dataTransfer || !e.dataTransfer.files.length) return;
      for (let i1 = 0; i1 < e.dataTransfer?.files.length; i1++) {
        const item = e.dataTransfer?.files[i1] as File;
        this.list.push(
          {
            name: item.name, size: item.size,
            file: item, status: 'waiting', percent: 0,
          }
        );
      }
    },
    onFileSelect: function (e: any) {
      console.debug('onFileSelect', e);
      this.$refs.uploadInput.click();
    },
    onFileInput: function (e: Event) {
      console.debug('onFileInput', e);
      const fileList = (e.target as HTMLInputElement).files;
      if (!fileList || !fileList.length) return;
      for (let i1 = 0; i1 < fileList.length; i1++) {
        const item = fileList[i1];
        this.list.push(
          {
            name: item.name, size: item.size,
            file: item, status: 'waiting', percent: 0,
          }
        );
      }
      (e.target as HTMLInputElement).value = '';
    },
    goUpload: function () {
      console.debug('goUpload');
      for (let i1 = 0; i1 < Math.min(this.queueSize, this.list.length); i1++) {
        const index = this.getUploadIndex()
        if (index === -1) continue;
        this.queueUpload(this.list[index]);
      }
    },
    getUploadIndex: function () {
      let uploadingCount = 0;
      for (let i1 = 0; i1 < this.list.length; i1++) {
        if (this.list[i1].status !== 'uploading') continue;
        uploadingCount += 1;
      }
      if (uploadingCount >= this.queueSize) {
        return -1;
      }
      // -----------------------------
      let index = -1;
      for (let i1 = 0; i1 < this.list.length; i1++) {
        if (this.list[i1].status !== 'waiting') continue;
        index = i1;
        return index;
      }
      return -1;
    },
    queueUpload: async function (item: fileDef) {
      console.debug('queueUpload', item.name, item);
      item.status = 'uploading';
      const formData = new FormData();
      const node = (this.modalMeta as ModalMeta).data.item as NodeItem;
      formData.set(
        'parent_id',
        node.id ? `${1 * node.id}` : ''
      );
      formData.set('file', (item.file as File));
      const res = await this.$query(
        'file/upload',
        formData,
        {
          upload: (e: ProgressEvent) => {
            // console.info(e);
            item.percent = Math.round(10000 * e.loaded / e.total) / 100
          }
        });
      if (res === false) return;
      // console.info(res);
      item.status = 'success';
      //
      const next = this.getUploadIndex()
      if (next === -1) return;
      this.queueUpload(this.list[next]);
    },
    onProcess: async function (e: ProgressEvent) {
      console.debug('onProcess');
    },
    close: function () {
      this.$emit('close');
    },
  },
})
export default class Uploader extends Vue {
}
</script>
