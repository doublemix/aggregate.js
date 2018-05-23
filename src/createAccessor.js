const identity = x => x;

export function createAccessor (selector = identity) {
    if (typeof selector === 'string' || selector instanceof String) {
        return x => x[selector];
    } else if (selector instanceof Array) {
        const selectorArray = selector.map(createAccessor);
        return x => selectorArray.map(s => s(x));
    } else if (selector instanceof Function) {
        return selector;
    } else {
        throw new Error('Not a valid selector');
    }
}

export function createNamedAccessor (selector = identity, inName = undefined) {
    const name = inName || ((typeof selector === 'string') ? selector : undefined);
    if (selector instanceof Array) {
        const selectorArray = selector.map(s => createNamedAccessor(s));
        return {
            accessor: x => selectorArray.map(s => s.accessor(x)),
            name: selectorArray.map(s => s.name),
        };
    } else if (selector instanceof Object) {
        return {
            accessor: createAccessor(selector.selector),
            name: selector.name,
        };
    } else {
        return {
            accessor: createAccessor(selector),
            name,
        };
    }
}
