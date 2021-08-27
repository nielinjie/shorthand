import Joi from "joi";
import { transform, ChildRule, applyByRule } from "./ShortOnParent";
test("normal", () => {
  const rules: ChildRule[] = [{ key: "a", schema: Joi.number(), priority: 1 }];
  const re = transform([1], rules, "");
  expect(re[0]).toEqual({ a: 1 });
});
test("normal no match", () => {
  const rules: ChildRule[] = [{ key: "a", schema: Joi.number(), priority: 1 }];
  const re = transform(["ka"], rules, "");
  expect(re[0]).toEqual({});
});
test("normal more than one match", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number(), priority: 1 },
    { key: "b", schema: Joi.number(), priority: 1 },
  ];
  const re = transform([1], rules, "");
  expect(re[0]).toEqual({ a: 1 });
});
test("normal more than one match, with priority", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number(), priority: 1 },
    { key: "b", schema: Joi.number(), priority: 0 },
  ];
  const re = transform([1], rules, "");
  expect(re[0]).toEqual({ b: 1 });
});

test("normal with 2 properties", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number(), priority: 1 },
    { key: "b", schema: Joi.string(), priority: 0 },
  ];
  const re = transform([1, "k"], rules, "");
  expect(re[0]).toEqual({ a: 1, b: "k" });
});
test("normal with 2 properties", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number(), priority: 1 },
    { key: "b", schema: Joi.string(), priority: 0 },
  ];
  const re = transform([1, "k", 2], rules, "");
  expect(re[0]).toEqual({ a: 1, b: "k" });
});
test("nested path", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number(), priority: 1 },
    { key: "b.c", schema: Joi.string(), priority: 0 },
  ];
  const re = transform([1, "k", 2], rules, "");
  expect(re[0]).toEqual({ a: 1, b: { c: "k" } });
});
test("simple apply", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number(), priority: 1 },
    { key: "b", schema: Joi.string(), priority: 0 },
  ];
  const rule = { applyTo: "$.foo", childRules: rules };
  const obj = { a: 1, foo: [1, "jason"] };
  const re = applyByRule(obj, rule);
  expect(re[0]).toEqual({ a: 1, foo: { a: 1, b: "jason" } });
});
test("simple apply in a array", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number(), priority: 1 },
    { key: "b", schema: Joi.string(), priority: 0 },
  ];
  const rule = { applyTo: "$.foo[*]", childRules: rules };
  const obj = {
    a: 1,
    foo: [
      [1, "jason"],
      [2, "elsa"],
    ],
  };
  const re = applyByRule(obj, rule);
  expect(re[0]).toEqual({
    a: 1,
    foo: [
      { a: 1, b: "jason" },
      { a: 2, b: "elsa" },
    ],
  });
});
