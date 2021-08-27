import { applyByRule, transform } from "./MapToArray";
test("normalize", () => {
  const rule = { keyOfItem: "name", applyIn: "target" };
  const re = transform({ b: { text: "hello" }, c: { text: "world" } }, rule);
  expect(re).toEqual([
    { name: "b", text: "hello" },
    { name: "c", text: "world" },
  ]);
});
test("applyTo one", () => {
  const rule = { keyOfItem: "name", applyIn: "$.t" };
  const obj = { a: 1, t: { b: { text: "hello" }, c: { text: "world" } } };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({
    a: 1,
    t: [
      { name: "b", text: "hello" },
      { name: "c", text: "world" },
    ],
  });
});
test("applyTo deep", () => {
  const rule = { keyOfItem: "name", applyIn: "$..t" };
  const obj = {
    a: 1,
    foo: { t: { b: { text: "hello" }, c: { text: "world" } } },
  };
  const result = applyByRule(obj, rule);
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
test("applyTo deep", () => {
  const rule = { keyOfItem: "name", applyIn: "$..t" };
  const obj = {
    a: 1,
    foo: [{ t: { b: { text: "hello" }, c: { text: "world" } } }],
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({
    a: 1,
    foo: [
      {
        t: [
          { name: "b", text: "hello" },
          { name: "c", text: "world" },
        ],
      },
    ],
  });
});
