<template>
  <form @submit.prevent="onSubmit">
    <my-text-input label="제목" v-model="formData.title" required />

    <template v-if="loginUser.id <= 0">
      <my-text-input label="닉네임" v-model.trim="formData.author_name" required />
      <my-text-input type="password" label="비밀번호" v-model.trim="formData.author_pass" required />
    </template>

    <my-input label="공지사항">
      <input type="checkbox" v-model="formData.is_notice" id="is_notice" />
      <label for="is_notice">공지사항</label>
    </my-input>

    <my-input label="글내용">
      <editor
          height="auto"
          ref="editor"
          v-model="formData.content"
          initialEditType="wysiwyg"
          :options="editorOption"
          @change="onEditorChange"
      />
    </my-input>

    <my-input label="첨부파일">
      <input type="file" id="fileInput" ref="fileInputRef" style="display: none" multiple @change="onFileInputChange" />
      <ul>
        <li v-for="(attach, index) in formData.attach_list" :key="`attach-${index}`">
          <a :href="attach.file_url" target="_blank">{{attach.original_name}}</a>
          <button type="button" @click="removeAttach(index)">파일삭제</button>
        </li>
      </ul>
      <span v-if="ui.isUploading">파일을 업로드중입니다.</span>
      <label v-else for="fileInput">+ 파일 추가</label>
    </my-input>

    <button type="submit">글 작성하기</button>
  </form>
</template>
<script setup lang="ts">
import MyTextInput from "@/views/Components/MyTextInput.vue";
import MyInput from "@/views/Components/MyInput.vue";

import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/vue-editor';
import '@toast-ui/editor/dist/i18n/ko-kr';

export default {
  components: {MyTextInput, MyInput, Editor},
  data() {
    return {
      ui: {
        isEditorChanging: false,
        isUploading: false,
      },
      formData: {
        title: '',
        is_notice: false,
        author_name: '',
        author_pass: '',
        content: '',
        attach_list: []
      },
      editorOption: {
        language: 'ko-KR',
        hideModeSwitch: true,
        initialEditType: 'wysiwyg',
      }
    }
  },
  computed: {
    boardKey() {
      return this.$route.params?.boardKey ?? '';
    },
    postId() {
      return this.$route.params?.postId ?? 0;
    },
    postParentId() {
      return this.$route.params?.parentPostId ?? 0;
    },
    isEdit() {
      return this.postId > 0;
    },
    isReply() {
      return !this.isEdit && this.postParentId > 0;
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.isEdit) {
        this.getPostInfo(this.postId)
            .then((res) => {
              for (let key in res.data.result) {
                if (this.formData[key] !== 'undefined') {
                  this.formData[key] = res.data.result[key];
                }
              }
              this.formData.author_pass = '';
            })
            .catch(() => {
              alert('수정하려는 글의 정보를 불러올 수 없습니다. 존재하지 않거나, 이미 삭제되었습니다.');
              this.$router.back();
            });
      }
      else if (this.isReply) {
        this.getPostInfo(this.postParentId)
            .then((res) => {
              this.formData.title = "[RE] " + res.data.result.title;
            })
            .catch(() => {
              alert('답글을 달려는 글의 정보를 불러올 수 없습니다. 존재하지 않거나, 이미 삭제되었습니다.');
            })
      }
    })
  },
  methods: {
    getPostInfo(id) {
      return this.$axios.get(`/board/${this.boardKey}/posts/${id}`);
    },
    onEditorChange() {
      if (this.ui.isEditorChanging) return;

      this.ui.isEditorChanging = true;
      this.formData.content = this.$refs.editor.invoke('getHTML');
      this.ui.isEditorChanging = false;
    },
    removeAttach(index) {
      if (this.formData.attach_list.length > index + 1) {
        alert('해당 파일이 존재하지 않거나 이미 삭제되었습니다.');
        return;
      }

      this.$axios.delete('/attaches', {
        params: {
          file: this.formData.attach_list[index].file_path
        }
      }).finally(() => {
        this.formData.attach_list.splice(index, 1);
      })
    },
    async onFileInputChange() {
      const files = this.$refs.fileInputRef.files;

      if (files && files.length > 0) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
          formData.append('userfile', files[i]);
        }
        this.ui.isUploading = true;

        await this.$axios.post(`/attaches`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
          for (let i = 0; i < res.data.length; i++) {
            this.formData.atach_list.push(res.data[i]);
          }
          this.$refs.fileInputRef.value = '';
        }).finally(() => {
          this.ui.isUploading = false;
        })
      }
    },
    onSubmit() {
      if (this.formData.title.length === 0) {
        alert('글 제목은 필수로 입력하셔야 합니다.')
        return;
      }
      if (this.formData.content.length === 0) {
        alert('글 내용은 필수로 입력하셔야 합니다.')
        return;
      }
      if (this.loginUser.id <= 0) {
        if (this.formData.author_name === '') {
          alert('닉네임은 필수로 입력하셔야 합니다.')
          return;
        }
        if (this.formData.author_pass === '') {
          alert('비밀번호는 필수로 입력하셔야 합니다.')
          return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if(! passwordRegex.test(this.formData.author_pass)) {
          alert('비밀번호는 8자 이상, 하나이상의 문자,숫자 및 특수문자를 사용하셔야 합니다');
          return;
        }

        const requestUri = `/board/${this.boardKey}/posts` + (this.isEdit ? `/${this.postId}` : '');
        const formData = this.formData;
        if (this.isReply) {
          formData.parent_id = this.postParentId * 1;
        }

        this.$axios({
          method: this.isEdit ? 'PUT' : 'POST',
          url: requestUri,
          data: formData
        }).then((res) => {
          const postId = res.data.result?.id ?? 0;

          if (postId > 0) {
            this.$router.replace(`/board/${this.boardKey}/${postId}`);
          } else {
            this.$router.replace(`/board/${this.boardKey}`);
          }
        })
      }
    }
  }
}
</script>