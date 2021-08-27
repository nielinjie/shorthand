import Joi from "joi";
import { validateAnd } from "./ShortOnParent";

test("schema", () => {
  const s = Joi.object({ a: Joi.string() });
  const b = s.keys({ b: Joi.string().required() });
  const v = { a: "hello" };
  const r = b.validate(v);
  expect(r.error).toEqual(
    expect.objectContaining({
      details: expect.arrayContaining([
        expect.objectContaining({ message: '"b" is required' }),
      ]),
      message: '"b" is required',
    })
  );
});
test("schema add rule on same key", () => {
  const s = Joi.object({ a: Joi.string(), b: Joi.string() });
  const b = s.keys({ b: Joi.required() });
  const v = { a: "hello" };
  const r = b.validate(v);
  expect(r.error).toEqual(
    expect.objectContaining({
      details: expect.arrayContaining([
        expect.objectContaining({ message: '"b" is required' }),
      ]),
      message: '"b" is required',
    })
  );
});
test("schema add rule on same key", () => {
  const s = Joi.object({ a: Joi.string(), b: Joi.string() });
  const b = Joi.object({ b: Joi.required() });
  const v = { a: "hello" };
  const r = validateAnd(v, s, b);
  expect(r.error).toEqual(
    expect.objectContaining({
      details: expect.arrayContaining([
        expect.objectContaining({ message: '"b" is required' }),
      ]),
      message: '"b" is required',
    })
  );
  s.$_getRule
});
