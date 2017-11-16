<template>
  <div class="index-container">
    <section class="banner">
      <content class="particles">
        <div class="mask" id="particles-js"></div>
        <p class="title">全平台小程序框架，助力移动开发</p>
        <p class="subtitle">小程序的能力，你的平台也可以拥有</p>
        <div class="button-group">
          <!-- <router-link to="/basics/quickstart" class="button-start">快速开始</router-link> -->
          <router-link to="/basics/quickstart" class="button-doc">查看文档</router-link>
          <a href="/basics/quickstart" class="button-demo">查看文档</a>
        </div>
      </content>
    </section>
    <section class='feature'>
      <content>
        <div class="feature-article">
          <p class="title">一套代码  处处运行</p>
          <p class="subtitle">Android、iOS、H5以及微信小程序，是现在移动端最为流行的移动端平台，现在你可以使用小程序的语法来编写这些平台的应用。</p>
        </div>
        <img src="../../assets/images/index-kit.png">
      </content>
    </section>
    <section class='feature'>
      <content>
        <img src="../../assets/images/index-powerful.png">
        <div class="feature-article">
          <p class="title">引入简单  拓展性高</p>
          <p class="subtitle">客户端功能已集成为 SDK ，只需几步就可轻松集成。想要根据自己的业务拓展功能？没问题，方便的拓展机制让你的小程序具有无限可能。</p>
        </div>
      </content>
    </section>
    <section class='feature'>
      <content>
        <div class="feature-article">
          <p class="title">极速加载  体验流畅</p>
          <p class="subtitle">所有组件和 API 内置在客户端中，每个页面只包含核心业务逻辑，在高速加载的同时兼具动态更新的能力。由于提供了丰富的客户端功能，你开发的应用将拥有流畅的使用体验。</p>
        </div>
        <img src="../../assets/images/index-lightweight.png">
      </content>
    </section>
    <!-- <section class='feature'>
      <content>
        <img src="../../assets/images/index-down.png">
        <div class="feature-article">
          <p class="title">拓展性</p>
          <p class="subtitle">丰富的素材资源，包括控件设计的规范、产品设计过程中使用到的中英文字体、IconFont 字体文件等，我们会持续提供更多优质资源的下载。</p>
        </div>
      </content>
    </section> -->
  </div>
</template>

<script>
import particlesJS from '../../assets/js/particles/particles.js'
import option from '../../assets/js/particles/particles.json'

export default {
  name: 'Index',
  mounted() {
    particlesJS('particles-js', option)
  }
}
</script>
<style lang="sass">
.index-container {
  margin: 0!important;
  width: 100%!important;

  section {
    width: 100%;

    content {
      display: flex;
      align-items: center;
      margin: 0 auto;
      width: 82.5%;
      min-width: 1200px;
      max-width: 1600px;

      &.particles {
        position: relative;
        height: 100%;

        .mask {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
      }
    }

    &.banner {
      height: 460px;
      background-color: #222;

      content {
        flex-direction: column;

        .title {
          margin-top: 132px;
          font-size: 48px;
          color: #fff;
          letter-spacing: 0;
          line-height: 67px;
          z-index: 1;
          text-align: center;
        }
        .subtitle {
          font-size: 20px;
          color: #fff;
          letter-spacing: 0;
          line-height: 28px;
          z-index: 1;
          text-align: center;
        }
        .button-group {
          margin-top: 66px;
          z-index: 1;

          a {
            display: inline-block;
            margin-right: 10px;
            width: 180px;
            height: 60px;
            text-align: center;
            line-height: 60px;
            color: #fff;
            border: 1px solid #3399ff;
            border-radius: 4px;
            font-size: 20px;

            &.button-start {
              background-color: #3399ff;
            }
          }
          .button-demo {
            display: none;
          }
        }
      }
    }

    &.feature {
      height: 413px;
      background-color: #FFF;

      content {
        height: 100%;
        justify-content: space-between;
        align-items: center;

        .feature-article {
          width: 530px;

          .title {
            font-size: 20px;
            font-weight: bolder;
            line-height: 24px;
            color: #222;
          }
          .subtitle {
            margin-top: 10px;
            font-size: 16px;
            color: #737373;
            line-height: 24px;
          }
        }
        img {
          height: 274px;
        }
      }

      &:nth-child(even) {
        content {
          img {
            margin-left: 50px;
          }
        }
      }

      &:nth-child(odd) {
        content {
          img {
            margin-right: 50px;
          }
        }
      }
    }
  }
}

@media (max-width: 1400px) {
  .index-container {
    section {
      content {
        margin: 0 100px;
        min-width: 0;
        width: auto;
      }
    }
  }
}

@media (max-width: 600px) {
  .index-container {
    section {
      content {
        min-width: 0;
      }

      &.banner {
        .particles {
          width: 100%;
          margin: 0;

          .title {
            margin: 80px 20px 0;
            font-size: 40px;
            line-height: 50px;
            text-align: center;
          }
          .subtitle {
            margin: 30px 20px 0;
            text-align: center;
            font-size: 18px;
            line-height: 24px;
          }
          .button-group {
            margin-top: 55px;

            .button-doc {
              display: none;
            }
            .button-start {
              display: none;
            }
            .button-demo {
              display: inline-block;
            }
          }
        }
      }

      &.feature {
        height: auto;

        &:last-child {

          content {
            border-bottom: none;
          }
        }

        content {
          margin: 0 8%;
          width: auto;
          height: auto;
          box-sizing: border-box;
          flex-direction: column;
          border-bottom: 1px solid #dcdcdc;

          .feature-article {
            width: 100%;

            .title {
              text-align: center;
              font-size: 24px;
            }

            .subtitle {
              margin-top: 3vw;
              margin-bottom: 10.6vw;
              font-size: 18px;
              line-height: 32px;
              color: #737373;
            }
          }

          img {
            margin-top: 12vw;
            margin-bottom: 10vw;
            height: 30vw;
          }
        }

        &:nth-child(even) {
          content {
            img {
              margin-left: 0;
              order: -1;
            }
          }
        }

        &:nth-child(odd) {
          content {
            img {
              margin-right: 0;
            }
          }
        }
      }
    }
  }
}
</style>
