import { JSONPath } from "jsonpath-plus";
import jp from "./jsonPath";
// test('simple path',()=>{
//     const obj={a:[{b:1},{b:2}]}
//     const jsonP = jp.paths(obj, "$..a");
//     const jsonP2 = jp.paths(obj, "$..a[*]");
//     expect(jsonP).toEqual([['$','a']])
//     expect(jsonP2).toEqual([['$','a',0],['$','a',1]])
//     const path = jsonP[0]
//     const path2 = jsonP2[0]
//     const v = jp.value(obj,path)
//     expect(v).toEqual(obj.a)
//     const v2 = jp.value(obj,path2)
//     expect(v2).toEqual(obj.a[0])
// })
// test('some path',()=>{
//     const obj = { functions: { foo: { io: "foo" }, bar: { out: "bar" } } };
//     const jsonp = '$..io'
//     const paths = jp.paths(obj,jsonp)
//     expect(paths).toEqual([['$','functions','foo','io']])
// })
// test("some path", () => {
//   const obj = { functions: { foo: { io: "foo" }, bar: { out: "bar" } } };
//   const jsonp = "$..['io']";
//   const paths = jp.paths(obj, jsonp);
//   expect(paths).toEqual([["$", "functions", "foo", "io"]]);
// });
// test("some path", () => {
//   const obj = { functions: { foo: { io: "foo" }, bar: { out: "bar" } } };
//   const jsonp = "$..['out']";
//   const paths = jp.paths(obj, jsonp);
//   expect(paths).toEqual([["$", "functions", "bar", "out"]]);
// });


test.only("some path", () => {
  const obj = { functions: { foo: { io: "foo" }, bar: { out: "bar" } } };
  const jsonp = "$..[io,out]";
  // const jsonp = "$..['io']";
  const paths = jp.paths(obj, jsonp);
  expect(paths).toEqual([
    ["$", "functions", "foo", "io"],
    ["$", "functions", "bar", "out"],
  ]);
});
