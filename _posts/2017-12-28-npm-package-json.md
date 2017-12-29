---
layout: post
title: NPM package.json 理解
tags: npm,package.json
desc: NPM package.json 理解
---

package.json 是 NPM 包的**配置文件**，记录着包的所有相关信息。

它使用**标准 JSON** 格式，而不是 JS 对象字面量。

本文主要介绍 package.json 各个字段的用途，这些用途有不少都跟 npm 的命令相关。

## 基本字段

### name & version

`name` 表示包名，一个好的包名应该跟包所实现的功能是相匹配的。
npm 使用**包名和包版本号**来唯一识别一个包。包的变动应该通过版本号来体现。

包名的定义必须遵循以下规则：

* 长度**不大于** 214 个字符（含包域名）
* 不能以 `.` 或 `_` 开头
* 新包名不允许使用大写字母（旧版曾可以）
* 不允许包含非 URL 安全的字符，如 `<>`

一些包名建议：

* 不使用与 Node 核心模块同名的包名
* 不出现 `js` 或 `node` 字眼，因为默认就是 js 包
* 不宜太长，但应该能够描述包功能，因为没人愿意 `require` 一个很长的名字
* 检查下 [NPM](https://www.npmjs.com/) 上是否已经存在此包名

包名前面可以加上一个可选的包域名，如 `@mm/mypackage` 。

版本号必须能被 [node-semver](https://github.com/isaacs/node-semver) 正确解析。

### keywords & description

关键字和描述信息用来介绍包的**用途**，便于搜索，它们会出现在 `npm search` 的查询结果中。`keywords` 是个数组。

### homepage & bugs & license

`homepage` 为项目主页地址，方便开发者查看更多相关信息。

`bugs` 告诉用户应该往何处提 BUG 。可以是 URL 或者邮箱地址。

`license` 指明包使用者应遵循的许可证。有以下几种常用情况：

1. 如果是常见的许可证，可直接写许可证名称，如 `{ "license": "MIT" }` ，完整的常用许可证名称列表见 [SPDX license IDs](https://spdx.org/licenses/)。
2. 如果使用多个许可证，可以使用 [SPDX 许可证表达式语法](https://npmjs.com/package/spdx)，如 `{ "license" : "(ISC OR GPL-3.0)" }` 。
3. 如果需要使用自定义许可证，写法为 `{ "license" : "SEE LICENSE IN <filename>" }` ，其中的 `<filename>` 文件必须在包根目录中。
4. 如果不想使用许可证，则应写为 `{ "license": "UNLICENSED" }`

### author & contributors & maintainers

三者用的对象都是 `person` ，`person` 是一个包含 `name` 属性和可选属性 `url`、`email` 的对象，如：

```json
{
  "name" : "Ming Zhong",
  "email" : "mm@g.com",
  "url" : "https://mmzhong.cc/"
}
```

也可以简写为单行字符串表示： `Ming Zhong <mm@g.com> (https://mmzhong.cc/)` 。

注意，author 是单个 `person`， `contributors` 和 `maintainers` 则是一个数组。

## 常用字段

### files

`files` 字段是可选的，它表示安装包时哪些文件要被安装。如果省略，默认把包里所有的文件安装到用户的项目中。

也可以使用 `.npmignore` 来指明不安装的文件，如果没有 `.npmignore` ，但是有 `.gitignore` ，则会使用 `.gitignore` 。

### main

`main` 指明包的入口文件，使用基于模块根目录的相对路径。通常，如果是浏览器端的包，入口文件会是已经打包压缩的文件。

另外，如果用户使用 webpack 或者 rollup 等打包工具，这些打包工具支持使用 `module` 字段。
该字段指向的入口文件一般都是没有打包压缩的文件，用以支持打包工具的 Tree Shaking 功能。

### bin

有很多包都提供命令行命令，这就需要在 `PATH` 中安装可执行命令，在 NPM 中这很容易就能做到。
只需要提供一个 `bin` 字段指向一个包内文件，当使用 NPM 安装时，NPM 会自动创建软链接到该文件。
如果是全局安装，会软链到 `prefix/bin` 目录；如果是本地安装，则是 `./node_modules/.bin` 。
此外，还需要在该文件首行添加 `#!/usr/bin/env node` ，否则不会使用 Node 环境来执行。

命令行命令是什么依赖于 `bin` 字段的写法。
如果是路径写法， 如 `{ "bin": "./path/to/cli.js" }` ，那么命令即为文件名 `cli` ；
如果是对象写法，如 `{ "bin": { "myapp": "./path/to/cli.js" } }`，则命令为对象 key 值 `myapp` 。

### scripts

`scripts` 字段用来定义包生命周期内要用到的运行命令，其 `key` 通常是生命周期事件，可以理解为命令钩子。

包生命周期事件跟很多 npm 支持的命令相关，如 `pack`、`publish`、`install`、`uninstall`、`version`、`test`、`start`、`stop`、`restart` 等，这些命令都有 `pre` 和 `post` 钩子，如 `prepack`。

同时，也支持自定义命令，如 `dev` ，使用 `npm run dev` 即可运行对应的命令。自定义命令也支持 `pre` 和 `post` 钩子。

例如：

```json
{
  "name": "foo",
  "version": "0.0.1",
  "scripts": {
    "preinstall": "echo pre foo",
    "postinstall": "echo post foo",
  }
}
```

那么使用 `npm install foo` 时，会首先输出 "pre foo"，等到安装完成后还会打印 "post foo" 。

#### 环境信息

1. `PATH`

如果依赖某些包的可执行命令，如 `gulp`，那么这些可执行命令会被添加到运行时的 `PATH`，这意味着可以直接使用 `gulp` 命令而无需指明具体路径，如 `{ "scripts": { "build": "gulp build" } }`。

2. `package.json`

`package.json` 中的**字段信息**也会被添加到运行环境，使用 `process.env.npm_package_<field>` 获取，如 `process.env.npm_package_name` 为当前包的包名。对象会被扁平化，如 `process.env.npm_package_scripts_test` 。

3. npm config

npm 的配置信息也会被添加到环境信息，使用 `process.env.npm_config_<field>` 获取。例如： `process.env.npm_config_registry` 为 `'http://npm.example.com/'` 。

4. lifecycle

使用 `process.env.npm_lifecycle_event` 获取当前脚本所处的执行周期。例如：

```json
{
  "scripts": {
    "test": "node test.js"
  }
}
```

那么，运行 `npm test` 时，在 `test.js` 中有 `process.env.npm_lifecycle_event === 'test'` 。


## 依赖字段

### dependencies

依赖字段使用简单的对象来映射包名和版本范围。版本范围是一个以空格分隔的版本字符串描述。

注意，请勿把测试相关和构建相关的依赖写进 `dependencies` ，这些需要写在 `devDependencies` 中。

版本范围描述使用 [semver](https://docs.npmjs.com/misc/semver) 规定的用法，下面列举一些常用的方式：

* `version` 精确匹配 `version` 版本
* `>version` 必须大于 `version` 版本 
* `>=version` 必须大于等于 `version` 版本 
* `<version` 必须小于 `version` 版本 
* `<=version` 必须小于等于 `version` 版本 
* `~version` 修复版本，如 `~1.2.2` 等效于 `>=1.2.2 <1.3.0`
* `^version` 兼容版本，指不修改最左边的非零值的版本，如 `^1.2.2` 等效于 `>=1.2.2 <2.0.0`，`^0.2.2` 等效于 `>=0.2.2 <0.3.0`，`^0.0.2` 等效于 `>=0.0.2 <0.0.3`
* `1.2.x` 等效于 `>=1.2.0 <1.3.0`
* `*` 或者 `""` 匹配任何版本
* `version1 - version2` 等效于 `>=version1 <=version2`
* `range1 || range2` 表示满足 `range1` 或 `range2`
* `tag` 标签为 `tag` 的版本

除了安装来自 NPM 上注册的包，还可以安装其他来源的包，包括：

* `http://...` ：来自指定 URL 的**压缩包**
* `git...` ：来自 Git URL 的包，如 `git+ssh://git@github.com:npm/npm.git#v1.0.27`
* `user/repo` ： 来自 GitHub URL 的包，如 `mochajs/mocha` ，也可以指定分支，如 `user/repo#feature\/branch`
* `path/to/local` ：来自本地的包，本地路径，使用 `npm install -S` 时会把该路径标准化为相对路径

### devDependencies

开发和测试相关的依赖应该写在 `devDependencies` 中。
安装这类依赖是使用 `npm install -D` 会自动保存依赖到该字段。

### peerDependencies

对于多数的插件模块，有时需要表达出它们支持的宿主库版本。比如：

```json
{
  "name": "tea-latte",
  "version": "1.3.5",
  "peerDependencies": {
    "tea": "2.x"
  }
}
```

模块 `tea-latte` 是 `tea` 的一个插件，且它并不依赖 `tea` ，但是它只能运行在 `tea` 的 `2.x` 版本上。
这个时候就称 `tea` 为 `tea-latte` 的 `peerDependencies` 。

`npm` v3 开始，不会再默认安装 `peerDependencies` 依赖，而是会警告说这些依赖没有安装。

### bundledDependencies

`bundledDependencies` 也可写做 `bundleDependencies` 。
当我们需要把包保留在本地或者使其可以仅下载一个包就能安装时，可以把所有依赖的包也打包进当前模块。例如：

```json
{
  "name": "awesome-web-framework",
  "version": "1.0.0",
  "bundledDependencies": [
    "renderized", "super-streams"
  ]
}
```

使用 `npm pack` 命令会产生 awesome-web-framework-1.0.0.tgz 文件，该文件同时包含了 `renderized` 和 `super-streams` 包。
安装时，使用 `npm install awesome-web-framework-1.0.0.tgz` 即可把所有的依赖都一并安装好。

### optionalDependencies

可选依赖意味着当该依赖找不到或者安装失败时，npm 也不会触发错误。
但是，包的开发者需要自己处理可选依赖的缺失情况。

## 环境相关

### engines

指明对**运行环境**的要求。如：

```json
{
  "engines" : { 
    "node" : ">=0.10.3 <0.12",
    "npm" : "~1.0.0",
  }
}
```

如果没有 `engines` 字段，则默认为运行环境是 node ；
如果不指定版本范围，表示适用于所有版本。

### os & cpu

指明适用的系统平台。

`"os": [ "darwin", "linux" ]` 表示只适用于 darwin 和 linux 系统。
也可以使用 `!` 来指定不能适用的平台，如 `"os": [ "!win32" ]` 。使用 `process.platform` 来判断。

`cpu` 与 `os` 类似，指明适用的 cpu 架构，如 `"cpu": [ "x64", "ia32" ]` ，使用 `process.arch` 来判断。 
