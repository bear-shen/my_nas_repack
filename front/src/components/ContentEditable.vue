<template>
  <div class="editable" contenteditable="true" ref="content">{{ modelValue }}</div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'

@Options({
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  created: function () {
    console.debug('ContentEditable', this, this.modelValue);
  },
  mounted: function () {
    this.$refs.content.addEventListener('focus', this.onFocus);
    this.$refs.content.addEventListener('blur', this.onBlur);
    this.$refs.content.addEventListener('input', this.onInput);
  },
  methods: {
    onInput: function (e: InputEvent) {
      // console.debug('onInput', e);
      this.$emit('update:modelValue', this.$refs.content.innerText)
    },
    onFocus: function (e: FocusEvent) {
      // console.debug('onFocus', e);
    },
    onBlur: function (e: FocusEvent) {
      // console.debug('onBlur', e);
    },
  },
})
export default class ContentEditable extends Vue {
  msg!: string
}
</script>
