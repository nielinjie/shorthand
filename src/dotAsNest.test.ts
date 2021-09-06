import { applyByRule, DotAsNestRule, transform } from "./DotAsNest";
import path from 'path';
import fs from 'fs-extra';
import yaml from 'js-yaml';

test("normal", () => {
  const result = transform(["a.b"], { "a.b": "hello" }, ".", undefined);
  expect(result[0]).toEqual({ a: { b: "hello" } });
});
test("normal", () => {
  const result = transform(["a.b"], { a: "foo", "a.b": "hello" }, ".", "_$");
  expect(result[0]).toEqual({ a: { _$: "foo", b: "hello" } });
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
test("avoid overwrite", () => {
  const rule = { applyTo: "$.foo", split: "." };
  const obj = {
    a: 1,
    foo: { b: "kk", "b.d": "hello" },
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual(obj);
  expect(result[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ level: "warn", path: "b.d" }),
    ])
  );
});
test("avoid overwrite with valueHolder", () => {
  const rule = { applyTo: "$.foo", split: ".", valueHolder: "_$" };
  const obj = {
    a: 1,
    foo: { b: "kk", "b.d": "hello" },
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({
    a: 1,
    foo: { b: { _$: "kk", d: "hello" } },
  });
});
test("avoid overwrite with value holder", () => {
  const rule = { applyTo: "$.foo", split: ".", valueHolder: "_$" };
  const obj = {
    a: 1,
    foo: { b: ["kk"], "b.d": "hello" },
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual({
    a: 1,
    foo: { b: { _$: ["kk"], d: "hello" } },
  });
});
test("no applied", () => {
  const rule = { applyTo: "$.foo[*]", split: "." };
  const obj = {
    a: 1,
    bar: [{ "b.c": "hello", "e.f": "world" }, { "e.f": "world" }],
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual(obj);
  expect(result[1]).toEqual([]);
});

test("applied, but not changed", () => {
  const rule = { applyTo: "$.foo", split: "." };
  const obj = {
    a: 1,
    foo: 1,
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual(obj);
  expect(result[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ level: "warn", path: "$,foo" }),
    ])
  );
});
test("applied, but not changed, no dot keys", () => {
  const rule = { applyTo: "$.foo", split: "." };
  const obj = {
    a: 1,
    foo: { b: "kk" },
  };
  const result = applyByRule(obj, rule);
  expect(result[0]).toEqual(obj);
  expect(result[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ level: "warn", path: "$,foo" }),
    ])
  );
});

test('some real',()=>{
   const [obj, resultO] = useTestAndResult("dot");
   const r = new DotAsNestRule("$..properties", ".",'_$');
   const re = r.run(obj);
  //  dump(re)
  //  expect(re[0]).toEqual(resultO);
})


function useTestAndResult(name: string): [object, object] {
  const file = path.join("./testYamls/", `test-${name}.yaml`);
  const result = path.join("./testYamls/", `result-${name}.yaml`);
  const string = fs.readFileSync(file).toString();
  const resultO = yaml.load(fs.readFileSync(result).toString());
  const obj = yaml.load(string);
  return [obj, resultO];
}
function dump(re) {
  console.log(yaml.dump(re[0]));
  console.log(re[1]);
}