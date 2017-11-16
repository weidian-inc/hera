<template>
  <div>
    <app-header></app-header>
    <article class="app-content-container">
      <app-content></app-content>
    </article>
    <footer><a href="https://github.com/wdfe">@wdfe</a> 北京口袋时尚科技有限公司</footer>
  </div>
</template>

<script>
import AppHeader from './App/AppHeader.vue';
import AppContent from './App/AppContent.vue';

export default {
  components: {
    AppHeader,
    AppContent,
  },
};
</script>
<style lang="sass">
body {
  color: #4c4c4c;
  font-family: Helvetica,sans-serif;

  footer {
    margin: 30px auto 30px;
    text-align: center;
    font-size: 12px;
    color: #404040;
  }

  pre {
    margin-top: 10px;
  }

  code {
    display: inline-block;
    margin: 1px 0;
    max-width: 100%;
    line-height: 24px;
    background-color: #f5f5f5;
    padding: 0 6px;
    color: #54B1FB;
  }

  .app-content-container {

    &>div:not(.index-container) {
      display: flex;
      margin: 40px auto 0;
      width: 82.5%;
      min-width: 1200px;
      min-height: 1255px;
      max-width: 1600px;
      overflow: hidden;

      &.resources-container {
        min-height: 0;
      }
    }
  }
}
</style>
