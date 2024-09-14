export const operators = new Map([
  ['equals', '$eq'],
  ['notEquals', '$ne'],
  ['lessThan', '$lt'],
  ['lessThanOrEqual', '$lte'],
  ['greaterThan', '$gt'],
  ['greaterThanOrEqual', '$gte'],
  ['in', '$in'],
  ['notIn', '$nin'],
  ['contains', '$regex'],
  ['notContains', '$not'],
]);

export const paginationKeys = ['limit', 'page', 'skip', 'sort', 'sortBy'];
