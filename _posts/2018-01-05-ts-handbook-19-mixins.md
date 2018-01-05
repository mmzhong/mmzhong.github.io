---
layout: post
title: TypeScript 混合
tags: typescript
desc: "TypeScript 快速手册：混合"
---

典型的 OO 语言，支持一个类同时继承多个类。
但是 ES6 中，一个类确只能继承一个类。
在 TS 中，可以使用另一种方式---**混合**来实现类似的**代码复用**功能。

注意，继承和混合都是代码复用的方法。

本文以举例的方式来说明如何在 TS 中使用混合。

## 例子

```ts
// Disposable Mixin
class Disposable {
  isDisposed: boolean;
  dispose() {
    this.isDisposed = true;
  }
}

// Activatable Mixin
class Activatable {
  isActive: boolean;
  activate() {
    this.isActive = true;
  }
  deactivate() {
    this.isActive = false;
  }
}

class SmartObject implements Disposable, Activatable {
  constructor() {
    setInterval(() => console.log(this.isActive + " : " + this.isDisposed), 500);
  }
  interact() {
    this.activate();
  }
  // Disposable
  isDisposed: boolean = false;
  dispose: () => void;
  // Activatable
  isActive: boolean = false;
  activate: () => void;
  deactivate: () => void;
}

applyMixins(SmartObject, [Disposable, Activatable]);

let smartObj = new SmartObject();
setTimeout(() => smartObj.interact(), 1000);

////////////////////////////////////////
// In your runtime library somewhere
////////////////////////////////////////

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}
```

## 分析

首先，例子中定义了两个待复用的类： `Disposable` 和 `Activatable` ，也即混合类。

然后，声明了一个 `SmartObject` 类来**实现** `Disposable` 和 `Activatable` 接口。
注意，这里用的是 `implements` 而不是 `extends` ，因为 `class SmartObject extends Disposable, Activatable {}` 是不符合语法的。
根据前面的文章可以知道，类也可以做为接口来使用，而且可以同时实现多个接口，所以这里 `SmartObject` 是实现了两个接口，而不是继承了两个父类。
既然是实现接口，那么类中就必须提供接口的实现。于是，就有以下这部分：

```ts
// Disposable
isDisposed: boolean = false;
dispose: () => void;
// Activatable
isActive: boolean = false;
activate: () => void;
deactivate: () => void;
```

这要就能“骗过”编译器，让它以为我们真的实现了接口。

紧接着，我们再把**真实**的接口实现混合到目标类中，即拷贝属性：

```ts
applyMixins(SmartObject, [Disposable, Activatable]);
```

这个方法会在运行时把混合类上的所有成员都拷贝到目标类上，实现了真正的混合。
因为混合依赖 `applyMixins()` ，所以必须确保运行时存在这个方法。
