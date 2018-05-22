import combineObjects from "./combineObjects";

const emptyMetadata = {};

export default class InternalDatasource {
    constructor (data, level, metadata = emptyMetadata) {
        this.data = data;
        this.level = level;
        this.metadata = metadata;

        // determine if dataset is numerical or object based
        if (this.metadata.datatype === undefined) {
            if (this.data.length === 0 || !(typeof this.data[0] === "number" || this.data[0] instanceof Number)) {
                // assume object unless otherwise told, or the first value is a number
                this.metadata = combineObjects(this.metadata, {
                    datatype: "object",
                });
            } else {
                this.metadata = combineObjects(this.metadata, {
                    datatype: "number",
                });
            }
        }
    }
    getMetadata (name, defaultValue = undefined) {
        const value = this.metadata[name];
        return value === undefined ? defaultValue : value;
    }
}
