<template>
  <div :class="`${article}-container markdown`" v-html="content">
  </div>
</template>

<script>
/*global hljs*/

// quickstart
// import Quickstart from '../../../../zh-cn/Quickstart/Quickstart.md';
import QuickstartAndroidMac from '../../../../zh-cn/Quickstart/Android/macOS.md';
import QuickstartIOSMac from '../../../../zh-cn/Quickstart/iOS/macOS.md';
import QuickstartWeb from '../../../../zh-cn/Quickstart/Web/all.md';
import QuickstartNotSupport from './NotSupport.md';

// android
import AndroidImplDetail from '../../../../zh-cn/Android/impl-detail.md';
import AndroidHowToImport from '../../../../zh-cn/Android/HowToImport.md';
import AndroidEnvSetup from '../../../../zh-cn/Android/env-setup.md';

// ios
import IOSRealDevice from '../../../../zh-cn/iOS/real-device.md';
import IOSHowToImport from '../../../../zh-cn/iOS/HowToImport.md';
import IOSImplDetail from '../../../../zh-cn/iOS/impl-detail.md';

//Others
import APIList from '../../../../zh-cn/Others/API.md';
import APIExtend from '../../../../zh-cn/Others/API-Extend.md';
import HavaAAPP from '../../../../zh-cn/Others/HavaAWXAPP.md'

import { highlightInit } from '../../util/utils.js';

const mdList = {
  // ['Quickstart'.toLowerCase()]: Quickstart,
  'basic-quick-macos-ios': QuickstartIOSMac,
  'basic-quick-linux-ios': QuickstartNotSupport,
  'basic-quick-windows-ios': QuickstartNotSupport,
  'basic-quick-macos-android': QuickstartAndroidMac,
  'basic-quick-linux-android': QuickstartAndroidMac,
  'basic-quick-windows-android': QuickstartAndroidMac,
  'basic-quick-macos-web': QuickstartWeb,
  'basic-quick-linux-web': QuickstartWeb,
  'basic-quick-windows-web': QuickstartWeb,
  'andorid-impl-detail': AndroidImplDetail,
  'andorid-how-to-import': AndroidHowToImport,
  'andorid-env-setup': AndroidEnvSetup,
  'ios-how-to-import': IOSHowToImport,
  'ios-real-device': IOSRealDevice,
  'ios-impl-detail': IOSImplDetail,
  'api-list': APIList,
  'api-extend': APIExtend,
  'hava-a-wxapp': HavaAAPP
};

export default {
  name: 'Markdown',
  props: {
    article: {
      type: String,
    },
  },
  data() {
    return {
      content: '',
    };
  },
  mounted() {
    this.render();
  },
  watch: {
    article() {
      this.render();
    },
  },

  methods: {
    render() {
      const article = mdList[this.article];
      if (article == null) {
        console.error(`Error rendering ${this.article}`);
      } else {
        this.content = article;
        this.$nextTick(() => {
          highlightInit(hljs);
        });
      }
    },
  },
};
</script>

<style lang="sass">
.markdown {

  a {
    color: #cc5b5b;
  }

  h1 {
    font-size: 20px;
    line-height: 30px;
    font-weight: bold;
    color: #222;
  }

  h2 {
    margin-top: 50px;
    font-size: 16px;
    line-height: 24px;
    color: #222;
    font-weight: bold;
  }

  p {
    margin-top: 10px;
    color: #737373;

    &+p {
      margin-top: 5px;
    }
  }

  ul,ol {
    margin-top: 10px;
  }

  li {
    list-style-type: circle;
    a {
      color: #737373;
    }
  }

  img {
    max-width: 100%;
  }

  blockquote {
    border-left: 5px solid #80B0F8;
    padding-left: 5px;
    background-color: #F5F5F5;
  }

  pre {
    margin-top: 10px;
    border-left: 5px solid #EADBD9;
    background-color: #F5F5F5;
    overflow-x: auto;
  }

  code {

  }
}
</style>
