import jp from "./jsonPath";
import { info, Log, Result, Rule } from "./Shorthand";
import _ from "lodash";
import { LocalModifierRule } from "./LocalModifier";

export class SimpleSetterRule extends LocalModifierRule {
  constructor(
    public applyTo: string,
    public ifNotExisted: string,
    public path: string,
    public value: any,
    public checkExisted: boolean = false
  ) {
    super(
      applyTo,
      (newTarget) => {
        _.set(newTarget, this.path, this.value);
        return [newTarget, []];
      },
      (target) => {
        const checkValue = _.get(target, this.ifNotExisted);
        return this.checkExisted ? !_.isNil(checkValue) : _.isNil(checkValue);
      }
    );
  }
}
