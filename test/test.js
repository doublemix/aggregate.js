'use strict';

var expect = require('chai').expect;
var aggregate = require('../src/index');
const lodash = require('lodash/orderBy');

describe('test', function () {
    it('basic numerical aggregates', function () {
        const data = aggregate.data([1, 3, 5]);
        expect(data.sum().value()).to.deep.equal(9);
        expect(data.mean().value()).to.deep.equal(3);
        expect(data.count().value()).to.equal(3);
    });
});
