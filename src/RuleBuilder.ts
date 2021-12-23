import { DotAsNestRule } from "./DotAsNest";
import { MapToArrayRule } from "./MapToArray";
import { Rule } from "./Shorthand";
export function applyTo(path: string) {
  return new RuleBuilder(path);
}
export class RuleBuilder {
  operation: string | undefined = undefined;
  wrapped: Rule | undefined = undefined;
  mapToArray(keyPropertyName: string = "name") {
    const ru = new MapToArrayRule(this.applyIn, keyPropertyName);
    this.withOperation(ru);
    return this;
  }
  dotAsNest(split: string = ".") {
    this.withOperation(new DotAsNestRule(this.applyIn, split));
    return this;
  }
  add() {
    this.operation = "add";
    return this;
  }
  private withOperation(ru: Rule) {
    if (this.operation) {
      switch (this.operation) {
        case "add":
          this.wrapped = this.wrapped?.add(ru);
          this.operation = undefined;
          break;
      }
    } else {
      this.wrapped = ru;
    }
  }
  build() {
    return this.wrapped!;
  }
  constructor(public applyIn: string) {}
}
