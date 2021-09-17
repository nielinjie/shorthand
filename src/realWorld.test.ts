import path from "path";
import fs from "fs-extra";
import yaml from "js-yaml";
import { MapToArrayRule } from "./MapToArray";
import { ChildRule, ShortOnParentRule } from "./ShortOnParent";
import Joi from "joi";
import { chain } from "./Shorthand";
import { DotAsNestRule } from "./DotAsNest";

test("basic entities", () => {
  const [obj, resultO] = useTestAndResult("basicEntities", "entities");
  const r = new MapToArrayRule("$.entities", "name");
  const r2 = new MapToArrayRule("$..properties", "name");
  expect(obj).not.toBeNull;
  const re = chain(...[r, r2]).run(obj);
  expect(re[0]).toEqual(resultO);
  expect(re[0]).toEqual(resultO);
});
test("short on parent entities no constraints", () => {
  const [obj, resultO] = useTestAndResult(
    "shortOnParentEntities",
    "noConstrainsEntities"
  );
  const r = new MapToArrayRule("$.entities", "name");
  const r2 = new MapToArrayRule("$..properties", "name");
  const r3 = new ShortOnParentRule("$..properties.*", [
    new ChildRule("type", Joi.string()),
  ]);

  expect(obj).not.toBeNull;
  const re = chain(r, r3, r2).run(obj);
  expect(re[0]).toEqual(resultO);
  expect(re[0]).toEqual(resultO);
});
test("short on parent entities", () => {
  const [obj, resultO] = useTestAndResult(
    "shortOnParentEntitiesWithConstrains",
    "entities"
  );
  const r = new MapToArrayRule("$.entities", "name");
  const r2 = new MapToArrayRule("$..properties", "name");
  const r3 = new ShortOnParentRule("$..properties[*]", [
    new ChildRule("type", Joi.string()),
  ]);
  const r4 = new DotAsNestRule("$..properties", ".");
  const re = chain(r, r4, r2, r3).run(obj);
  expect(re[0]).toEqual(resultO);
});

test("relation ship shorted", () => {
  const [obj, resultO] = useTestAndResult(
    "entitiesWithRelationshipShorted",
    "entities"
  );

  const r = new MapToArrayRule("$.entities", "name");
  const r2 = new MapToArrayRule("$..properties", "name");
  const r3 = new ShortOnParentRule("$..properties[*]", [
    new ChildRule("type", Joi.string()),
    new ChildRule(
      "relation",
      Joi.array().ordered(Joi.string().valid("one", "many"), Joi.string())
    ),
    new ChildRule("constraints", Joi.array().items(Joi.string())),
  ]);
  const r4 = new DotAsNestRule("$..properties", ".");
  const r5 = new ShortOnParentRule("$..relation", [
    new ChildRule("n", Joi.string().valid("one", "many")),
    new ChildRule("to", Joi.string()),
  ]);
  const re = chain(r, r4, r2, r3, r5).run(obj);
  expect(re[0]).toEqual(resultO);
});
test("relation ship shorted with string", () => {
  const [obj, resultO] = useTestAndResult(
    "entitiesWithRelationshipStringShorted",
    "entities"
  );

  const r = new MapToArrayRule("$.entities", "name");
  const r2 = new MapToArrayRule("$..properties", "name");
  const r3 = new ShortOnParentRule("$..properties[*]", [
    new ChildRule("relation", Joi.string().regex(/^(one|many)\-(\w+)$/)),
    new ChildRule("type", Joi.string()),
    new ChildRule("constraints", Joi.array().items(Joi.string())),
  ]);
  const r4 = new DotAsNestRule("$..properties", ".");
  const r5 = new ShortOnParentRule("$..relation", [
    new ChildRule("n", Joi.string().valid("one", "many")),
    new ChildRule("to", Joi.string()),
  ],"-");
  const re = chain(r, r4, r2, r3, r5).run(obj);
  expect(re[0]).toEqual(resultO);
});
test("functions", () => {
  const [obj, result] = useTestAndResult("functions");
  const r = new MapToArrayRule("$.functions", "name");
  const r2 = new DotAsNestRule("$..annotations", ".");
  const re = chain(r, r2).run(obj);
  expect(re[0]).toEqual(result);
});
test("pages", () => {
  const [obj, result] = useTestAndResult("pages");
  const r = new MapToArrayRule("$.pages", "name");
  const r1 = new MapToArrayRule("$..places", "function");
  const r2 = new DotAsNestRule("$.pages[*]", ".");
  const re = chain(r, r1, r2).run(obj);
  expect(re[0]).toEqual(result);
});

test("presentations", () => {
  const [obj, result] = useTestAndResult("presentation");
  const r = new MapToArrayRule("$.presentations", "name");
  const r2 = new MapToArrayRule("$..propertyRules", "property");
  const r3 = new ShortOnParentRule("$..propertyRules[*]", [
    new ChildRule("rules", Joi.array().items(Joi.string())),
  ]);
  const re = chain(r, r2, r3).run(obj);
  expect(re[0]).toEqual(result);
});

function useTestAndResult(
  name: string,
  resultName: string | undefined = undefined
): [object, object] {
  const file = path.join("./realWorldTestYamls/", `test-${name}.yaml`);
  const result = path.join(
    "./realWorldTestYamls/",
    `result-${resultName ?? name}.yaml`
  );
  const string = fs.readFileSync(file).toString();
  const resultO = yaml.load(fs.readFileSync(result).toString());
  const obj = yaml.load(string);
  return [obj, resultO];
}
function dump(re) {
  console.log(yaml.dump(re[0]));
  console.log(re[1]);
}
