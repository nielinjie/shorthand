import { Schema, ValidationResult } from "joi";
import _ from "lodash";
import { info, Log, warn, Rule } from "./Shorthand";
import jp from "jsonpath";
export function validateAnd(
  value: any,
  a: Schema,
  b: Schema
): ValidationResult {
  const result = a.validate(value);
  if (result.error) {
    return result;
  } else {
    return b.validate(value);
  }
}

export class ShortOnParentRule extends Rule {
  run = (obj: object): [object, Log[]] => {
    return applyByRule(obj, this);
  };
  constructor(public applyTo: string, public childRules: ChildRule[]) {super()}
}
export function applyByRule(obj: any, rule: ShortOnParentRule): [any, Log[]] {
  const paths = jp.paths(obj, rule.applyTo);
  let re = obj;
  let logs: Log[] = [];
  paths.forEach((path) => {
    //   console.log("path",path)
    //   console.log(re)
    const forOne = applyByRuleForOneNode(re, path, rule);
    re = forOne[0];
    logs = [...logs, ...forOne[1]];
  });
  return [re, logs];
}
export function applyByRuleForOneNode(
  value: any,
  path: string[],
  rule: ShortOnParentRule
): [any, Log[]] {
  const target = jp.value(value, path);
  if (!target) return [value, []];
  if (_.isArray(target)) {
    const [newTarget, logs] = transform(target, rule.childRules, path);
    const newObj = { ...value };
    jp.value(newObj, jp.stringify(path), newTarget);
    return [newObj, logs];
  } else {
    return [value, [warn("short is not array", rule.applyTo)]];
  }
}
export function transform(
  value: any[],
  rules: ChildRule[],
  nodePath: string[]
): [any, Log[]] {
  const results = value.map((v) => forOne(v, rules));
  let re = {};
  let log: Log[] = [];
  for (const result of results) {
    if (result) {
      const [path, va] = result;
      if (_(re).has(path)) {
        //这里是有覆盖。啥也不做？还是加上log？
      } else {
        re = _(re).set(path, va).value();
        log.push(info(`${path} is set to ${va}`, nodePath.toString()));
      }
    }
  }
  return [re, log];
}
export function forOne(
  value: any,
  rules: ChildRule[]
): [string, any] | undefined {
  const sorted = rules.sort((a, b) => a.priority - b.priority);
  const match = sorted.find(
    (rule) => rule.schema.validate(value).error === undefined
  );
  if (match) {
    return [match.key, match.schema.validate(value).value];
  } else {
    return undefined;
  }
}

export interface ChildRule {
  key: string;
  schema: Schema;
  priority: number;
}
export class ChildRule implements ChildRule {
  constructor(
    public key: string,
    public schema: Schema,
    public priority: number = 0
  ) {}
}
