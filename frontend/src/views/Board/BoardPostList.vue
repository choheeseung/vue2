<template>
  <component
      :is="boardInfo.type"
      @onFilterUpdated="onFilterUpdated"
      @onSearch="onSearch"
  />
</template>

<script>
import SimpleListSkin from './Skins/PostSimpleList.vue'
import GallerySkin from './Skins/PostGallery.vue'
import WebZineSkin from './Skins/PostWebzine.vue'

export default {
  components: {
    'LIST': SimpleListSkin,
    'GALLERY': GallerySkin,
    'WEBZINE': WebZineSkin
  },
  computed: {
    boardKey() {
      return this.$parent.boardKey;
    },
    boardInfo() {
      return this.$parent.boardInfo;
    },
    totalPages() {
      return this.boardInfo.page_rows === 0 ? 1 : Math.ceil(this.listData.totalCount / this.boardInfo.page_rows);
    }
  },
  data() {
    return {
      listData: {
        result: [],
        page: 1,
        totalCount: 0
      },
      filters: {
        type: 'title',
        q: '',
      }
    }
  },
  methods: {
    getPostList() {
      const formData = {};
      formData.searchColumn = this.filters.type;
      formData.searchQuery = this.filters.q;
      formData.page = this.listData.page;
      formData.page_rows = this.boardInfo().page_rows;

      this.axios.get(`/board/${this.boardKey}/posts`, {
        params: formData
      })
          .then((res) => {
            this.listData.result = res.data.result;
            this.listData.totalCount = res.data.totalCount;
          });
    },
    onFilterUpdated(filters) {
      this.filters.type = filters.type;
      this.filters.q = filters.q;
    },
    onSearch() {
      this.listData.page = 1;
      this.getPostList();
    }
  },
  mounted() {
    this.getPostList();
  },
  watch: {
    boardKey() {
      this.getPostList();
    }
  }
}
</script>