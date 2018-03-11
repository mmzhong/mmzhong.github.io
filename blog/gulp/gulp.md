---
title: gulp 任务管理工具
createdDate: 2017-12-03
tags: gulp,plugin,stream
desc: gulp 基本原理和使用，及其插件开发介绍
---

## 介绍

gulp 是一个**任务管理工具**，它能让开发者的**工作流**更加**自动化**。

gulp 工作时，待处理的源文件以**流**的形式经过各个任务，任务的返回也是流，使用**管道**连接多个任务。

整个过程大致是：创建源文件流 -> 任务1 -> 任务2 -> ... -> 输出内容到目的文件。

## 安装

### gulp-cli

`gulp-cli` 是 gulp 的命令行工具。
`npm i -g gulp-cli` 全局安装后，即可以在命令行中使用此 `gulp` 命令。

其用法如下：

```bash
gulp [flags] <task> <task> ...
```

`<task>` 是要运行的任务名称，可以指定多个，**并行执行**。
任务名称来自 gulp 的配置文件 gulpfile.js，默认使用当前路径下的 gulpfile.js ，也可以使用 `gulp --gulpfile path/to/gulpfile.js` 指定配置文件。
不指定任务时，默认运行 `default` 任务，如果没有 `default` 任务则报错。

一般都用不上 `[flags]` ，但是以下用法可能有用：

* `gulp --version` ： 查看全局和本地的 gulp 版本
* `gulp --tasks` ： 打印当前 gulpfile.js 中的任务列表及其依赖任务

