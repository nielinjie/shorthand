import Joi from "joi";
import { validateAnd } from "./ShortOnParent";
import yaml from "js-yaml";

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
  s.$_getRule;
});

test("describe", () => {
  const s = Joi.object({ a: Joi.string().required(), b: Joi.string() });
  const de = s.describe();
  expect(de).toBeDefined();
  const string = {
    type: "object",
    keys: {
      a: { type: "string", flags: { presence: "required" } },
      b: { type: "string" },
    },
  };
  const s2 = Joi.build(de);
  const v = { a: "hello" };
  const r = s2.validate(v);
  expect(r.error).toBeUndefined();
  const s3 = Joi.build(string);
  const r2 = s3.validate(v);
  expect(r2.error).toBeUndefined();
});


function dump(obj) {
  console.log(yaml.dump(obj));
}
