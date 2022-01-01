import { SimpleSetterRule } from "./SimpleSetter";

test("simple", () => {
  const rule = new SimpleSetterRule("$.foo", "b", "b", "jason");
  const obj = { foo: { a: 1 } };
  const re = rule.run(obj);
  expect(re[0]).toEqual({ foo: { a: 1, b: "jason" } });
});
test("simple, not applied", () => {
  const rule = new SimpleSetterRule("$.foo", "b", "b", "jason");
  const obj = { foo: { a: 1, b: "kk" } };
  const re = rule.run(obj);
  expect(re[0]).toEqual(obj);
});

test("simple, not applied", () => {
  const rule = new SimpleSetterRule("$.foo", "b", "b", "jason", true);
  const obj = { foo: { a: 1 } };
  const re = rule.run(obj);
  expect(re[0]).toEqual({ foo: { a: 1 } });
});
test("simple", () => {
  const rule = new SimpleSetterRule("$.foo", "b", "b", "jason", true);
  const obj = { foo: { a: 1, b: "kk" } };
  const re = rule.run(obj);
  expect(re[0]).toEqual({ foo: { a: 1, b: "jason" } });
});
test("default", () => {
  const rule = new SimpleSetterRule("$.foo", "b", "b", "jason");
  const obj = { foo: { a: 1 } };
  const re = rule.run(obj);
  expect(re[0]).toEqual({ foo: { a: 1, b: "jason" } });
});
test("set value", () => {
  const rule = new SimpleSetterRule("$.foo", "b", "type", "b type", true);
  const obj = { foo: { a: 1, b: 2 } };
  const re = rule.run(obj);
  expect(re[0]).toEqual({ foo: { a: 1, b: 2, type: "b type" } });
});
