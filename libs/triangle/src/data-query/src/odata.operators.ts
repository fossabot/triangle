import { serializeFilter } from './odata-filtering.operators';
import { isNotNullOrEmptyString, isPresent } from './utils';

const serializeSort = function (orderby) {
  const str = orderby
    .filter(function (sort) {
      return isPresent(sort.dir);
    })
    .map(function (sort) {
      const order = sort.field.replace(/\./g, '/');
      return sort.dir === 'desc' ? order + ' desc' : order;
    })
    .join(',');
  return str ? '$orderby=' + str : str;
};
const rules = function (key, state) {
  return {
    filter: serializeFilter(state.filter || {}),
    skip  : '$skip=' + state.skip,
    sort  : serializeSort(state.sort || []),
    take  : '$top=' + state.take
  }[key];
};
export let toODataString = function (state) {
  return Object.keys(state)
    .map(function (x) {
      return rules(x, state);
    })
    .filter(isNotNullOrEmptyString)
    .join('&');
};
