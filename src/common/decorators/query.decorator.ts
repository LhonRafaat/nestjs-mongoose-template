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
      name: 'sortBy',
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
      name: '_',
      required: false,
      type: String,
      description: `You can query for any field using this format: 
          ?[field]-[operator]=[value]
          
          e.g: 
          ?fullName-contains=test

          Check README.md for for details.
        
        `,
    }),
  );
}
