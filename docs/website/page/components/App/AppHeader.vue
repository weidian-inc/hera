<template>
  <div class="appheader-container">
    <div class="wrapper">
      <div class="logo-wrap">
        <img class="logo" src="../../assets/images/HERA.png"/>
        <span>小程序SDK</span>
      </div>
      <ul class="nav">
        <li :class="{'active': active === ''}"><router-link to="/">首页</router-link></li>
        <!-- <li :class="{'active': active === '/specifications'}"><router-link to="/specifications/intro">规范</router-link></li> -->
        <li :class="{'active': active !== ''}"><router-link to="/basics/quickstart">文档</router-link></li>
        <!-- <li :class="{'active': active === '/resources'}"><router-link to="/resources">资源</router-link></li> -->
        <li>
          <a href="https://github.com/Weidian-developer/hera">
            <img class="star-badge" src="https://img.shields.io/github/stars/Weidian-developer/hera.svg?style=social&label=Stars">
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      active: ''
    }
  },
  watch: {
    $route() {
      this.highlight()
    }
  },
  created() {
    this.highlight()

  },
  methods: {
    highlight() {
      this.active = this.$route.matched.length !== 0 ? this.$route.matched[0].path : ''
      console.log(this.active)
    }
  }
}
</script>

<style lang="sass">

.appheader-container {
  height: 80px;
  background-color: #222;

  .wrapper {
    display: flex;
    align-items: center;
    margin: 0 auto;
    width: 82.5%;
    // min-width: 1200px;
    max-width: 1600px;
    height: 100%;

    .logo-wrap {
      display: flex;
      align-items: center;

      .logo {
        // width: 90px;
        height: 18px;
      }
      span {
        margin-left: 10px;
        font-size: 12px;
        color: #737373;
      }
    }
    .nav {
      margin-left: 60px;
      display: flex;
      height: 80px;
      font-size: 14px;
      color: #fff;

      li {
        width: 72px;
        height: 80px;
        line-height: 80px;

        a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #fff;
        }

        .star-badge {
          position: relative;
          left: 20px;
        }

        &.active {
            position: relative;

            &::after {
              content: '';
              position: absolute;
              left: 0;
              bottom: 0;
              width: 100%;
              height: 6px;
              background-color: #3399ff;
            }

          a {
            color: #fff;
          }
        }
      }
    }
  }
}

@media (max-width: 600px) {
  .appheader-container {
    .wrapper {
      min-width: 0;
      justify-content: center;

      ul.nav {
        margin-left: 25%;

        li:nth-child(1),
        li:nth-child(2),
        li:nth-child(3),
        li:nth-child(4) {
          display: none;
        }

        li {
          .star-badge {
            left: 0;
          }
        }
      }
    }
  }
}

</style>
