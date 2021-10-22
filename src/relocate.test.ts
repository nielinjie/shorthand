import {
  join,
  joinF,
  insertF,
} from "./objectPath";
import { RelocateRule } from "./Relocate";
import yaml from "js-yaml";

test("simple", () => {
  const obj = { a: 1, b: { d: 2 }, c: "foo" };
  const r = new RelocateRule("$", "c", "b.c");
  const re = r.run(obj);
  expect(re[0]).toEqual({ a: 1, b: { d: 2, c: "foo" } });
});
test("for from", () => {
  const obj = { a: 1, b: { d: 2 }, c: "foo" };
  //all of b's children relocate to c
  const r = new RelocateRule("$", "b", (key) => join(key, "^.c"));
  const re = r.run(obj);
  expect(re[0]).toEqual({ a: 1, c: { d: 2 } });
});
test("relative move", () => {
  const obj = { a: 1, b: { d: 2 }, c: "foo" };
  const r = new RelocateRule("$", "b.d", joinF("^.^.c"));
  const re = r.run(obj);
  expect(re[0]).toEqual({ a: 1, b: {}, c: 2 });
});
test("relative move", () => {
  const obj = { functions: { foo: { io: "foo" } } };
  const r = new RelocateRule("$.functions", "$..io", joinF("^.parameter.io"));
  const re = r.run(obj);
  expect(re[0]).toEqual({ functions: { foo: { parameter: { io: "foo" } } } });
});
test("relative move", () => {
  const obj = { functions: { foo: { io: "foo" }, bar: { out: "bar" } } };
  const r = new RelocateRule(
    "$.functions",
    "$..[io,out]",
    insertF("parameter")
  );
  const re = r.run(obj);
  dump(re);
  expect(re[0]).toEqual({
    functions: {
      foo: { parameter: { io: "foo" } },
      bar: { parameter: { out: "bar" } },
    },
  });
});
//skip 是因为 ['',] 这种参数jsonpath-plus不支持
test.skip("relative move with dot key", () => {
  const obj = { functions: { foo: { 'io.nest' : "foo" }, bar: { out: "bar" } } };
  const r = new RelocateRule(
    "$.functions",
    `$..['io.nest',out]`,
    insertF("parameter")
  );
  const re = r.run(obj);
  dump(re);
  expect(re[0]).toEqual({
    functions: {
      foo: { parameter: { 'io.nest': "foo" } },
      bar: { parameter: { out: "bar" } },
    },
  });
});

function dump(re) {
  console.log(yaml.dump(re[0]));
  // console.log(re[1]);
}
/*
真实案例- 
functions：
    foo：
        io

functions：
    foo：
        parameter：
            io


            foo.io -> foo.parameter.io
            applyTo = functions.*
            base = functions.foo
            relative = io
            change relative to parameter+io
            finally =base + changedRelative = functions.foo.parameter.io
            base 和 applyTo可以是一个东西么？
*/
