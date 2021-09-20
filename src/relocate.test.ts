import { RelocateRule } from "./Relocate";

test("simple", () => {
  const obj = { a: 1, b: { d: 2 }, c: "foo" };
  const r = new RelocateRule("$", "c", "b.c");
  const re = r.run(obj);
  expect(re[0]).toEqual({ a: 1, b: { d: 2, c: "foo" } });
});
