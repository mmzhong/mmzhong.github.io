---
layout: post
title: TypeScript 类类型
tags: typescript,handbook,class
desc: "TypeScript 快速手册：类类型"
---

ES6 开始支持的 `class`，让 JS 开发者可以更直观的进行 OOP 开发，而不必再使用基于函数和原型链的别扭写法。

## 语法

```ts
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  hello() {
    return `Hello, ${this.greeting}`;
  }
}
let greeter = new Greeter('world');
```

## 继承

使用 `extends` 来继承已存在的类，以创建新类。

```ts
class Animal {
  move(distanceInMeters: number = 0) {
    console.log(`Animal moved ${distanceInMeters}m.`);
  }
}
class Dog extends Animal {
  bark() {
    console.log('Woof! Woof!');
  }
}
```

其中，`Animal` 称为**基类**，`Dog` 称为派生（Derived）类。由于 `Dog` 继承自 `Animal` ，所以 `Animal` 是 `Dog` 的**父类**，`Dog` 是 `Animal` 的**子类**。子类会继承父类的所有属性（私有属性和方法除外，下文会深入说明）。

```ts
class Animal {
  name: string;
  constructor(theName: string) {
    this.name = theName;
  }
  move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}

class Snake extends Animal {
  constructor(name: string) {
    super(name);
  }
  move(distanceInMeters = 5) {
    console.log("Slithering...");
    super.move(distanceInMeters);
  }
}
```

规则：

* 如果子类包含构造函数，那么构造函数内必须先调用 `super()` 来初始化父类的构造函数，否则不能使用 `this`
* 子类方法会覆盖父类的同名方法，称为**重写**（Override）

## 修饰符（Modifiers）

修饰符用来控制对属性和方法的**访问权限**，包含 `public`、`private` 和 `protected` 。

`public` 是**默认**的修饰符，表示**访问无门槛**。没有显式指明修饰符时使用的修饰符就是 `public` 。

`private` 表示仅当前**类内部**能访问，其子类都不能访问。这也就是为什么子类无法继承父类的私有成员。

`protected` 与 `private` 类似，但更开放些，它还**允许在子类内部访问**。如果声明一个受保护的构造函数，那么该类可以被继承，但**只能**在其子类中被实例化。

**注意**：TS 的类型检查是基于类型结构的。当比较两种类型是否兼容时，只有他们两的成员类型兼容，那么就认定为这两种类型兼容。但是，当类型包含 `private` 和 `protected` 成员时，TS 会采取特殊的兼容比对规则。此时，只有来自**相同声明**才会被认为是兼容的。

```ts
class Animal {
  private name: string;
  constructor(theName: string) { this.name = theName; }
}
class Rhino extends Animal {
  constructor() { super("Rhino"); }
}
class Employee {
  private name: string;
  constructor(theName: string) { this.name = theName; }
}
```

虽然 `Animal` 和 `Employee` 具有相同的类型结构，但是 `private name: string` 并不是同一个声明。而 `Rhino` 和 `Animal` 则是类型兼容的，因为 `Rhino` 继承自 `Animal` ， `private name: string` 属于同一个声明。

还有一个 `readonly` 修饰符，只能用于类属性。只读属性只能在被声明或者构造函数中被初始化，然后就再也不能修改。

## 参数属性（Parameter properties）

当构造函数的**参数被修饰符（`public`、`private` 、 `protected` 和 `readonly`）修饰**时，该参数可自动转变为类属性。这种简便的做法可以省去不少模板化代码。

```ts
class Octopus {
  constructor(readonly name: string) {
    console.log(this.name);
  }
}
// equals to
class Octopus {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
    console.log(this.name);
  }
}
```

## 访问器（Accessors）

TS 也支持 getter/setter ，这样我们可以更加细粒度的控制对对象成员访问权限，比如提供了正确的密码才能设置或获取值。

使用访问器需要注意以下 2 点：

* 编译输出必须为 **ES5 及以上**，ES3 及以下是不支持的
* 只有 getter 没有 setter 的属性自动推断为**只读属性**

## 静态成员

实例成员只有在类实例化后才能使用，静态成员则在类上可以直接使用，无需实例化。静态成员使用修饰符 `static` 声明。

## 抽象类

抽象类是专门用来被派生的，它们不能直接被实例化。使用 `abstract` 来声明抽象类和抽象方法。抽象方法不能包含实现，必须由子类来实现。

抽象类和接口有类似的语法，不同的是，抽象类可以包含部分成员实现。

```ts
abstract class Department {
  constructor(public name: string) {}
  printName(): void {
    console.log(`Department name: ${this.name}`);
  }
  abstract printMeeting(): void;
}
```

## 高级用法

### 构造函数

当声明一个类时，实际上同时声明了两种类型，包括：

* 类实例类型，`let greeter: Greeter` 表示 `greeter` 是 `Greeter` 实例类型
* 构造函数类型，即 `Greeter` 本身

构造函数类型包含类的所有静态成员。使用 `typeof` 获取类的构造函数类型，这样就可以跟类实例类型区分开来。

```ts
let greeter: Greeter = new Greeter();
let greeterMaker: typeof Greeter = Greeter;
```

### 类作为接口

能使用接口的地方也可以使用类，例如接口也可以 `extends` 类。

```ts
class Point {
  x: number;
  y: number;
}
interface Point3d extends Point {
  z: number;
}
```