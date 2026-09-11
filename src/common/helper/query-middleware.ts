import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { IRequest, queryConditions, queryObj } from './common-types';
import {
  arrayOperators,
  operators,
  paginationKeys,
  SEARCH_KEY,
} from './operators';

@Injectable()
export class QueryMiddleware implements NestMiddleware {
  async use(req: IRequest, res: Response, next: NextFunction) {
    this.addDefaultPagination(req);

    const queryObj = this.parseQueryObject(
      new Map(Object.entries(req.query as unknown as Record<string, string>)),
    );

    this.parseNumbers(queryObj?.regular);
    req.queryObj = queryObj;
    next();
  }

  addDefaultPagination(req: IRequest) {
    // Express 5 re-parses req.query on every access, so defaults can't be written back to it
    const query = req.query as Record<string, string>;
    const limit = +(query.limit || 10);
    const page = +(query.page || 1);
    req.pagination = {
      limit,
      page,
      skip: (page - 1) * limit,
      sort: query.sort || 'createdAt',
      sortBy: query.sortBy || 'desc',
    };
  }

  parseQueryObject(
    queryObj: Map<string, string>,
    parsedQueryObj?: queryObj,
  ): queryObj {
    //check if the operators are vaild
    queryObj?.forEach((value, key) => {
      //only parse queries that are not paginations
      if (this.isPagination(key)) return;

      if (key === SEARCH_KEY) {
        parsedQueryObj = { ...parsedQueryObj, search: value };
        return;
      }

      const field = this.getField(key);
      const operator = this.isValidOperator(key);
      const parsedValue = this.parseValue(operator, value);

      // a query is either a reference or a regular (possibly nested) field
      if (this.isReference(key)) {
        const [reference, ...paths] = field.replace('-ref', '').split('.');

        if (!paths.length) {
          throw new BadRequestException(
            `Missing the field to query on the reference: '(${key})', e.g. 'author.fullName-ref-contains'`,
          );
        }

        parsedQueryObj = {
          ...parsedQueryObj,
          references: {
            ...parsedQueryObj?.references,
            [reference]: { paths, value: { [operator]: parsedValue } },
          },
        };
      } else {
        parsedQueryObj = {
          ...parsedQueryObj,
          regular: {
            ...parsedQueryObj?.regular,
            [field]: { [operator]: parsedValue },
          },
        };
      }
    });

    // TODO: make it so that both options are available
    // based on users need
    this.normalizeRegexConditions(parsedQueryObj);
    return parsedQueryObj;
  }

  isValidOperator(key: string): string {
    const operator = key.split('-').pop();
    const mongoOp = operators.get(operator);
    if (!mongoOp && !paginationKeys.includes(operator)) {
      throw new BadRequestException(`Missing or invalid operator: '(${key})'`);
    }

    return mongoOp;
  }

  getField(key: string): string {
    return key.split('-').slice(0, -1).join('-');
  }

  isPagination(key: string): boolean {
    return paginationKeys.includes(key);
  }

  isNestedField(key: string): boolean {
    return key.includes('.');
  }

  isReference(key: string): boolean {
    return key.includes('-ref-');
  }

  // $in and $nin need an array, the rest are single values
  parseValue(operator: string, value: string): string | string[] {
    return arrayOperators.has(operator)
      ? value.split(',').map((item) => item.trim())
      : value;
  }

  // makes `contains` case insensitive and turns `notContains` into a negated regex,
  // for regular fields and for the values of reference queries alike
  normalizeRegexConditions(parsedQueryObj: queryObj) {
    const conditions = [
      ...Object.values(parsedQueryObj?.regular ?? {}),
      ...Object.values(parsedQueryObj?.references ?? {}).map(
        (reference) => reference.value,
      ),
    ];

    conditions.forEach((condition: queryConditions) => {
      if ('$regex' in condition) {
        condition.$options = 'i';
      }

      if ('$not' in condition) {
        condition.$not = {
          $regex: condition.$not,
          $options: 'i',
        } as unknown as string;
      }
    });
  }

  parseNumbers(obj) {
    // Recursively traverse the object
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (typeof value === 'object' && value !== null) {
          // Skip parsing if $regex operator is found
          if (key === '$regex') continue;

          // Recursively call parseNumbers on nested objects
          this.parseNumbers(value);
        } else {
          // Convert string to number if possible, an empty value is not a 0
          if (value !== '' && !isNaN(value) && key !== '$regex') {
            obj[key] = Number(value);
          }
        }
      }
    }
  }
}
