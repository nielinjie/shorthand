import { JSONPath } from "jsonpath-plus";
import jsonp from "jsonpath";
const jp = {
  paths: (obj: any, path: string) => {
    return JSONPath({ path, json: obj, resultType: "path" }).map(
      JSONPath.toPathArray
    );
  },
  value: (obj: any, path: string | string[], newValue?: any) => {
    if (newValue) return jsonp.value(obj, path, newValue);
    else return jsonp.value(obj, path);
  },
  stringify: (path: string[]): string => {
    return jsonp.stringify(path);
  },
};
export default jp;
