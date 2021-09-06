import { clone, setWith, curry } from "lodash/fp";

// export const setIn = curry((path, value, obj) =>
//   setWith(clone, path, value, clone(obj)),
// );
export const setIn = curry((obj, path, value) =>
  setWith(clone, path, value, clone(obj))
);
export function notNil<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}