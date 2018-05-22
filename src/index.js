'use strict';

import { sum, count, mean, Dataset } from './Dataset';

export default {
    data: data => new Dataset(data),
    sum,
    count,
    mean,
};
