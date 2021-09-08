# Shorthand

一个支持快速简写配置文件的工具。以 yaml 配置为设计目标，也容易应用到其他配置语言。

因为本方案是以 js object 为起点来处理的。

## 动机与应用

1. 本项目的动机和相关思想可参考专门文章 - https://zhuanlan.zhihu.com/p/405026985
2. 本项目作为工具已应用到了核心项目“快葵” - https://quickqui.github.io/main/#/
3. 可通过`./realWorldTestYamls`中的yaml快速体会效果。

## 如何工作

1. （用户自行从 yaml 解析出 object。）
2. 对 object 应用一些“**缩写规则**”，从比较短小（缩写）的结构扩展到比较详细规整的结构。
3. 上一步需要用到的缩写规则，由用户事先定好，见下节详述。

## 缩写规则

### 通用规则属性

`applyTo` - 基本上所有规则里面都有这个属性，它指出了缩写规则将应用于 object 的哪些节点。属性要求一个 string，指向 object 需要应用规则的一部分（以 jsonPath 规则描述。https://github.com/dchester/jsonpath ）。

注意，在`applyTo`中使用`foo`和`foo[*]`是不同的，前者表示规则应用于 foo 属性上，而后者表示应用于 foo 属性的所有子元素上。

`valueHolder` - 很多规则里面有这属性，它指出了需要把节点本身的值下移到它的一个属性时，使用哪个属性名。如果这个属性未指定，规则会拒绝覆盖已有值，很多规则就不能运行下去。

比如有`{a:'foo',a.b:'bar'}` -> `{a:{_$:'foo',b:'bar'}}`，如果不使用 valueHolder，a 节点的值 foo 将被 a.b 覆盖。

这个属性一般不用于最后效果，仅用于处理过程。

### 规则：缩写到父级

在父级缩写子级的内容。类似于 CSS 中的做法，把详细属性综合到它的父级属性中。

```yaml
shortOnParent: [10, true,'test']
#可等效为：
shortOnParent:
  age: 10
  married: true
  name: test
```

当然从父级到子级的猜测需要一个规则，上面例子的规则大致如下：

```javascript
{
 applyTo: "shortOnParent",
 childRules: [
    { key: "name", schema: Joi.string()},
    { key: "age", schema: Joi.number() },
    { key: "married", schema: Joi.boolean() },
 ],
  split: ','
	valueHolder: "_$"
}
```

`split`，用于当父值是一个字符串时，以 split 分割为数组再处理。

规则运行步骤如下 -

1. 当父值是一个字符串时，先按`split`进行分割，变为一个数组再处理。
2. 如果使用`valueHolder`，父值将以valueHolder作为键来读取。
3. 从父值（一个数组）中的取一个值，依次去尝试匹配子属性schema（以 Joi 规则描述，https://joi.dev/api/ ），成功时即确定为该子属性的值，并从父值中排除这个值。同时也排除这个子规则，以防后续再次匹配到这个子规则。如果没有任何schema成功，则整个规则失败。
4. 从父值中取下一个值，重复步骤3，直至所有父值处理完毕。

以上步骤意味着：

1. 子属性规则（childRules） 的顺序是有意义的，先定义的规则有较高优先级。
2. 一个父值只会被匹配到最高优先级的子规则，如果一个匹配也没有，表示父值中有冗余，整个规则会失败。
3. 有些子规则可能不会被匹配到任何父值，可能是父值不够。
4. 上述2、3条说明父值只能少，不能多。
5. 任何子规则，最多被匹配一次。

#### //TODO

[ ] 支持在子属性匹配中的灵活性和容错性，比如父级值列中多出或少了值如何处理？

### 规则：复杂 Key

以复杂的 Key 描述多级嵌套结构。类似于 lodash 中 get/set 所支持的 path 格式。

```yaml
dotAsNest:
  first:
    bar: 1
  first.kaka: 2
  first.hala: bar
#可等效为：
dotAsNest:
  first:
    kaka: 2
    hala: bar
    bar: 1
```

改写规则如下：

```javascript
{ applyTo: "dotAsNest", split: "." , valueHolder: "_$"}
```

`split`是寻找此种”复杂 Key“的依据，如果如上例，使用‘`.`’，则可以实现类似 lodash set 的键定义效果，如果使用‘`-`’，则实现类似于 CSS风格的键定义效果。如果使用‘`/`’，则实现类似XPath\JsonPath风格的键定义效果。

### 规则：字典数组

以 key-value 的形式描述带 id/name 等属性的数组项。

```yaml
mapToArray:
  foo:
    id: 1
    age: 18
  bar:
    id: 2
    age: 25
#可等效为
mapToArray:
  - name: foo
    id: 1
    age: 18
  - name: bar
    id: 2
    age: 25
```

改写规则如下：

```javascript
{ applyTo: "mapToArray", keyPropertyName: "name" , valueHolder: "_$"}
```

## 如何使用

```shell
npm i @nielinjie/shorthand
```

使用方式类似于 -

```javascript
const r = new DotAsNestRule("people", ".");
const r2 = new MapToArrayRule("people", "name");
expect(obj).not.toBeNull;
const re = r.add(r2).run(obj);
const reToo = chain(r, r2).run(obj);
expect(reToo).toEqual(re); // chain等效于多个add连续使用。
expect(re[0]).toEqual(resultO);
```

详情见源代码中的`./src/shorthand.test.ts`。



## 附赠

一个简单的 builder dsl，😊，类似于 -

```javascript
applyTo("foo").dotAsNest().add().mapToArray().build();
```

详情可见`./src/dsl.test.ts`
