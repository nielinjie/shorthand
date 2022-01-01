import jp from "./jsonPath";
import { info, Log, Result, Rule } from "./Shorthand";
import _ from "lodash";

export class LocalModifierRule extends Rule {
  run = (obj: object): Result => {
    return applyByRule(obj, this);
  };
  constructor(
    public applyTo: string,
    public modifier: (obj: any) => Result,
    public check: (obj: any) => boolean = (_) => true
  ) {
    super();
  }
}
export function applyByRule(obj: any, rule: LocalModifierRule): Result {
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
  value: any,
  path: string[],
  rule: LocalModifierRule
): [any, Log[]] {
  const target = jp.value(value, path);
  if (!target) return [value, []];
  const checked = rule.check(target);
  const newObj = { ...value };
  if (checked) {
    const newTarget = { ...target };
    const [v, l] = rule.modifier(newTarget);

    jp.value(newObj, jp.stringify(path), v);
    return [newObj, [...l, info(`${path.toString()} is applied modifier`)]];
  } else {
    return [newObj, []];
  }
}
