<template>
  <article>
    <header>
      {{boardInfo.title}} 게시판 상단 부분 입니다.
    </header>

    <router-view v-if="isLoaded" />

    <footer>
      {{boardInfo.title}} 게시판 하단 부분 입니다.
    </footer>
  </article>
</template>

<script>
export default {
  computed: {
    boardKey() {
      return this.$route.params.boardKey;
    }
  },
  data() {
    return {
      isLoaded: false,
      boardInfo: {
        title: '',
        type: 'LIST',
        auth_list: 0,
        auth_view: 0,
        auth_write: 0,
        auth_comment: 0,
        page_rows: 0,
        category_info: []
      }
    }
  },
  methods: {
    getBoardInfo() {
      this.$axios
          .get(`/board/${this.boardKey}`)
          .then((result) => {
            for (let key in result.data.result) {
              if (typeof this.boardInfo[key] !== 'undefined') {
                this.boardInfo[key] = result.data.result[key];
              }
            }
            this.isLoaded = true;
          });
    }
  },
  mounted() {
    this.getBoardInfo();
  },
  watch: {
    boardKey() {
      this.getBoardInfo();
    }
  }
}
</script>