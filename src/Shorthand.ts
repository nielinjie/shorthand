
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
  run(obj: object): [object, Log[]];
}
export abstract class Rule implements Rule {
  add(r: Rule): Rule {
    const outer = this;
    class R extends Rule {
      run(obj: object): [object, Log[]] {
        const a = outer.run(obj);
        const b = r.run(a[0]);
        return [b[0], a[1].concat(b[1])];
      }
    }
    return new R();
  }
}

export function chain(...rules:Rule[]):Rule{
  const [head,...rest] = rules
  return rest.reduce((a,b)=>a.add(b),head);
}