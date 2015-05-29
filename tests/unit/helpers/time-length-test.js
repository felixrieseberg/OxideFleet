import {
  timeLength
} from '../../../helpers/time-length';
import { module, test } from 'qunit';

module('TimeLengthHelper');

// Replace this with your real tests.
test('it works', function(assert) {
    var result = timeLength(['2015-05-26T17:06:14.407Z', '2015-05-25T17:06:14.407Z']);
    
    assert.equal(result, 'a day');
});
