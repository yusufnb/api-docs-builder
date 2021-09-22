/* eslint-disable no-console */
const docs = require('../src');

docs.ref({type: "schemas", name: "user", def: {hello: "world"}});
docs.schema('user', '{id,name:?integer:yusuf,password:+}');
docs.get('/api/{id}',{});
const spec = docs.swaggerDoc();
console.log(JSON.stringify(spec, null, 2));
