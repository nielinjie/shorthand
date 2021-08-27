import { applyByRule, transform } from "./DotAsNest";

test("normal", () => {
  const result = transform(["a.b"], { "a.b": "hello" }, ".");
  expect(result).toEqual({ a: { b: "hello" } });
});
test("apply to object", () => {
  const rule = { applyTo: "$.foo", split: "." };
  const obj = { a: 1, foo: { "b.c": "hello" } };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({ a: 1, foo: { b: { c: "hello" } } });
});
test("apply to an array's items", () => {
  const rule = { applyTo: "$.foo[*]", split: "." };
  const obj = { a: 1, foo: [{ "b.c": "hello" }] };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({ a: 1, foo: [{ b: { c: "hello" } }] });
});
test("apply to an array's items", () => {
  const rule = { applyTo: "$.foo[*]", split: "." };
  const obj = { a: 1, foo: [{ "b.c": "hello" }, { "e.f": "world" }] };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({
    a: 1,
    foo: [{ b: { c: "hello" } }, { e: { f: "world" } }],
  });
});
test("apply to an array's items", () => {
  const rule = { applyTo: "$.foo[*]", split: "." };
  const obj = {
    a: 1,
    foo: [{ "b.c": "hello", "e.f": "world" }, { "e.f": "world" }],
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({
    a: 1,
    foo: [{ b: { c: "hello" }, e: { f: "world" } }, { e: { f: "world" } }],
  });
});
//目前支持lodash的path表示法,split只可以是点.
test("apply to object, split work", () => {
  const rule = { applyTo: "foo", split: "-" };
  const obj = { a: 1, foo: { "b.c": "hello" } };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({ a: 1, foo: { "b.c": "hello" } });
  const rule2 = { applyTo: "foo", split: "." };
  const result2 = applyByRule(obj, rule2);
  expect(result2[0]).toEqual({ a: 1, foo: { b: { c: "hello" } } });
  const obj2 = { a: 1, foo: { "b-c": "hello" } };
  const result3 = applyByRule(obj2, rule);
  expect(result3[0]).toEqual({ a: 1, foo: { b: { c: "hello" } } });
});
