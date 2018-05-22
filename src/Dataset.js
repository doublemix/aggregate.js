import makeData from './makeData';
import { createNamedAccessor, createAccessor } from './createAccessor';
import InternalDatasource from './InternalDatasource';
import deepEqual from 'deep-equal';
import { orderBy } from 'lodash';
import combineObjects from './combineObjects';


function partition (data, accessor) {
    const result = [];
    for (const datum of data) {
        const value = accessor(datum);
        const bucket = result.find(b => deepEqual(b.value, value, { strict: true }));
        if (bucket === undefined) {
            result.push({ value, items: [datum] });
        } else {
            bucket.items.push(datum);
        }
    }
    return result;
}

function applyGrouping (datasource, groupers) {
    if (datasource.level > 0) {
        return new InternalDatasource(datasource.data.map(group => applyGrouping(group, groupers)), datasource.level + 1, datasource.metadata);
    } else {
        return new InternalDatasource(
            partition(datasource.data, groupers.accessor)
                .map(({ value, items }) =>
                    new InternalDatasource(items, 0, combineObjects(
                        datasource.metadata,
                        {
                            grouping: {
                                values: groupers.name.reduce((prev, curr, index) => {
                                    if (curr !== undefined) {
                                        prev[curr] = value[index];
                                    }
                                    return prev;
                                }, {}),
                            },
                        },
                    ))),
            1,
            datasource.metadata,
        );
    }
}

function applyAggregate (datasource, aggregator) {
    if (datasource.level === 0) {
        return new InternalDatasource([aggregator(datasource.data)], 0, { aggregated: true });
    } else if (datasource.level === 1) {
        const data = datasource.data.map(datum => combineObjects(
            datum.getMetadata('grouping', { values: {} }).values,
            aggregator(datum.data),
        ));
        return new InternalDatasource(data, 0, datasource.metadata);
    } else {
        return new InternalDatasource(datasource.data.map(group => applyAggregate(group, aggregator)), datasource.level - 1, datasource.metadata);
    }
}

function applyFilter (datasource, predicate) {
    // TODO remove empty nodes
    if (datasource.level > 0) {
        const data = datasource.data.map(datum => applyFilter(datum, predicate));
        return new InternalDatasource(data, datasource.level, datasource.metadata);
    } else {
        const data = datasource.data.filter(predicate);
        return new InternalDatasource(data, 0, datasource.metadata);
    }
}

function applyMap (datasource, mapper) {
    if (datasource.level > 0) {
        const data = datasource.data.map(datum => applyMap(datum, mapper));
        return new InternalDatasource(data, datasource.level, datasource.metadata);
    } else {
        const data = datasource.data.map(mapper);
        return new InternalDatasource(data, 0, datasource.metadata);
    }
}

function applyOrderBy (datasource, orderers) {
    if (datasource.level > 0) {
        const data = datasource.data.map(datum => applyOrderBy(datum, orderers));
        return new InternalDatasource(data, datasource.level, datasource.metadata);
    } else {
        const data = orderBy(datasource.data, orderers);
        return new InternalDatasource(data, 0, datasource.metadata);
    }
}

function createValue (data) {
    if (data instanceof InternalDatasource) {
        return data.data.map(group => createValue(group));
    } else {
        return data;
    }
}

export function sum (items, selector) {
    const accessor = createAccessor(selector);
    return items.reduce((prev, next) => prev + accessor(next), 0);
}

export function count (items) {
    return items.length;
}

export function mean (items, selector) {
    const accessor = createAccessor(selector);
    return sum(items, accessor) / count(items);
}

export class Dataset {
    constructor (initData, metadata) {
        this.data = makeData(initData, metadata);
    }
    groupBy (inSelectors) {
        const selectors = (inSelectors instanceof Array) ? inSelectors : [inSelectors];
        const accessor = createNamedAccessor(selectors);
        return new Dataset(applyGrouping(this.data, accessor));
    }
    aggregate (inAggregators) {
        if (inAggregators instanceof Function) {
            // numerical aggregation
            return new Dataset(applyAggregate(this.data, inAggregators));
        }
        // else
        const aggregators = (inAggregators instanceof Array) ? inAggregators : [inAggregators];
        const aggregator = datum => aggregators.reduce((prev, agg) => {
            prev[agg.name] = agg.aggregator(datum);
            return prev;
        }, {});
        return new Dataset(applyAggregate(this.data, aggregator));
    }
    filter (predicateSelector) {
        const predicate = createAccessor(predicateSelector);
        return new Dataset(applyFilter(this.data, predicate));
    }
    map (mapperSelector) {
        const mapper = createAccessor(mapperSelector);
        return new Dataset(applyMap(this.data, mapper));
    }
    orderBy (inSelectors) {
        const selectors = (inSelectors instanceof Array) ? inSelectors : [inSelectors];
        const accessors = selectors.map(createAccessor);
        return new Dataset(applyOrderBy(this.data, accessors));
    }
    value () {
        if (this.data.getMetadata('aggregated', false)) {
            return this.data.data[0];
        } else {
            return createValue(this.data);
        }
    }
    sum (selector = undefined, inName = undefined) {
        if (this.data.getMetadata('datatype') === 'number') {
            return this.aggregate(sum);
        }
        const { accessor, name } = createNamedAccessor(selector);
        return this.aggregate({
            aggregator: items => sum(items, accessor),
            name: inName || (name && `sum(${name})`) || 'sum',
        });
    }
    count (inName = undefined) {
        if (this.data.getMetadata('datatype') === 'number') {
            return this.aggregate(count);
        }
        return this.aggregate({
            aggregator: count,
            name: inName || 'count',
        });
    }
    mean (selector = undefined, inName = undefined) {
        if (this.data.getMetadata('datatype') === 'number') {
            return this.aggregate(mean);
        }
        const { accessor, name } = createNamedAccessor(selector);
        return this.aggregate({
            aggregator: items => mean(items, accessor),
            name: inName || (name && `mean(${name})`) || 'mean',
        });
    }
    calculate (name, selector) {
        const accessor = createAccessor(selector);
        return this.map(x => combineObjects(x, {
            [name]: accessor(x),
        }));
    }
}
