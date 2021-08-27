import { DotAsNestRule } from "./DotAsNest";
import { MapToArrayRule } from "./MapToArray";
import path from 'path';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import { applyTo } from "./RuleBuilder";


test("plain", () => {
  const [obj, resultO] = useTestAndResult("people2");
  const r = new DotAsNestRule("people", ".");
  const r2 = new MapToArrayRule("people", "name");
  expect(obj).not.toBeNull;
  const re = r.add(r2).run(obj);
  expect(re[0]).toEqual(resultO);
});
test("fluent", () => {
  const [obj, resultO] = useTestAndResult("people2");
  const r = applyTo('people').dotAsNest().add().mapToArray().build()
  const re = r.run(obj)
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