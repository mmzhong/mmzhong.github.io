---
layout: post
title: TypeScript 装饰器
tags: typescript,decorator
desc: "TypeScript 快速手册：装饰器"
---

**装饰器**（Decorator）提供了一种注解或者修改类及其成员的方法。
现阶段，装饰器还只是个实验功能，未来可能被移除，请谨慎使用。

## 启用装饰器功能

1. 命令行参数： `--experimentalDecorators`
2. `tsconfig.json` 中的 `experimentalDecorators` 属性

## 装饰器

装饰器是一种特殊的声明，可以附加在类声明、成员、访问器、属性和参数上。
它的语法格式为 `@expression` ，其中 `expression` 必须是一个函数，该函数会在运行时调用。
例如 `@sealed` 的函数实现 `sealed` 长成下面的样子：

```ts
function sealed(target) {
  // do something with 'target' ...
}
```

> ES6 中，装饰器只能用于类和类方法，但是 TS 中，则可以用于更多成员中。

### 装饰器工厂

如果想定制装饰器，那么可以定义一个**装饰器工厂**（Decorator Factory），它可以让装饰器函数获得更多参数。

装饰器工厂一般使用如下写法：

```ts
function color(value: string) {
  return function(target) {
    // do something with 'target' and 'value' ...
  }
}
```

### 装饰器组合

也可以把多个装饰器应用于单个声明，称为**装饰器组合**（Decorator Composition），有两种实现方式：

* 单行

```
@f @g x
```

* 多行

```
@f
@g
x
```

当多个装饰器应用于单个声明时，它们的执行顺序如下：

1. 每个装饰器函数表达式**从上往下**执行（top-to-bottom）
2. 每个函数表达式返回值**从下往上**执行（bottom-to-top）

例如：

```ts
function f() {
  console.log("f(): evaluated");
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("f(): called");
  }
}
function g() {
  console.log("g(): evaluated");
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("g(): called");
  }
}
class C {
  @f()
  @g()
  method() {}
}
```

打印结果为：

```
f(): evaluated
g(): evaluated
g(): called
f(): called
```

### 装饰器执行顺序

### 类装饰器

类装饰器应用于类的构造函数，可以用来观察、修改或替换类的定义。

类装饰器的表达式会在运行时作为函数来调用，其唯一的参数为该类的构造函数。

如果类装饰器的返回值不为空，那么这个返回值会替换原类，返回值必须能兼容原类类型。
此时，必须由开发者来维护好原型链。

```ts
@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return 'Hello, ' + this.greeting;
  }
}

function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}
```

当 `@sealed` 执行后，它会封印构造函数及其原型。
再看一个重写构造函数的例子：

```ts
function classDecorator<T extends {new(...args: any[]): {}}>(constructor: T) {
  return class extends constructor {
    newProperty = "new property";
    hello = "override";
  }
}
@classDecorator
class Greeter {
  property = "property";
  hello: string;
  constructor(m: string) {
    this.hello = m;
  }
}

console.log(new Greeter("world"));
```

可以看到，上面使用了匿名类来拓展原构造函数，实例化时使用这个匿名类代替原类，所以打印出来的是 `class_1 { property: 'property', hello: 'override', newProperty: 'new property' }` 而不是 `Greeter { property: 'property', hello: 'world' }` 。

### 方法装饰器

方法装饰器作用于方法的**属性描述符**（Property Descriptor）。

该装饰器接受三个参数：

1. 如果是静态方法，那么是类的构造函数；如果是实例方法，那么则是类的原型；
2. 方法名称；
3. 方法的属性描述符；


如果该方法的返回值不为空，那么返回值会被用作新的属性描述符。

> 如果目标代码低于 ES5 ，那么第三个参数为 `undefined` ，且该方法的返回值也会被忽略

```ts
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}

function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable;
  }
}
```

上面的例子中，装饰器并没有返回新值，而是直接修改属性描述符。

### 访问器装饰器

访问器装饰器（Accessor Decorator）也是作用于属性描述符。

该装饰器也接受三个参数，与方法装饰器一致，用法也一致。

