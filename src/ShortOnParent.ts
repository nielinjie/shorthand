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
    return b.validate(result.value);
  }
}

export class ShortOnParentRule extends Rule {
  run = (obj: object): [object, Log[]] => {
    return applyByRule(obj, this);
  };
  constructor(
    public applyTo: string,
    public childRules: ChildRule[],
    public split: string | undefined = ',',
    public valueHolder: string | undefined = '_$'
  ) {
    super();
  }
}
export function applyByRule(obj: any, rule: ShortOnParentRule): [any, Log[]] {
  const paths = jp.paths(obj, rule.applyTo);
  let re = obj;
  let logs: Log[] = [];
  paths.forEach((path) => {
    //   console.log("path",path)
    //   console.log(re)
    const forOne = applyByRuleForOneNode(re, path, rule, rule.valueHolder);
    re = forOne[0];
    logs = [...logs, ...forOne[1]];
  });
  return [re, logs];
}
export function applyByRuleForOneNode(
  value: any,
  path: string[],
  rule: ShortOnParentRule,
  valueHolder: string | undefined
): [any, Log[]] {
  const target = jp.value(value, path);
  if (!target) return [value, []];
  let toTransform: any = undefined;
  let useValueHolder = false;
  if (_.isArray(target)) {
    toTransform = target;
  }
  if (rule.split !== undefined && _.isString(target)) {
    toTransform = target.split(rule.split).map((x) => x.trim());
  }
  if (valueHolder && _(target).has(valueHolder)) {
    const newTarget = target[valueHolder];
    useValueHolder = true;
    if (_.isArray(newTarget)) {
      toTransform = newTarget;
    }
    if (rule.split !== undefined && _.isString(newTarget)) {
      toTransform = newTarget.split(rule.split).map((x) => x.trim());
    }
  }
  if (toTransform !== undefined) {
    const [newChildren, logs] = transform(
      toTransform,
      rule.childRules,
      path,
      target
    );
    if(newChildren === target){
      return [value,logs]
    }
    const newObj = { ...value };
    let oldValue = _.isPlainObject(target) ? { ...target } : {};
    if (useValueHolder) oldValue = _(oldValue).omit(valueHolder).value();
    // console.log(`newObj`, newObj);
    // console.log(`newChildren`, newChildren);
    // console.log(`path`, path);
    // console.log(`oldValue`, oldValue)
    const newValue = _.merge(oldValue, newChildren);
    // console.log(`newValue`, newValue);
    jp.value(newObj, jp.stringify(path), newValue);

    return [newObj, logs];
  } else {
    return [
      value,
      [warn("short is not array or a space joined string", rule.applyTo)],
    ];
  }
}
export function transform(
  value: any[],
  rules: ChildRule[],
  nodePath: string[],
  originalValue: any
): [any, Log[]] {
  const results: [any, string][] = [];
  let remainRules = [...rules];
  value.forEach((v, index) => {
    const result = forOneValue(v, remainRules);
    if (result) {
      results.push(result);
      remainRules = remainRules.filter((r) => r.key !== result[0]);
    }
  });
  let re = {};
  let log: Log[] = [];
  if (value.length > results.length) {
    log = [
      warn("some value pieces doesn't match any rules", nodePath.toString()),
    ];
    re = value;
    return [originalValue, log];
  }
  for (const result of results) {
    if (result) {
      const [path, va] = result;
      if (_(re).has(path)) {
        //这里是有覆盖。啥也不做？还是加上log？
        log.push(
          warn(`${path} is already defined, stop overwriting`, path.toString())
        );
        re = value;
        return [originalValue, log];
      } else {
        re = _(re).set(path, va).value();
        log.push(info(`${path} is set to ${va}`, nodePath.toString()));
      }
    }
  }
  return [re, log];
}
export function forOneValue(
  value: any,
  rules: ChildRule[]
): [string, any] | undefined {
  // const sorted = rules.sort((a, b) => a.priority - b.priority);
  const match = rules.find(
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
}
export class ChildRule implements ChildRule {
  constructor(public key: string, public schema: Schema) {}
}
