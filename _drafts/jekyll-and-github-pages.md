---
layout: post
title: GitHub Pages 个人博客搭建
date: 2017-11-26
desc: GitHub Pages 个人博客搭建教程
tags: github-pages,jekyll,blog
---

## GitHub Pages

[GitHub Pages](https://pages.github.com/) 是由 GitHub 提供的简单网站服务，用于建立**个人**或者**项目**的介绍网站。这些网站的域名格式为 `*.github.io` ，其中 * 为 GitHub 用户名或者是项目名称。

GitHub Pages 与 GitHub 深度结合，对 GitHub 仓库内容的修改会自动同步到网站。所以，开发者只需要专注于对 GitHub 仓库的管理。

以本网站为例，它的访问域名为 `mmzhong.github.io` ，对应的 GitHub 仓库为 `https://github.com/mmzhong/mmzhong.github.io.git` 。本网站上托管的所有内容就是该仓库中的所有内容，**访问路径就是仓库中的路径**。

通常我们写博客都不会直接写 HTML ，而是使用 Markdown 。
GitHub Pages 集成了 Jekyll ，这意味着，用户只需要写 Markdown ，GitHub Pages 就会自动把 Markdown 文件转化为对应的博客网页。

创建个人或者项目的 GitHub Pages 是很简单的，官方有很好的[教程](https://pages.github.com/) ，下文主要介绍如何使用 Jekyll 。

## Jekyll

[Jekyll](https://jekyllrb.com/) 是一个**静态网站生成器**，通常用于生成博客网站。它能把不同格式的纯文本（如 Markdown）转化为一个完整的网页。

作为一个静态网站生成器，意味着它没有数据存储功能，我们不能把博客内容、时间、标签等信息存储到数据库。
那么，这些博客的必要数据怎么管理呢？
答案就是**纯文本本身**，比如纯文本文件名命名为 `year-month-day-blog-title.md` ，这样就把博客时间给记录下来了。当然，大多数的数据还是在纯文本内容自身，比如文本开头使用特定的格式书写博客布局、标题、标签等等。

### 使用

`gem` 是 Ruby 的包管理器，与 NodeJs 中的 npm 类似。

国内源设置。

```bash
# 安装
gem install jekyll bundler

# 构建
jekyll build

# 构建并启动服务
jekyll serve
```

### 主题

添加主题依赖

```yml
# Gemfile
source 'https://rubygems.org'
gem "github-pages", group: :jekyll_plugins
```

```bash
# 修改 Gemfile ，然后安装依赖
gem install 

# 启动本地的 jekyll
bundle exec jekyll serve
```

### 项目结构

