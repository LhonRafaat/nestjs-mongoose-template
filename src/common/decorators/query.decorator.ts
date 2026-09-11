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
      description: `Case insensitive search across all the text fields, ex search=lee

        Any field can also be filtered with this format:
          ?[field]-[operator]=[value]

        e.g:
          ?fullName-contains=test
          ?email-in=a@b.c,d@e.f
          ?author.fullName-ref-contains=test

        Check README.md for for details.

        `,
    }),
  );
}
