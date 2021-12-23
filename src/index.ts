import jp from "./jsonPath";
import { insertF, toLodashPath } from "./objectPath";
import { RelocateRule } from "./Relocate";
import _ from 'lodash';

export { DotAsNestRule } from "./DotAsNest";
export { MapToArrayRule } from "./MapToArray";
export * from "./RuleBuilder";
export { ShortOnParentRule, ChildRule } from "./ShortOnParent";
export {RelocateRule,insertF} 
export * from "./Shorthand";
export let defaultValueHolder = '_$'

export function removeHoldNilValue(
  obj: object,
  valueHolder: string = defaultValueHolder
) {
  const paths = jp.paths(obj, `$..'${valueHolder}'`);
  paths.forEach((path) => {
    const value = jp.value(obj, path);
    if (_.isNil(value)) {
      _.unset(obj, toLodashPath(path));
    }
  });
  return obj;
}