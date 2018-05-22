import InternalDatasource from "./InternalDatasource";
import combineObjects from "./combineObjects";

export default function makeData (data, metadata = {}) {
    if (data instanceof InternalDatasource) {
        return data;
    } else if (data instanceof Array) {
        return new InternalDatasource(data, 0, metadata);
    } else {
        return new InternalDatasource([data], 0, combineObjects(metadata, {
            aggregated: true,
        }));
    }
}