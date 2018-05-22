/* eslint-disable no-console */

import aggregate from './index.js';
import moment from 'moment';
import 'babel-polyfill';

function *range (count) {
    let ii = 0;
    while (ii < count) {
        yield ii;
        ii++;
    }
}

function randomFloat (lo, hi) {
    return (Math.random() * (hi - lo)) + lo;
}

function randomInt (lo, hi) {
    return Math.floor(randomFloat(lo, hi));
}

function randomChoice (elements) {
    return elements[randomInt(0, elements.length)];
}

function randomDate () {
    return moment([2018, randomInt(1, 5), randomInt(1, 28)]);
}

function makeData(count = 50) {
    const result = [];
    range(count).forEach(() => {
        result.push({
            name: randomChoice(['Mitchel', 'Ashley', 'Michael', 'Sadie']),
            amount: randomFloat(25, 100),
            type: randomChoice(['Check', 'Check', 'Check', 'Online', 'Cash']),
            date: randomDate(),
        });
    });
    return result;
}

const data = aggregate.data(makeData()).calculate('month', x => x.date.month());
console.log(JSON.stringify(data.groupBy('type').count().orderBy('count').value()));
console.log(JSON.stringify(data.groupBy('month').count().orderBy('month').value()));

aggregate.data([1, 3, 5]).count().value();
