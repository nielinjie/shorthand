import { findLongestMatchPath, smartGet, smartSet } from "./smartSet";
import _ from "lodash";

test.each([
  [{ a: 1, b: { c: 2, d: 4 } }, "a.b.c.f", "a"],
  [{ a: 1, b: { c: 2, d: 4 } }, "b.c.f", "b.c"],
  [{ a: 1, b: { c: 2, d: 4 } }, "b.c.d", "b.c"],
  [{ a: 1, b: { c: { d: 4 } } }, "b.c.d", "b.c.d"],
  [{ a: 1, b: { c: { d: 4 }, f: { e: 3 } } }, "b.c.e", "b.c"],
  [{ a: 1, b: { c: { d: 4 }, f: { e: 3 } } }, "e", ""],
  [{ a: 1, b: { c: { d: 4 }, f: { e: 3 } } }, "a.f", "a"],
])("simple find longest path in %s for %s", (obj, pa, r) => {
  const path = (pa as string).split(".");
  const re = findLongestMatchPath(obj as object, path);
  expect(re).toEqual((r as string).split("."));
});
test("get", () => {
  const re = smartGet({ a: 1 }, "");
  expect(re).toEqual({ a: 1 });
});
test("get agin", () => {
  const obj = { a: 1, b: { c: 2, d: 4 } };
  const re = smartGet(obj, "b.c");
  expect(re).toEqual(2);
});
test.only.each([
  [{ a: 1, b: { c: 2, d: 4 } }, "b.c", 7, { a: 1, b: { c: 7, d: 4 } }],
  [
    { a: 1, b: { c: 2, d: 4 } },
    "b.c.a",
    7,
    { a: 1, b: { c: { _$: 2, a: 7 }, d: 4 } },
  ],
  [{ a: 1, b: { c: 2, d: 4 } }, "b", 7, { a: 1, b: 7 }],
  [{ a: 1, b: { c: 2, d: 4 } }, "a", 7, { a: 7, b: { c: 2, d: 4 } }],
  [
    { a: 1, b: { c: 2, d: 4 } },
    "a.f",
    7,
    { a: { _$: 1, f: 7 }, b: { c: 2, d: 4 } },
  ],
  [
    { a: 1, b: { c: [2, 3], d: 4 } },
    "b.c.a",
    7,
    { a: 1, b: { c: { _$: [2, 3], a: 7 }, d: 4 } },
  ],
  [
    { a: 1, b: { c: [2, 3], d: 4 } },
    "b.c.a",
    { e: "foo" },
    { a: 1, b: { c: { _$: [2, 3], a: { e: "foo" } }, d: 4 } },
  ],
  [{ a: 1, c: "foo" }, "c", { d: 2 }, { a: 1, c: { d: 2 } }],
])("set in %s, by path %s", (obj, path, value, r) => {
  const re = smartSet(obj, path, value, {
    allowOverwrite: true,
    valueHolder: "_$",
  });
  expect(re).toEqual(r);
});
// test.only("simple set", () => {
//   const obj = { a: 1, b: { c: 2, d: 4 } };
//   const path = "b.c";
//   const value = 7;
//   const re = smartSet(obj, path, value, {
//     overwrite: false,
//     valueHolder: "_$",
//   });
//   expect(re).toEqual({ a: 1, b: { c: 7, d: 4 } });
// });
