'use strict';

/* eslint-disable */

var expect = require('chai').expect;
var aggregate = require('../src/index').default;
const lodash = require('lodash/orderBy');

describe('data', function () {
    it('aggregation', function () {
        const data = aggregate.data([1, 3, 5]);
        expect(data.sum().value()).to.deep.equal(9);
        expect(data.mean().value()).to.deep.equal(3);
        expect(data.count().value()).to.equal(3);
    });
    it('calculate', function () {
        const data = aggregate.data([{ a: 1, b: 2}, { a: 3, b: 4 }]);
        expect(data.calculate('c', (datum) => datum.a + datum.b).value())
            .to.deep.equal([
                { a: 1, b: 2, c: 3 },
                { a: 3, b: 4, c: 7 },
            ]);
    })
});
