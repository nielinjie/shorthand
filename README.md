# Shorthand

一个支持快速简写配置文件的工具。以 yaml 配置为设计目标，也容易应用到其他配置语言。

因为本方案是以 js object 为起点来处理的。

## 如何工作

1. （用户自行从 yaml 解析出 object。）
2. 对 object 应用一些改写规则，从比较短小（缩写）的结构扩展到比较详细规整的结构。
3. 上一步需要用到的规则，由用户事先定好，见下节详述。

## 缩写规则

### （通用规则属性）

`applyTo` - 基本上所有规则里面都有这个属性，它指出了缩写规则将应用于 object 的哪部分。属性要求一个 string，指向object需要应用规则的一部分（以 jsonPath 规则描述。https://github.com/dchester/jsonpath）。

注意，在`applyTo`中使用`foo`和`foo[*]`是不同的，前者表示规则应用于 foo 属性上，而后者表示应用于 foo 属性的所有子元素上。

### 缩写到父级

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
 applyTo: "shortOnParent",
 childRules: [
    { key: "name", schema: Joi.string(), priority: 0 },
    { key: "age", schema: Joi.number(), priority: 1 },
    { key: "married", schema: Joi.boolean(), priority: 2 },
 ],
```

如果父级的值中有匹配到子属性的 schema（以Joi规则描述，https://joi.dev/api/），就把值赋给该子属性。

#### //TODO

[ ] 支持在子属性匹配中的灵活性和容错性，比如父级值列中多出或少了值如何处理？

### 复杂 Key

以复杂的 Key 描述子级复杂的结构。类似于 lodash 中 get/set 所支持的 path 格式。

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
{ applyTo: "dotAsNest", split: "." }
```

`split`是寻找此种”复杂 Key“的依据，如果如上例，则可以实现类似 lodash set 的效果，如果使用‘-’，则实现类似于 css 的效果。

### 字典数组

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
{ applyTo: "mapToArray", keyOfItem: "name" }
```

## 如何使用

使用方式类似于 -

```javascript
const r = new DotAsNestRule("people", ".");
const r2 = new MapToArrayRule("people", "name");
expect(obj).not.toBeNull;
const re = r.add(r2).run(obj);
expect(re[0]).toEqual(resultO);
```

详情见源代码中的`./src/shorthand.test.ts`。

## 附赠

一个简单的 builder dsl，😊，类似于 -

```javascript
applyTo("foo").dotAsNest().add().mapToArray().build();
```

详情可见`./src/dsl.test.ts`
