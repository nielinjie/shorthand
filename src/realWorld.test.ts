import path from 'path';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import { MapToArrayRule } from './MapToArray';
import { ChildRule, ShortOnParentRule } from './ShortOnParent';
import Joi from 'joi';
import { chain } from './Shorthand';
import { DotAsNestRule } from './DotAsNest';

test("basic entities", () => {
  const [obj, resultO] = useTestAndResult("basicEntities",'entities');
 const r = new MapToArrayRule("$.entities", "name");
 const r2 = new MapToArrayRule("$..properties", "name");
 expect(obj).not.toBeNull;
 const re = chain(r,r2).run(obj);
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
  const r3 =  new ShortOnParentRule('$..properties.*',[
      new ChildRule('type',Joi.string())
  ],undefined,'_$');

  expect(obj).not.toBeNull;
  const re = chain(r,r3,r2).run(obj);
  expect(re[0]).toEqual(resultO);
  expect(re[0]).toEqual(resultO);
});
test("short on parent entities", () => {
  const [obj, resultO] = useTestAndResult(
    "shortOnParentEntitiesWithConstrains",
    "entities"
  );
  const r = new MapToArrayRule("$.entities", "name","_$");
  const r2 = new MapToArrayRule("$..properties", "name","_$");
  const r3 = new ShortOnParentRule(
    "$..properties[*]",
    [new ChildRule("type", Joi.string())],
    undefined,
    "_$"
  );
  const r4 =  new DotAsNestRule('$..properties','.','_$')

  expect(obj).not.toBeNull;
  const re = chain(r,r4,r2,r3).run(obj);
  // dump(re)
  expect(re[0]).toEqual(resultO);
  // console.log(yaml.dump(resultO))
});


function useTestAndResult(name: string,resultName:string|undefined): [object, object] {
  const file = path.join("./realWorldTestYamls/", `test-${name}.yaml`);
  const result = path.join("./realWorldTestYamls/", `result-${resultName??name}.yaml`);
  const string = fs.readFileSync(file).toString();
  const resultO = yaml.load(fs.readFileSync(result).toString());
  const obj = yaml.load(string);
  return [obj, resultO];
}
function dump(re){
    console.log(yaml.dump(re[0]))
    console.log(re[1])
}
