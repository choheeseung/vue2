<template>
  <my-form-row>
    <my-form-label :required="required">{{label}}</my-form-label>
    <my-form-input-wrap>
      <slot />
    </my-form-input-wrap>
  </my-form-row>
</template>
<script setup lang="ts">
import MyFormRow from "@/views/Components/MyFormRow.vue";
import MyFormLabel from "@/views/Components/MyFormLabel.vue";
import MyFormInputWrap from "@/views/Components/MyFormInputWrap.vue";

export default {
  components: {MyFormInputWrap, MyFormLabel, MyFormRow},
  props: {
    required: {
      type: Boolean,
      default: false,
      required: false,
    },
    label: {
      type: String,
      required: false,
      default: '',
    }
  }
}
</script>