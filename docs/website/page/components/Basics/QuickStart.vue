<template>
  <div class="intro-container specification-container">
    <p class="title"> 快速上手 </p>

    <section>
      <p>这篇文章会带领你使用<code>Hera-Cli</code>来创建一个小程序项目，并指导按需搭建相应平台的开发环境，试着点击下面的按钮来选择你想要测试的平台以及你的开发环境</p>
      <p>注意以下平台均运行在本机上，如果想运行在真机，请阅读：<a href="#/android/andorid-real-device">真机调试</a></p>
      <p>
        <span>开发环境:</span>
        <ul class="os-list">
          <li v-for="item in devOSList" :key="item.id"><button v-on:click="changeDevOS(item.id)" :class="{ active: currDevOS == item.id }">{{item.name}}</button></li>
        </ul>
        <span>开发环境: </span>
        <ul class="os-list">
          <li v-for="item in targetOSList" :key="item.id"><button v-on:click="changeTargetOS(item.id)" :class="{ active: currTargetOs == item.id }">{{item.name}}</button></li>
        </ul>
      </p>
    </section>

    <markdown :article="article"></markdown>
  </div>
</template>

<script>
import Markdown from '../Components/Markdown.vue';

export default {
  name: 'GetStarted',
  data() {
    return {
      currDevOS: 'macos',
      currTargetOs: 'web',
      devOSList: [
        {
          id: 'macos',
          name: 'macOS',
        },
        // {
        //   id: 'windows',
        //   name: 'Windows',
        // },
        {
          id: 'linux',
          name: 'Linux',
        },
      ],
      targetOSList: [
        {
          id: 'web',
          name: 'Web',
        },
        {
          id: 'ios',
          name: 'iOS',
        },
        {
          id: 'android',
          name: 'Android',
        },
      ],
    };
  },
  computed: {
    article() {
      return `basic-quick-${this.currDevOS}-${this.currTargetOs}`;
    },
  },
  components: {
    markdown: Markdown,
  },
  methods: {
    changeDevOS(e) {
      this.currDevOS = e;
    },
    changeTargetOS(e) {
      this.currTargetOs = e;
    },
  },
};
</script>

<style lang="sass">
.os-list {
  display: inline-block;
  .active {
    background-color: #3898FC;
    color: #fff;
  }
  li {
    button {

      margin: 3px;
      padding: 6px;
      background-color: #fff;
      border-color: #3898FC;
      border-radius: 5px;

      cursor: pointer;

      color: #3898FC;
      font-size: 18px;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;

      &:focus {
        outline: 0;
      }
    }
    display: inline-block;
  }
}

.intro-container {

  section {
    ol {
      margin-top: 10px;
      letter-spacing: 0;
    }
  }
}

</style>