不过要注意的是，TS 不允许对同一个属性的 getter 和 setter 同时使用装饰器。
同一个访问器属性的所有装饰器必须应用于最先出现的访问器上。
这是因为装饰器并不是针对访问器的，而是针对属性的，getter 和 setter 属于同一个属性，一个属性只有一个属性描述符。

```ts
class Point {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @configurable(false)
  get x() { return this._x; }

  @configurable(false)
  get y() { return this._y; }
}

function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}
```

### 属性装饰器

**属性装饰器**（Property Decorator）接受两个参数：

1. 如果是静态方法，那么是类的构造函数；如果是实例方法，那么则是类原型；
2. 方法名称；

> 属性装饰器并没有提供属性描述符这个参数，这是由属性装饰器在 TS 中的初始化方式决定的。
> 目前，当我们定义一个原型成员时，并没有一个机制来描述实例属性，因此也没有办法观察或修改属性的初始化方法。返回值也是被忽略的。
> 因此，属性装饰器仅能用来观察一个给定的属性名已经被声明在一个类中。

```ts
class Greeter {
  @format("Hello, %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    let formatString = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
```

装饰器的实现如下：

```ts
import "reflect-metadata";

const formatMetadataKey = Symbol("format");

function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}

function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
```

这里引入了额外的工具 `reflect-metadata` 来实现装饰器的功能。
`Reflect.metadata` 相当于一个存储器，用来存储所修饰的目标属性值。

### 参数装饰器


**参数装饰器**（Parameter Decorator）通常不能单独使用，需要配合方法装饰器一起使用，主要用来对参数进行校验。

它接受三个个参数：

1. 如果是静态方法，那么是类的构造函数；如果是实例方法，那么则是类原型；
2. 方法名称；
3. 参数位置；

参数装饰器的返回值是会被忽略的。

```ts
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  @validate
  greet(@required name: string) {
    return "Hello " + name + ", " + this.greeting;
  }
}
```

装饰器的实现如下：

```ts
import "reflect-metadata";

const requiredMetadataKey = Symbol("required");

function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value;
  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }

    return method.apply(this, arguments);
  }
}
```

`@required` 装饰器新增了一个元数据实体，来标记当前参数是必选的。
然后， 在 `@validate` 装饰器中对方法的参数进行校验。

### 元数据

上文中使用的 `reflect-metadata` 库会填充一些实验性质的元数据接口。
该库目前还不是 ECMAScript 标准的一部分，但是，一旦装饰器称为标准，该库实现的拓展就会被提议采纳。

TS 提供了实验性质的支持，用来在使用了装饰器的声明上触发特定的元数据类型。
为了开启这个实验功能，可以使用下面两个办法：

1. 命令行参数： `--emitDecoratorMetadata`
2. `tsconfig.json` 中的 `emitDecoratorMetadata` 编译属性

开启后，只要引入 `reflect-metadata` 库，额外的设计时（Design-time）类型信息就会暴露给运行时。
设计时类似于运行时的概念，但是是在不同的阶段，设计时是编码阶段。

以下例来说明：

```ts
import "reflect-metadata";

class Point {
  x: number;
  y: number;
}

class Line {
  private _p0: Point;
  private _p1: Point;

  @validate
  set p0(value: Point) { this._p0 = value; }
  get p0() { return this._p0; }

  @validate
  set p1(value: Point) { this._p1 = value; }
  get p1() { return this._p1; }
}

function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
  let set = descriptor.set;
  descriptor.set = function (value: T) {
    let type = Reflect.getMetadata("design:type", target, propertyKey);
    if (!(value instanceof type)) {
      throw new TypeError("Invalid type.");
    }
    set(value);
  }
}
```

编译器会使用 `Reflect.metadata` 装饰器注入设计时类型信息，使得运行时可以通过 `Reflect.getMetadata()` 来获取类型信息。
上面的代码与下面的代码是等效的，只不过是编译器帮我们写了 `@Reflect.metadata` 装饰器而已：

```ts
class Line {
  private _p0: Point;
  private _p1: Point;

  @validate
  @Reflect.metadata("design:type", Point)
  set p0(value: Point) { this._p0 = value; }
  get p0() { return this._p0; }

  @validate
  @Reflect.metadata("design:type", Point)
  set p1(value: Point) { this._p1 = value; }
  get p1() { return this._p1; }
}
```
