<template>
  <div class="usagesidebar-container">
    <aside class="usagesidebar-sidebar sidebar">
      <div class="sidebar-item-group">
        <div class="sidebar-item-group-title bold">基础</div>
        <template v-for="item in basics">
          <div class="sidebar-item" :class="{'active': active === item.en}" :key="item.en">
            <router-link :to="`/basics/${item.en.toLowerCase()}`">{{ item.zh }}</router-link>
          </div>
        </template>
      </div>
      <div class="sidebar-item-group">
        <div class="sidebar-item-group-title bold">Android</div>
        <template v-for="item in android">
          <div class="sidebar-item" :class="{'active': active === item.en}" :key="item.en">
            <router-link :to="`/android/${item.en.toLowerCase()}`">{{ item.zh }}</router-link>
          </div>
        </template>
      </div>
      <div class="sidebar-item-group">
        <div class="sidebar-item-group-title bold">iOS</div>
        <template v-for="item in ios">
          <div class="sidebar-item" :class="{'active': active === item.en}" :key="item.en">
            <router-link :to="`/ios/${item.en.toLowerCase()}`">{{ item.zh }}</router-link>
          </div>
        </template>
      </div>
      <div class="sidebar-item-group">
        <div class="sidebar-item-group-title bold">其它</div>
        <template v-for="item in others">
          <div class="sidebar-item" :class="{'active': active === item.en}" :key="item.en">
            <router-link :to="`/others/${item.en.toLowerCase()}`">{{ item.zh }}</router-link>
          </div>
        </template>
      </div>
    </aside>
    <content>
      <template v-if="this.$route.matched[0].path === '/android/:article'">
        <markdown :article="this.$route.params.article">
        </markdown>
      </template>
      <template v-if="this.$route.matched[0].path === '/others/:article'">
        <markdown :article="this.$route.params.article">
        </markdown>
      </template>
      <template v-if="this.$route.matched[0].path === '/ios/:article'">
        <markdown :article="this.$route.params.article">
        </markdown>
      </template>
      <template v-else>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </template>
    </content>
  </div>
</template>

<script>
import Markdown from '../Components/Markdown.vue';

export default {
  name: 'UsageSidebar',
  components: {
    markdown: Markdown,
  },
  computed: {
    // isPhoneShow() {
    //   return (
    //     this.$route.matched[0].path === '/components/:component' &&
    //     this.$route.path !== '/components/rem'
    //   );
    // },
  },
  data() {
    return {
      active: '',
      basics: [
        {
          en: 'QuickStart',
          zh: '快速开始',
        },
      ],
      android: [
        {
          en: 'andorid-env-setup',
          zh: '环境搭建',
        },
        {
          en: 'andorid-how-to-import',
          zh: '如何接入',
        },
        {
          en: 'andorid-impl-detail',
          zh: '实现原理',
        },
      ],
      ios: [
        {
          en: 'ios-real-device',
          zh: '真机运行',
        },
        {
          en: 'ios-how-to-import',
          zh: '如何接入',
        },
        {
          en: 'ios-impl-detail',
          zh: '实现原理',
        },
      ],
      others: [
        {
          en: 'api-list',
          zh: '支持的 API',
        },
        {
          en: 'api-extend',
          zh: 'API拓展',
        },
        {
          en: 'hava-a-wxapp',
          zh: '使用现有的小程序',
        },
      ],
    };
  },
  watch: {
    $route() {
      this.highlight();
    },
  },
  created() {
    if (
      /AppleWebKit.*Mobile/i.test(navigator.userAgent) ||
      /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(
        navigator.userAgent
      )
    ) {
      window.location.href = 'https://wdfe.github.io/wdui/demo.html';
    }
    this.highlight();
  },
  methods: {
    highlight() {
      console.log(this.$route.name);
      if (this.$route.name !== 'QuickStart') {
        this.active = this.$route.params.article;
      } else {
        this.active = this.$route.name;
      }
    },
  },
};
</script>

<style lang="sass">
  .usagesidebar-container {
    .phone {
      flex: none;
      align-self: stretch;
      position: relative;
      padding-top: 40px;
      padding-right: 40px;
      background-color: #FFF;
      width: 370px; // background-image: url('../../assets/images/iphone.png');
      background-size: 370px;
      background-position: 0 40px;
      background-repeat: no-repeat;

      iframe {
        position: absolute;
        border: none;
        top: 132px;
        left: 24px;
        width: 322px;
        height: 571px;
      }
    }
  }
</style>