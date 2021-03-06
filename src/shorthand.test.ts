import fs from "fs-extra";
import path from "path";
import yaml from "js-yaml";
import Joi from "joi";

import { DotAsNestRule } from "./DotAsNest";
import { MapToArrayRule } from "./MapToArray";
import { ShortOnParentRule } from "./ShortOnParent";
import { defaultValueHolder } from ".";

//TODO 通过rule，自动寻找runner

test.each([
  ["dotAsNest", new DotAsNestRule("dotAsNest", ".")],
  ["mapToArray", new MapToArrayRule("mapToArray", "name")],
  [
    "shortOnParent",
    new ShortOnParentRule(
      "shortOnParent",
      [
        { key: "name", schema: Joi.string() },
        { key: "age", schema: Joi.number() },
        { key: "married", schema: Joi.boolean() },
      ],
      undefined,
      defaultValueHolder
    ),
  ],
])("yaml %s", (a, r) => {
  const [obj, resultO] = useTestAndResult(a);
  expect(obj).not.toBeNull;
  const re = r.run(obj);
  expect(re[0]).toEqual(resultO);
});
test("in one", () => {
  const [obj, resultO] = useTestAndResult("people");
  const r = new MapToArrayRule("people", "name");
  const r2 = new ShortOnParentRule(
    "$..people[*]",
    [
      { key: "name", schema: Joi.string() },
      { key: "age", schema: Joi.number() },
      { key: "married", schema: Joi.boolean() },
    ],
    undefined,
    defaultValueHolder
  );
  expect(obj).not.toBeNull;
  const re = r2.add(r).run(obj);
  expect(re[0]).toEqual(resultO);
});

test("in one 2", () => {
  const [obj, resultO] = useTestAndResult("people2");
  const r = new DotAsNestRule("people", ".");
  const r2 = new MapToArrayRule("people", "name");
  expect(obj).not.toBeNull;
  r.setDebug(dump)
  const re = r.add(r2).run(obj);
  expect(re[0]).toEqual(resultO);
});

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
  // console.log(re[1]);
}