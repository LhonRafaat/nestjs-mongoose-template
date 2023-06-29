import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function QueryTypes() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({
      name: 'sort',
      required: false,
      type: String,
      description: 'ex sort=price',
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      type: String,
      enum: ['asc', 'desc'],
      description: 'ascending or descending for the sort field',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'name of the field to search for. ex ?search=name',
    }),
    ApiQuery({
      name: 'searchVal',
      required: false,
      type: String,
      description:
        'value of the searched field. ex ?search=name&searchVal=lhon',
    }),
    ApiQuery({
      name: 'dateField',
      required: false,
      type: String,
      description:
        'name of the date field you want to query for. By default is createdAt',
    }),
    ApiQuery({
      name: 'start',
      required: false,
      type: String,
      description:
        'start of the date. ex ?start=2023-03-27T13:07:36.701Z&end=2023-03-27T13:07:36.701Z',
    }),
    ApiQuery({
      name: 'end',
      required: false,
      type: String,
      description:
        'end of the date. ex ?start=2023-03-27T13:07:36.701Z&end=2023-03-27T13:07:36.701Z',
    }),
  );
}
