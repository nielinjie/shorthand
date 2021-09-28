import Joi from "joi";
import { defaultValueHolder } from ".";
import { transform, ChildRule, applyByRule } from "./ShortOnParent";
test("normal", () => {
  const rules: ChildRule[] = [{ key: "a", schema: Joi.number() }];
  const re = transform([1], rules, [""], [1]);
  expect(re[0]).toEqual({ a: 1 });
});
test("normal no match", () => {
  const rules: ChildRule[] = [{ key: "a", schema: Joi.number() }];
  const re = transform(["ka"], rules, [""], ["ka"]);
  expect(re[0]).toEqual(["ka"]);
  expect(re[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        level: "warn",
        message: expect.stringContaining("some value pieces"),
      }),
    ])
  );
});
test("normal, pick by order", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number() },
    { key: "b", schema: Joi.number() },
  ];
  const re = transform([1, 2], rules, [""], [1, 2]);
  expect(re[0]).toEqual({ a: 1, b: 2 });
});
test("normal more than one match", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number() },
    { key: "b", schema: Joi.number() },
  ];
  const re = transform([1], rules, [""], [1]);
  expect(re[0]).toEqual({ a: 1 });
});
test("normal more than one match, with priority", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.number() },

    { key: "a", schema: Joi.number() },
  ];
  const re = transform([1], rules, [""], [1]);
  expect(re[0]).toEqual({ b: 1 });
});

test("normal with 2 properties", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.string() },

    { key: "a", schema: Joi.number() },
  ];
  const re = transform([1, "k"], rules, [""], [1, "k"]);
  expect(re[0]).toEqual({ a: 1, b: "k" });
});

test("normal with 2 properties and too more", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.string() },

    { key: "a", schema: Joi.number() },
  ];
  const re = transform([1, "k", 2], rules, [""], [1, "k", 2]);
  expect(re[0]).toEqual([1, "k", 2]);
  expect(re[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        level: "warn",
        message: expect.stringContaining("some value pieces"),
      }),
    ])
  );
});
test("nested path", () => {
  const rules: ChildRule[] = [
    { key: "b.c", schema: Joi.string() },

    { key: "a", schema: Joi.number() },
  ];
  const re = transform([1, "k"], rules, [""], [1, "k"]);
  expect(re);
  expect(re[0]).toEqual({ a: 1, b: { c: "k" } });
});
test("simple apply", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.string() },

    { key: "a", schema: Joi.number() },
  ];
  const rule = { applyTo: "$.foo", childRules: rules };
  const obj = { a: 1, foo: [1, "jason"] };
  const re = applyByRule(obj, rule);
  expect(re[0]).toEqual({ a: 1, foo: { a: 1, b: "jason" } });
});
test("simple apply through value holder", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.string() },
    { key: "a", schema: Joi.number() },
  ];
  const rule = { applyTo: "$.foo", childRules: rules, valueHolder: defaultValueHolder };
  const obj = { a: 1, foo: { _$: [1, "jason"] } };
  const re = applyByRule(obj, rule);
  expect(re[0]).toEqual({ a: 1, foo: { a: 1, b: "jason" } });
});

test("simple apply through value holder with other properties existed", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.string() },
    { key: "a", schema: Joi.number() },
  ];
  const rule = { applyTo: "$.foo", childRules: rules, valueHolder: defaultValueHolder };
  const obj = { a: 1, foo: { _$: [1, "jason"], c: "hoo" } };
  const re = applyByRule(obj, rule);
  expect(re[0]).toEqual({ a: 1, foo: { a: 1, b: "jason", c: "hoo" } });
});

test("simple apply to string, priority works", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.string() },

    { key: "a", schema: Joi.number() },
  ];
  const rule = { applyTo: "$.foo", childRules: rules, split: "," };
  const obj = { a: 1, foo: "1, jason" };
  const re = applyByRule(obj, rule);
  expect(re[0]).toEqual(obj);
  expect(re[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        level: "warn",
        message: expect.stringContaining("some value pieces"),
      }),
    ])
  );
});
test("simple apply to string", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number() },
    { key: "b", schema: Joi.string() },
  ];
  const rule = { applyTo: "$.foo", childRules: rules, split: "," };
  const obj = { a: 1, foo: "1, jason" };
  const re = applyByRule(obj, rule);
  expect(re[0]).toEqual({ a: 1, foo: { a: 1, b: "jason" } });
});
test(" apply to string value holder", () => {
  const rules: ChildRule[] = [
    { key: "a", schema: Joi.number() },
    { key: "b", schema: Joi.string() },
  ];
  const rule = {
    applyTo: "$.foo",
    childRules: rules,
    split: ",",
    valueHolder: defaultValueHolder,
  };
  const obj = { a: 1, foo: { _$: "1, jason" } };
  const re = applyByRule(obj, rule);
  expect(re[0]).toEqual({ a: 1, foo: { a: 1, b: "jason" } });
});
test("simple apply in a array", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.string() },

    { key: "a", schema: Joi.number() },
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
test(" apply in a array with value holder", () => {
  const rules: ChildRule[] = [
    { key: "b", schema: Joi.string() },

    { key: "a", schema: Joi.number() },
  ];
  const rule = { applyTo: "$.foo[*]", childRules: rules, valueHolder: defaultValueHolder };
  const obj = {
    a: 1,
    foo: [[1, "jason"], { _$: [2, "elsa"] }],
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
