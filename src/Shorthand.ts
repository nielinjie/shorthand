export type Result = [any, Log[]];
export interface Log {
  message: string;
  path: string;
  level: "info" | "warn" | "error";
}

export function info(message: string, path: string = ""): Log {
  return { message, path, level: "info" };
}

export function warn(message: string, path: string = ""): Log {
  return { message, path, level: "warn" };
}

export interface Rule {
  run(obj: object): Result;
}
export abstract class Rule implements Rule {
  debugFun?: (result: Result) => void = undefined
  add(r: Rule): Rule {
    const outer = this;
    class R extends Rule {
      run(obj: object): Result {
        const a = outer.run(obj);
        this.debugFun?.(a);
        const b = r.run(a[0]);
        this.debugFun?.(b);
        return [b[0], a[1].concat(b[1])];
      }
    }
    const n= new R();
    n.debugFun=this.debugFun
    return n
  }
  setDebug(fun: (result: Result) => void) {
    this.debugFun = fun;
  }
}

export function chain(...rules: Rule[]): Rule {
  const [head, ...rest] = rules;
  return rest.reduce((a, b) => a.add(b), head);
}
