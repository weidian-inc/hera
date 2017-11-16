<template>
  <keep-alive>
    <router-view></router-view>
  </keep-alive>
</template>

<script>
export default {
  name: 'AppContent'
}
</script>

<style lang="sass">
.sidebar {
  flex-shrink: 0;
  padding-top: 23px;
  margin-right: 20px;
  font-size: 14px;
  background-color: #FFF;
  width: 180px;

  .sidebar-item-group {
    line-height: 36px;
    color: #4c4c4c;

    .sidebar-item-group-title {
      padding-left: 30px;

      &.bold {
        font-weight: bold;
      }
    }
    .sidebar-item {
      padding-left: 40px;
    }
    .active,     {
      background: #3399ff;
      a {
        color: #fff;
      }
    }

    .router-link-active {
      color: #57B2F8;
    }

    a {
      color: #737373;
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}

aside+content {
  flex: 1;
  width: 0;
  background-color: #FFF;

  table {
    margin-top: 10px;
    margin-bottom: 20px;
    width: 100%;
    font-size: 12px;
    line-height: 16px;
    border-collapse: collapse;
    border-spacing: 0;
    color: #656B78;

    th,td {
      border: 1px solid #e8e8e8;
      padding: 10px 12px;
    }
    th {
      background-color: #f5f5f5;
    }
  }

  .hljs {
    background-color: #f5f5f5;
  }
  .hljs-type, .hljs-string, .hljs-number, .hljs-selector-id, .hljs-selector-class, .hljs-quote, .hljs-template-tag, .hljs-deletion {
    color: #EF6925;
  }
  .hljs-keyword, .hljs-attribute, .hljs-selector-tag, .hljs-meta-keyword, .hljs-doctag, .hljs-name {
    color: #AA2E75;
  }

  &>div {
    padding: 40px;
    font-size: 14px;
    line-height: 22px;
    color: #404040;

    &.resources-wrap {
      padding-bottom: 100px;
    }

    .title {
      font-weight: bold;
      color: #222;
    }

    &>.title {
      font-size: 20px;
      line-height: 30px;
    }

    section {
      margin-top: 50px;

      &>.title {
        font-size: 16px;
        line-height: 24px;
        color: #222;
      }

      .desc {
        margin-top: 10px;
        color: #737373;

        &+.desc {
          margin-top: 0;
        }
      }
    }
  }
}
</style>
