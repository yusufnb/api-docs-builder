import { assert } from 'chai';
import spec from '../src';

describe('Basic add tests', () => {
  spec.reset();
  spec.server('Ss', 'SS');
  const doc = spec.swaggerDoc('Xx');
  // console.log(JSON.stringify(doc, null, 2));
  it('add servers', () => {
    assert(doc.servers[0].url, 'Ss');
  });
  it('sets title', () => {
    assert(doc.info.title, 'Xx');
  });
});
