---
layout: post
title: HTML5 功能检测方法
date: 2018.03.05
tags: html5,feature,detecting
desc: 如何检测 HTML5 支持的功能
---

所有的 DOM 节点都共同的属性，但是有些节点还会有额外的属性。
在支持 HTML 5 的浏览器中，某些对象就拥有独特的属性。
利用这种属性差异，我们就可以辨别当前浏览器是否支持某种功能。

## 检测方法

检测方法从简单到复杂，总共包含以下四种：

* 检测**全局对象**是否包含特定属性（如 `window`、`navigator`）

```js
function isGeolocationSupport() {
  return !!navigator.geolocation;
}
```
* 创建元素，然后检测该元素是否包含**特定属性**

```js
function isVideoSupport() {
  return !!document.createElement('video').canPlayType;
}
function isCanvasSupport() {
  return !!document.createElement('canvas').getContext;
}
```

* 创建元素，并检测该元素是否包含特定方法，然后检测该方法的**返回值**

```js
function isH264BaselineVideoSupport() {
  if (!isVideoSupport()) {
    return false;
  }
  const v = document.createElement('video');
  return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
}
function isWebglSupport() {
  if (!isCanvasSupport()) {
    return false;
  }
  const c = document.createElement('canvas');
  return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
}
function isWebpSupport() {
  if (!isCanvasSupport()) {
    return false;
  }
  const c = document.createElement('canvas');
  const format = 'image/webp';
  return c.toDataURL(format).indexOf(`data:${format}`) === 0;
}
```

* 创建元素，并把元素的特定属性设置为一个特定值，然后再检测该属性值**是否变化**

```js
function isInputColorSupport() {
  const i = document.createElement('input');
  i.setAttribute('type', 'color');
  return i.type !== 'text';
}
```

> 附： 最常用的 HTML 5 功能检测库 [Modernizr](https://modernizr.com/)，支持 HTML、CSS 和 JS 功能检测
