import { isSupportedRelative, offset, relative, join } from "./objectPath";

test("relative", () => {
  const base = "a.b.c";
  const full = "a.b.c.e";
  const re = "e";
  expect(relative(base, full)).toEqual(re);
});

test("relative throw", () => {
  const base = "a.b.c";
  const full = "a.b.e";
  expect(() => relative(base, full)).toThrowError("not start");
});

test("relative", () => {
  const base = "a.b";
  const full = "a.b.e.f.g";
  const re = "e.f.g";
  expect(relative(base, full)).toEqual(re);
});

test("support", () => {
  expect(isSupportedRelative("a.b.c")).toEqual(true);
  expect(isSupportedRelative("")).toEqual(true);
  expect(isSupportedRelative("^.a")).toEqual(true);
  expect(isSupportedRelative("^.^.f")).toEqual(true);
  expect(isSupportedRelative("^.^")).toEqual(true);
  expect(isSupportedRelative("a.^.e")).toEqual(false);
  expect(isSupportedRelative("a.^.^")).toEqual(false);
});
test.each([
  ["a.b", "e.f.g", "a.b.e.f.g"],
  ["a.b", "^.e", "a.e"],
  ["a.b.f.g", "^.e", "a.b.f.e"],
  ["a.b.f.g", "^.^.e", "a.b.e"],
  ["a", "^.^.e", "e"],
  ["a", "^", ""],
  ["", "a", "a"],
])("full = %s & %s", (base, re, full) => {
  expect(join(base, re)).toEqual(full);
});
test("more than tow join", () => {
  const base = "a";
  const b = "b";
  expect(join(base, b, "c")).toEqual("a.b.c");
  expect(join(base, b, "^", "c")).toEqual("a.c");
  expect(join(base, "^", "c")).toEqual("c");
});
test("offset", () => {
  const path = "a.b.c.e";
  const re = offset(path);
  expect(re).toEqual("a.b.c");
  const r2 = offset(path, -2);
  expect(r2).toEqual("a.b");
});
