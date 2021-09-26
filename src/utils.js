/**
Author: Yusuf Bhabhrawala
 */
const _ = require("lodash");

function toSchema(str, isArray = false) {
  str = str.replace(/ /g, "");

  let matches;

  matches = str.match(/^\[(.+)\]$/);
  if (matches) { str = matches[1]; isArray = true; }

  matches = str.match(/^\{(.+)\}$/);
  if (matches) str = matches[1];

  const schema = { type: "object" };
  schema.properties = str.split(",").reduce((acc, curr) => {
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
  if (isArray) return { type: "array", items: schema };
  else return schema;
}

_.mixin({ toSchema });

function pathParameters(str) {
  let params = [];
  const matches = str.match(/\{[^\}]+\}/g);
  if (matches) {
    params = matches.map((m) => {
      const name = m.match(/^\{([^\}]+)\}$/)[1];
      let type = name.match(/id/) ? "integer" : "string";
      return { in: "path", name, schema: { type } };
    });
  }
  return params;
}
_.mixin({ pathParameters });

// header:?token
function toParameter(str) {
  if (!_.isString(str)) return str;
  let [type, name] = str.split(":");
  let required = true;
  if (name.match(/^\?/)) {
    name = name.replace(/^\?/, "");
    required = false;
  }
  return {
    name,
    in: type,
    required,
    type: "string"
  }
}
_.mixin({ toParameter });