> `npm 5.2+` 内置了 [npx](https://www.npmjs.com/package/npx) 工具，可以免去全局包的安装麻烦。例如 `npx gulp` 首先检查 `$PATH` 中是否有 `gulp` 命令，然后检查项目本地二进制命令，如果找到就运行命令；如果都没有找到，它会**临时安装**此包然后**一次性执行**，这个安装是临时的，命令结束后立刻被删除，所以本地或者全局都找不到此包。

### gulp

使用 `npm i gulp -D` 安装项目本地模块，从而可以在 gulpfile.js 中使用其接口定义任务。

> 目前稳定版本为 v3.9.1 ，下文内容均基于此版本；如果想尝试 v4.0 版本， 使用 `npm install gulpjs/gulp#4.0` 安装

## API

`gulp` 的 API 设计很简单，只对用户暴露了 4 个接口，包含应文件流创建、任务定义、文件改动监控和文件流输出。基本上回答了从哪里来、到哪里去、要做什么的码生哲学问题。

### `gulp.src(globs[, options])`

该接口使用传入的 `globs` 匹配文件，返回文件流，是任务的起点。`globs` 接受字符串或者字符串数组，指明要创建文件流的文件，使用 `!` 开头的 glob 可以排除文件。

```js
gulp.src(['src/*.js', '!src/b*.js', 'src/bad.js']);
```

上面的例子会匹配中 `src` 路径下的所有 js 文件，排除 `b` 开头的 js 文件，但是不排除 `bad.js` 文件。

`options` 是个可选的对象参数，它会通过 [node-stream](https://github.com/gulpjs/glob-stream) 传递给 [node-glob](https://github.com/isaacs/node-glob) 。除了 `ignore` 选项，gulp 支持所有 node-globe 和 node-stream 支持的选项。此外还新增了一些选项：

`options.buffer`： 默认为 `true`，表示以 `Buffer` 的格式读取文件；设置为 `false` 时，会以文件流的形式读取，这对大文件处理非常有用。

`options.read`： 默认值为 `true`， 设置为 `false` 时，gulp 不会读取文件内容，返回的 `file.contents` 为 `null` 。

`options.base`：文件输出路劲的 `base` ， 默认为 glob 开始前的字符串，如对于 `src/app/**/*.js`，其 `base` 默认为 `src/app` 。

### `gulp.dest(path[, options])`

该接口在管道上创建一个“出水口”，**流过**该“出水口”的流都会**写**到真实文件中。注意，该“出水口”并不是管道的终点，一条管道上可以有多个“出水口”。

`path` 表示文件要写到哪里去，如果使用相对路径，会以 `gulp.src()` 中 `options.base` 为基准。如果路径不存在，会自动创建。
可以是 `String` 或者 返回 [Vinyl File](https://github.com/gulpjs/vinyl) 实例的函数。

`options.cwd`： 设置 `path` 为相对路径是的当前路径；
`options.mode`： 权限设置，默认为 `0777`；

### `gulp.task(name[, deps] [, fn])`

该接口用于定义任务。

`name` 即任务名称，不能包含空格。

`deps` 是字符串数组，表示当前所定义任务的依赖任务，只有这些任务执行完了才会执行当前任务。依赖任务是**同时运行**的，而不是按序执行。

```js
gulp.task('mytask', ['array', 'of', 'task', 'names'], function() {
  // 所有依赖任务执行完成后才运行到此处
});

// 也可以省略 fn，为一系列任务定义一个任务集合名称
gulp.task('build', ['array', 'of', 'task', 'names']);
```

`fn` 是真实任务的定义之处。`fn` 函数接收一个 `done` 回调，用于异步任务中的结束回调。通常的任务定义格式如下：

```js
gulp.task('build', function() {
  // 任务操作
});
```

定义异步任务的三种形式：

* 回调函数

```js
gulp.task('some', function(done) {
  asyncTask(function(err, res) {
    if (err) return done(err);
    gulp.src(res)
      .pipe(minify())
      .pipe(gulp.dest('dist'))
      .on('end', done);
  });
});
```

* 返回虚拟文件流

```js
gulp.task('some', function() {
  return gulp.src(res)
    .pipe(minify())
    .pipe(gulp.dest('dist'))
});
```

* 返回 Promise

```js
const Q = require('q');
gulp.task('some', function() {
  const deferred = Q.defer();

  setTimeout(function() {
    deferred.resolve();
  }, 1);

  return deferred.promise;
});
```

默认情况下，所有任务会以最大的并发量运行，而不会等待某些任务运行完再运行。
如果需要使任务按序运行的话，需要做到以下两点：

* 提示一个任务什么时候结束
* 让一个任务依赖另一个任务

举个栗子，任务 `two` 要在任务 `one` 执行完成后再执行，那么就需要让 gulp 知道 `one` 什么时候结束，并且让 `two` 依赖 `one` 。要想知道 `one` 什么时候结束，就必须使用上面三种异步任务定义方式中的一种。因此，可以这样写：

```js
gulp.task('one', function(done) {
  done(err);
});

gulp.task('two', ['one'], function() {
  // one is done now
})
```

### `gulp.watch(glob [, opts] tasks)`

监听文件变动，然后运行指定任务。其返回值为一个 `EventEmitter` 对象，文件变动时会触发 `change` 事件。

还支持 `gulp.watch(glob [, opts, cb])` 形式。

```js
const watcher = gulp.watch('js/**/*.js', ['uglify', 'reload']);
watcher.on('change', function(event) {
  // event.type 为 added、changed、deleted 或者 renamed
  console.log(`${event.path} was ${event.type}`);
});

gulp.watch('js/**/*.js', function(event) {
  console.log(`${event.path} was ${event.type}`);
});
```

## 插件

插件是对文件流进行处理的主要地方，它的输入是一个 Vinyl File 实例，输出的也是 Vinyl File 实例，对改实例的修改就是对文件的修改。

输出 Vinyl File 实例有两种办法：

* 使用 `transform.push(file)`
* 使用插件的回调函数 `callback(err, file)`

通常可以使用 through2 模块来简化插件：

```js
const through = require('through2');
module.exports = function(pluginOptions) {
  return through.obj(function(file, encoding, callback) {
    // do something with file
    // this 为 Transform 实例
    callback(null, file)
  });
}
```

### 修改文件内容

`through.obj(_transform[, _flush])` 

其中 `_transform(file, encoding, callback)` 主要用于修改文件流，`_flush(callback)` 会在文件流被清空时调用。

在 `_transform` 中通过调用多次 `this.push(file)` 可以**输出多个文件流**。
如果只想输出当前的单个文件流，那就只需要调用 `callback(err, file)` 即可。

一般来说，插件首先需要修改 `file.contents` 然后调用 `callback(null, file)` 或者 `this.push(file)` 。

调用 `callback()` 会告诉流引擎当前流已经处理完了，因此是必须要调用的，否则任务将不会结束，其他文件流也得不到处理。

如果需要修改输出文件的路劲、文件名或者拓展名，可直接修改 `file.path` 或者 `file.extname` 。

`file.contents` 可能有三种形式的内容：

* [Streams](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/dealing-with-streams.md)
* [Buffers](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/using-buffers.md)
* null

其中，`null` 表示内容为空，多用于删除目录等无内容的插件中。
因此，在修改文件内容前往往需要判断内容是哪种形式，以进行不同处理。

> 文件内容中的换行建议使用 `\n` ，更具平台通用性。

另外，`_transform` 函数不需要返回值，其返回值无用途。

## 插件开发实践

### 插件处理流程

`_transform` 和 `_flush` 中都必须调用 `callback()` 才能运行下一个插件的 `_transform` 和 `_flush` ，否则将在此中断流程。

```js
const through = require('through2');
gulp.task('default', () => {
  return gulp.src('src/*.js')
    .pipe(through.obj((file, encoding, cb) => {
      console.log('plugin 1');
      cb(null, file);
    }, function(cb) {
      console.log(1);
      cb();
    }))
    .pipe(through.obj((file, encoding, cb) => {
      console.log('plugin 2');
      cb(null, file);
    }, (cb) => {
      console.log(2)
      cb();
    }))
    .pipe(gulp.dest('_test'))
})
// => plugin 1
// => plugin 2
// => 1
// => 2
```

以上例子如果不调用第一个插件中 `_flush` 的 `cb()` ，那么将只打印 'plugin 1 plugin 2 1'，不会打印 '2'。

### 错误处理

```js
const PluginError = require('gulp-util').PluginError;
const PLUGIN_NAME = 'gulp-example';

module.exports = function() {
  return through.obj(function(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not support'));
    } else if (file.isBuffer()) {
      // do something
      callback(null, file);
    }
  })
}
```

`_transform` 中的 `this` 同时是个 `EventEmitter` 实例，可以触发错误事件。

### 单输入多输出

单输入多输出意味着需要把一个文件拆分成多个文件，或者引入新文件。典型的例子可以参考 [gulp-unzip](https://github.com/inuscript/gulp-unzip) 。

下面的例子将会产生两个文件流，每个文件流将单独经过后续的管道。

```js
module.exports = function() {
  /**
   * @this {Transform}
   */
  const transform = function(file, encoding, callback) {
    const files = splitFile(file);
    this.push(files[0]);
    this.push(files[1]);
    callback(); // 仍然需要调用 callback
  }
  return through.obj(transform);
}
```

### 多输入单输出

`_transform` 中输入的文件流还是每次只有一个，但是可以把这个文件流缓存起来，本次处理不输出文件。等到所有需要合并的文件都缓存好后，在 `_flush(callback)` 中统一输出一个文件。

```js
// file: src/a.js
console.log('a');
```

```js
// file: src/b.js
console.log('b');
```

```js
// file: gulp-concat.js
const path = require('path');
const through = require('through2');

module.exports = function(newFile) {
  const files = []; // 缓存所有文件

  return through.obj(function(file, encoding, callback) {
    // 当前插件不输出文件
    files.push(file);
    callback();
  }, function(callback) {
    if (files.length === 0) {
      return callback();
    }

    const joinedFile = files[0].clone({ contents: false });

    if (joinedFile.isBuffer()) {

      // 重命名文件
      joinedFile.path = path.join(joinedFile.base, newFile);

      // 合并多个文件的内容
      joinedFile.contents = Buffer.concat(files.map(file => file.contents));

      // 输出合并的文件
      this.push(joinedFile);
    }
    callback(); // 不要忘记结束 _flush 以便给其他插件的 _flush 有机会运行
  })
}
```

```js
// file: gulpfile.js
const concat = require('./gulp-concat');
gulp.task('default', function() {
  return gulp.src('src/*.js')
    .pipe(concat('ab.js'))
    .pipe(gulp.dest('dist'))
});
```

```js
// file: dist/ab.js
console.log('a');
console.log('b');
```

完整的例子请参考 [gulp-concat](https://github.com/contra/gulp-concat) 。