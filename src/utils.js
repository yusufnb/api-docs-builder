/**
Author: Yusuf Bhabhrawala
 */
const _ = require("lodash");

function toSchema(str) {
  const schema = { type: "object" };
  str = str.replace(/ /g, "");
  const matches = str.match(/^\{(.+)\}$/);
  if (!matches) throw new Error(`Invalid schema: ${str}`);
  schema.properties = matches[1].split(",").reduce((acc, curr) => {
    let [key, type, def] = curr.split(":");
    let required = null;
    if (type && type.match(/^\?/)) {
      type = type.replace(/^\?/, "");
      required = false;
    }
    if (type && type.match(/^\+/)) {
      type = type.replace(/^\+/, "");
      required = true;
    }
    type = type || "string";
    acc[key] = { type };
    if (def) acc[key].default = def;
    if (required !== null) acc[key].required = required;
    // acc = {type,default,required}
    return acc;
  }, {});
  return schema;
}

_.mixin({ toSchema });

function pathParameters(str) {
  let params = [];
  const matches = str.match(/\{[^\}]+\}/g);
  if (matches) {
    params = matches.map((m) => {
      const name = m.match(/^\{([^\}]+)\}$/)[1];
      let type = name.match(/id/) ? "integer" : "string";
      return { id: "path", name, schema: { type } };
    });
  }
  return params;
}
_.mixin({ pathParameters });
