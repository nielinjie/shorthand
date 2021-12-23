import jp from "./jsonPath";
import { info, Log, Result, Rule } from "./Shorthand";
import _ from "lodash";

export class SimpleSetterRule extends Rule {
  run = (obj: object): Result => {
    return applyByRule(obj, this);
  };
  constructor(
    public applyTo: string,
    public check: string,
    public path: string,
    public value: any,
    public checkNotNil: boolean = false
  ) {
    super();
  }
}
export function applyByRule(obj: any, rule: SimpleSetterRule): Result {
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
  rule: SimpleSetterRule
): [any, Log[]] {
  const target = jp.value(value, path);
  if (!target) return [value, []];
  const checkValue = _.get(target, rule.check);
  if (rule.checkNotNil ? _.isNil(checkValue) : !_.isNil(checkValue))
    return [
      value,
      [
        info(
          `${path.toString()} is NOT applied simple setter - checker is defined `
        ),
      ],
    ];
  const newObj = { ...value };

  const newTarget = { ...target };
  _.set(newTarget, rule.path, rule.value);

  jp.value(newObj, jp.stringify(path), newTarget);
  return [
    newObj,
    [info(`${path.toString()} is applied simple setter - ${rule.path}`)],
  ];
}
