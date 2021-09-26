/**
  Author: Yusuf Bhabhrawala
 */
require("./utils");
const _ = require("lodash");

const paths = {};
const components = {};
const tags = [];
const servers = [];

function reset() {
  Object.keys(paths).forEach(key => delete paths[key]);
  Object.keys(components).forEach(key => delete paths[key]);
  tags.splice(0, tags.length);
  servers.splice(0, servers.length);
}

let overrides = {};
function start(opt) {
  overrides = opt;
}

function end() {
  overrides = {};
}

function server(url, description) {
  servers.push({ url, description });
}

/**
  opt = {path, method, tag=null, summary, description, 
      parameters=[], requestBody, 
      responses, 200,
      deprecated=false, prefix}
 */
function api(opt) {
  const spec = {};
  opt = Object.assign({}, { parameters: [], responses: {} }, overrides, opt);
  if (opt.prefix) opt.path = opt.prefix + opt.path;

  // Parameters
  opt.parameters = opt.parameters.map(param => _.toParameter(param));
  const pathParams = _.pathParameters(opt.path);
  if (pathParams.length > 0) opt.parameters = opt.parameters.concat(pathParams);
  spec.parameters = opt.parameters;

  // Other attributes
  if (opt.tag) spec.tags = [opt.tag];
  if (opt.summary) spec.summary = opt.summary;
  if (opt.description) spec.description = opt.description;
  if (opt.deprecated) spec.deprecated = opt.deprecated;

  // Request
  if (opt.method !== "get" && opt.requestBody && _.isString(opt.requestBody)) {
    let schema = opt.requestBody.match(/^#/) ? { $ref : opt.requestBody } : _.toSchema(opt.requestBody);
    spec.requestBody = {
      content: { "application/json": { schema } },
    };
  }
  // Responses
  Object.keys(opt).filter(k => k.match(/^[0-9]+$/)).forEach((code) => {
    if (opt[code] && _.isString(opt[code])) {
      let schema = opt[code].match(/^#/) ? { $ref : opt[code] } : _.toSchema(opt[code]);
      opt.responses[code] = {
        content: { "application/json": { schema } },
      };
    }
  });
  spec.responses = opt.responses;

  _.set(paths, `${opt.path}.${opt.method}`, spec);
}

function get(path = "", opt = {}) {
  opt.method = "get";
  opt.path = path;
  api(opt);
}

function post(path = "", opt = {}) {
  opt.method = "post";
  opt.path = path;
  api(opt);
}

function put(path = "", opt = {}) {
  opt.method = "put";
  opt.path = path;
  api(opt);
}

function patch(path = "", opt = {}) {
  opt.method = "patch";
  opt.path = path;
  api(opt);
}

function del(path = "", opt = {}) {
  opt.method = "delete";
  opt.path = path;
  api(opt);
}

function ref({ type, name, def }) {
  components[type] = components[type] || {};
  components[type][name] = def;
  return `#/components/${type}/${name}`;
}

function schema(name, def) {
  if (_.isString(def)) def = _.toSchema(def);
  ref({ type: "schemas", name, def });
  return `#/components/schemas/${name}`;
}

function parameter(name, def) {
  ref({ type: "parameters", name, def });
  return `#/components/parameters/${name}`;
}

function response(name, def) {
  ref({ type: "responses", name, def });
  return `#/components/responses/${name}`;
}

function header(name, def) {
  ref({ type: "headers", name, def });
  return `#/components/headers/${name}`;
}

function tag(name, description) {
  tags.push({ name, description });
}

function swaggerDoc(title = "API Docs") {
  return {
    info: { title, version: "1.0.0" },
    openapi: "3.0.0",
    servers,
    tags,
    paths,
    components,
  };
}

module.exports = {
  tag,
  server,
  ref,
  schema,
  parameter,
  response,
  header,
  api,
  get,
  post,
  put,
  patch,
  del,
  start,
  end,
  swaggerDoc,
  reset
};
