import yaml from "js-yaml";
test("yaml with dot key", () => {
  const yamlString = `
    a.b: 1
    `;
  const result = yaml.load(yamlString);
  expect(result).toEqual({ "a.b": 1 });
});
