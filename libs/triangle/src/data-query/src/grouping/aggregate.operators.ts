import { exec, map, aggregatesCombinator, expandAggregates } from '../transducers';

export interface AggregateDescriptor {
  field: string;
  aggregate: 'count' | 'sum' | 'average' | 'min' | 'max';
}

const identity = map(function (x) {
  return x;
});

export function aggregateBy(data, descriptors = [], transformers = identity) {
  const initialValue = {};
  if (!descriptors.length) {
    return initialValue;
  }
  const result = exec(transformers(aggregatesCombinator(descriptors)), initialValue, data);
  return expandAggregates(result);
}
