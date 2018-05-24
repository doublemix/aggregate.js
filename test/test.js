'use strict';

/* eslint-disable */

var expect = require('chai').expect;
var aggregate = require('../src/index');
var { createAccessor, createNamedAccessor } = require('../src/createAccessor');
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
    });
    describe('createAccessor', function () {
        it('should work with strings', function () {
            const accessor = createAccessor('a');
            expect(accessor({ a: 1 })).to.equal(1);
            expect(accessor({ a: 2 })).to.equal(2);
        });
        it('should work with functions', function () {
            const accessor = createAccessor((input) => input.x + input.y);
            expect(accessor({ x: 1, y: 2 })).to.equal(3);
            expect(accessor({ x: 3, y: 4 })).to.equal(7);
        });
        it('should work with arrays', function () {
            const accessor = createAccessor(['x', (input) => input.x + 1]);
            expect(accessor({ x: 2 })).to.deep.equal([2, 3]);
            expect(accessor({ x: 5 })).to.deep.equal([5, 6]);
        });
        it('should not work with anything else', function () {
            expect(() => { createAccessor({}); }).to.throw();
        });
    });
    describe('createNamedAccessor', function () {
        it('should work with string', function () {
            const namedAccessor = createNamedAccessor('x');
            expect(namedAccessor).to.have.property('name', 'x');
            expect(namedAccessor.accessor({ x: 1 })).to.equal(1);
        });
        it('should work with objects', function () {
            const namedAccessor = createNamedAccessor({
                selector: 'x',
                name: 'name',
            });
            expect(namedAccessor).to.have.property('name', 'name');
            expect(namedAccessor.accessor({ x: 1 })).to.equal(1);
        });
        it('should work by passing in a name', function () {
            const namedAccessor = createNamedAccessor('x', 'name');
            expect(namedAccessor).to.have.property('name', 'name');
            expect(namedAccessor.accessor({ x: 1 })).to.equal(1);
        });
        it('should work with arrays', function () {
            const namedAccessor = createNamedAccessor(['x', 'y']);
            const obj = { x: 1, y: 2 };
            expect(namedAccessor.name).to.deep.equal(['x', 'y']);
            expect(namedAccessor.accessor(obj)).to.deep.equal([1, 2]);
        });
    });
});
