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
function start(obj) {
  overrides = obj;
}

function end() {
  overrides = {};
}

function server(url, description) {
  servers.push({ url, description });
}

/**
  obj = {path, method, tag=null, summary, description, 
      parameters=[], requestBody, 
      responses, 200,
      deprecated=false, prefix}
 */
function api(obj) {
  const spec = {};
  Object.assign(obj, { parameters: [], responses: {} }, overrides);
  if (obj.prefix) obj.path = obj.prefix + obj.path;

  // Parameters
  const pathParams = _.pathParameters(obj.path);
  if (pathParams.length > 0) obj.parameters = obj.parameters.concat(pathParams);
  spec.parameters = obj.parameters;

  // Other attributes
  if (obj.tag) spec.tags = [obj.tag];
  if (obj.summary) spec.summary = obj.summary;
  if (obj.description) spec.description = obj.description;
  if (obj.deprecated) spec.deprecated = obj.deprecated;

  // Request
  if (obj.method !== "get" && obj.requestBody && _.isString(obj.requestBody)) {
    spec.requestBody = {
      content: { "application/json": { schema: { $ref: obj.requestBody } } },
    };
  }
  // Responses
  ['200', '201', '204', '400', '401', '403', '404', '500'].forEach((code) => {
    if (_.isString(obj[code])) {
      obj.responses[code] = {
        content: { "application/json": { schema: { $ref: obj[code] } } },
      };
    }
  });
  spec.responses = obj.responses;

  _.set(paths, `${obj.path}.${obj.method}`, spec);
}

function get(path = "", obj = {}) {
  obj.method = "get";
  obj.path = path;
  api(obj);
}

function post(path = "", obj = {}) {
  obj.method = "post";
  obj.path = path;
  api(obj);
}

function put(path = "", obj = {}) {
  obj.method = "put";
  obj.path = path;
  api(obj);
}

function patch(path = "", obj = {}) {
  obj.method = "patch";
  obj.path = path;
  api(obj);
}

function del(path = "", obj = {}) {
  obj.method = "delete";
  obj.path = path;
  api(obj);
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
