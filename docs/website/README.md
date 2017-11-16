# 主页生成器

## 新增文档

### 新增一级主题

- 在 router 中添加新的主题

```js
{
  path: '/others/:article',
  name: 'Others',
  component: UsageSidebar
}
```

- 在 UsageSidebar.vue 中新增 Template

```html
<div class="sidebar-item-group">
  <div class="sidebar-item-group-title bold">其它</div>
  <template v-for="item in others">
    <div class="sidebar-item" :class="{'active': active === item.en}" :key="item.en">
      <router-link :to="`/others/${item.en.toLowerCase()}`">{{ item.zh }}</router-link>
    </div>
  </template>
</div>

<template v-if="this.$route.matched[0].path === '/others/:article'">
  <markdown :article="this.$route.params.article">
  </markdown>
</template>
```

```js
others: [
  {
    en: 'api-list',
    zh: '支持的 API',
  },
],
```

### 在以及主题下添加文档

- 在 Mrakdown.vue 中引入新增的文档

```js
// 1
import APIList from '../../../../zh-cn/Others/API.md';

// 2
const mdList = {
  ...
  'api-list': APIList,
  ...
};
```

- 在 UsageSidebar.vue 中引入

```js
others: [
  {
    en: 'api-list',
    zh: '支持的 API',
  },
],
```
