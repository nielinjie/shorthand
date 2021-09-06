import { applyByRule, transform } from "./MapToArray";
test("normalize", () => {
  const rule = { keyOfItem: "name", applyTo: "target" };
  const re = transform({ b: { text: "hello" }, c: { text: "world" } }, rule,undefined);
  expect(re[0]).toEqual([
    { name: "b", text: "hello" },
    { name: "c", text: "world" },
  ]);
});
test("applyTo one", () => {
  const rule = { keyOfItem: "name", applyTo: "$.t",valueHolder:undefined };
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
test("applyTo one with value holder", () => {
  const rule = { keyOfItem: "name", applyTo: "$.t", valueHolder: "_$" };
  const obj = { a: 1, t: { b: "hello" , c:  "world"  } };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({
    a: 1,
    t: [
      { name: "b", _$: "hello" },
      { name: "c", _$: "world" },
    ],
  });
});
test("applyTo deep", () => {
  const rule = { keyOfItem: "name", applyTo: "$..t" ,valueHolder:undefined};
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
test("applyTo deep with value holder", () => {
  const rule = { keyOfItem: "name", applyTo: "$..t" ,valueHolder:'_$'};
  const obj = {
    a: 1,
    foo: [{ t: { b: "hello" , c:  "world" } }],
  };
  const result = applyByRule(obj, rule);
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
  const rule = { keyOfItem: "name", applyTo: "$.t" ,valueHolder:undefined};
  const obj = {
    a: 1,
    t: [1,2],
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual(obj);
   expect(result[1]).toEqual(
     expect.arrayContaining([
       expect.objectContaining({ level: "warn", path: "$,t" }),
     ])
   );
});
