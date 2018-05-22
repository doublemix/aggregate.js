'use strict';

import { sum, count, mean, Dataset } from "./Dataset";

module.exports = {
    data: data => new Dataset(data),
    sum,
    count,
    mean,
};
