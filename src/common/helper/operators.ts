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

// these take a comma separated list: ?email-in=a@b.c,d@e.f
export const arrayOperators = new Set(['$in', '$nin']);

export const paginationKeys = ['limit', 'page', 'skip', 'sort', 'sortBy'];

// free text search across the text fields of the model, handled by buildQueryFilter
export const SEARCH_KEY = 'search';
