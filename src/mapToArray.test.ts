import { defaultValueHolder } from ".";
import { applyByRule, MapToArrayRule, transform } from "./MapToArray";
test("normalize", () => {
  const rule = { keyPropertyName: "name", applyTo: "target" };
  const re = transform(
    { b: { text: "hello" }, c: { text: "world" } },
    fromObject(rule),
    undefined
  );
  expect(re[0]).toEqual([
    { name: "b", text: "hello" },
    { name: "c", text: "world" },
  ]);
});
test("applyTo one", () => {
  const rule = {
    keyPropertyName: "name",
    applyTo: "$.t",
    valueHolder: undefined,
  };
  const obj = { a: 1, t: { b: { text: "hello" }, c: { text: "world" } } };
  const result = applyByRule(obj, fromObject(rule));
  expect(result[0]).toEqual({
    a: 1,
    t: [
      { name: "b", text: "hello" },
      { name: "c", text: "world" },
    ],
  });
});
test("applyTo one wither order", () => {
  const rule = {
    keyPropertyName: "name",
    applyTo: "$.t",
    valueHolder: undefined,
    indexPropertyName: "order",
  };
  const obj = { a: 1, t: { b: { text: "hello" }, c: { text: "world" } } };
  const result = applyByRule(obj, fromObject(rule));
  expect(result[0]).toEqual({
    a: 1,
    t: [
      { name: "b", order: 0, text: "hello" },
      { name: "c", order: 1, text: "world" },
    ],
  });
});
test("applyTo one with value holder", () => {
  const rule = { keyPropertyName: "name", applyTo: "$.t", valueHolder: defaultValueHolder };
  const obj = { a: 1, t: { b: "hello", c: "world" } };
  const result = applyByRule(obj, fromObject(rule));
  expect(result[0]).toEqual({
    a: 1,
    t: [
      { name: "b", _$: "hello" },
      { name: "c", _$: "world" },
    ],
  });
});
test("applyTo one with value holder and index", () => {
  const rule = {
    keyPropertyName: "name",
    indexPropertyName: "order",
    applyTo: "$.t",
    valueHolder: defaultValueHolder,
  };
  const obj = { a: 1, t: { b: "hello", c: "world" } };
  const result = applyByRule(obj, fromObject(rule));
  expect(result[0]).toEqual({
    a: 1,
    t: [
      { name: "b", _$: "hello", order: 0 },
      { name: "c", _$: "world", order: 1 },
    ],
  });
});
test("applyTo deep", () => {
  const rule = {
    keyPropertyName: "name",
    applyTo: "$..t",
    valueHolder: undefined,
  };
  const obj = {
    a: 1,
    foo: { t: { b: { text: "hello" }, c: { text: "world" } } },
  };
  const result = applyByRule(obj, fromObject(rule));
  expect(result[0]).toEqual({
    a: 1,
    foo: {
      t: [
        { name: "b", text: "hello" },
        { name: "c", text: "world" },
      ],
    },
  });
});
test("applyTo deep with value holder", () => {
  const rule = { keyPropertyName: "name", applyTo: "$..t", valueHolder: defaultValueHolder };
  const obj = {
    a: 1,
    foo: [{ t: { b: "hello", c: "world" } }],
  };
  const result = applyByRule(obj, fromObject(rule));
  expect(result[0]).toEqual({
    a: 1,
    foo: [
      {
        t: [
          { name: "b", _$: "hello" },
          { name: "c", _$: "world" },
        ],
      },
    ],
  });
});
test("not applied, not a map", () => {
  const rule = {
    keyPropertyName: "name",
    applyTo: "$.t",
    valueHolder: undefined,
  };
  const obj = {
    a: 1,
    t: [1, 2],
  };
  const result = applyByRule(obj, fromObject(rule));
  expect(result[0]).toEqual(obj);
  expect(result[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ level: "warn", path: "$,t" }),
    ])
  );
});

function fromObject(obj: any) :MapToArrayRule{
  return new MapToArrayRule(obj.applyTo, obj.keyPropertyName, obj.indexPropertyName, obj.valueHolder);
}