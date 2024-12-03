<template>
  <div class="login-wrap">
    <form @submit.prevent="onLogin">
      <input v-model.trim="formData.loginId" required />

      <input :type="passwordInputType" v-model.trim="formData.loginPass" required />
      <button type="button" @click="togglePasswordVisible">{{passwordViewButtonText}}</button>

      <button type="submit">로그인</button>
      <router-link to="/authorize/sign-up">회원가입</router-link>
    </form>
  </div>
</template>

<script>
import userModel from "@/models/userModel";
export default {
  name: 'SignIn',
  data() {
    return {
      ui: {
        passwordVisible: false,
      },
      formData: {
        loginId: '',
        loginPass: ''
      }
    }
  },
  computed: {
    passwordInputType() {
      return this.ui.passwordVisible ? 'text' : 'password';
    },
    passwordViewButtonText() {
      return this.ui.passwordVisible ? '감추기' : '보이기';
    }
  },
  methods: {
    togglePasswordVisible() {
      this.ui.passwordVisible = !this.ui.passwordVisible;
    },
    onLogin() {
      if (this.formData.loginId === '') {
        alert('아이디를 입력하세요');
        return;
      }
      if (this.formData.loginPass === '') {
        alert('비밀번호를 입력하세요');
        return;
      }
      userModel.requestLogin({
        loginId: this.formData.loginId,
        loginPass: this.formData.loginPass,
      }).then(() => {
        this.$router.replace('/')
      })
    }
  }
}
</script>