import _ from "lodash";
import { info, Log, Rule, warn } from "./Shorthand";
import jp from "jsonpath";

export class DotAsNestRule extends Rule {
  run = (obj: object): [object, Log[]] => {
    return applyByRule(obj, this);
  };
  constructor(
    public applyTo: string,
    public split: string,
    public valueHolder: string | undefined = undefined
  ) {
    super();
  }
}
export function transform(
  keys: string[],
  value: object,
  split: string,
  valueHolder: string | undefined
): [object, Log[]] {
  let re = { ...value };
  let logs: Log[] = [];
  keys.forEach((key) => {
    const partPath = findMaxMatchPath(re, key.split(split));
    const existedValue = _.clone(_(re).get(partPath));
    if (partPath !== undefined && !_.isPlainObject(existedValue)) {
      if (valueHolder) {
        const v = re[key];
        // console.log(re)
        re = _(re).omit(key).value();
        // console.log(re);
        // console.log(`[...partPath,valueHolder]`, [...partPath, valueHolder]);
        if (_.isArray(existedValue)) {
          re = {};
        }
        re = _(re)
          .set([...partPath, valueHolder], existedValue)
          .value();
        // console.log(re);

        re = _(re).set(key.split(split), v).value();
        // console.log(re);
      } else {
        logs.push(
          warn(
            `${partPath.toString()} is already defined and not a object, overwrite is  `,
            key
          )
        );
      }
    } else {
      const v = re[key];
      re = _(re).omit(key).value();
      re = _(re).set(key.split(split), v).value();
    }
  });
  return [re, logs];
}
export function applyByRule(obj: object, rule: DotAsNestRule): [object, Log[]] {
  const paths = jp.paths(obj, rule.applyTo);
  let re = obj;
  let logs: Log[] = [];
  paths.forEach((path) => {
    const forOne = applyByRuleForOneNode(re, path, rule);
    re = forOne[0];
    logs = [...logs, ...forOne[1]];
  });
  return [re, logs];
}
export function applyByRuleForOneNode(
  obj: object,
  path: string[],
  rule: DotAsNestRule
): [object, Log[]] {
  const target = jp.value(obj, path);
  if (target && _.isObject(target)) {
    const keys = _.keys(target).filter((key) => key.indexOf(rule.split) > -1);
    if (keys.length > 0) {
      const [newTarget, logs] = transform(
        keys,
        target,
        rule.split,
        rule.valueHolder
      );
      if (logs.length > 0) {
        return [obj, logs];
      }
      const newObj = { ...obj };
      jp.value(newObj, jp.stringify(path), newTarget);
      return [
        newObj,
        [info(`applied dot as nest shorting - keys=${keys}`, path.toString())],
      ];
    } else {
      return [
        obj,
        [warn(`no keys found to apply dot as nest shorting`, path.toString())],
      ];
    }
  } else {
    return [obj, [warn("target is not a object", path.toString())]];
  }
}
function findMaxMatchPath(obj: object, path: string[]): string[] | undefined {
  for (let i = path.length; i > 0; i--) {
    const part = _(path).slice(0, i).value();
    if (_(obj).get(part) !== undefined) {
      return part;
    }
  }
}
