import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { IRequest, queryObj } from './common-types';
import { operators, paginationKeys } from './operators';

@Injectable()
export class QueryMiddleware implements NestMiddleware {
  async use(req: IRequest, res: Response, next: NextFunction) {
    let parsedQueryObj: queryObj;

    this.addDefaultPagination(req);

    const queryObj = this.parseQueryObject(
      new Map(Object.entries(req.query as unknown as Record<string, string>)),
      parsedQueryObj,
    );

    this.parseNumbers(queryObj?.regular);
    req.queryObj = queryObj;
    next();
  }

  addDefaultPagination(req: IRequest) {
    req.query.limit = (req.query.limit || '10') as string;
    req.query.page = (req.query.page || '1') as string;
    req.query.skip = ((+req.query.page - 1) * +req.query.limit).toString();
    req.query.sort = (req.query.sort || 'createdAt') as string;
    req.query.sortBy = (req.query.sortBy || 'desc') as string;
    req.pagination = {
      limit: +req.query.limit,
      page: +req.query.page,
      skip: +req.query.skip,
      sort: req.query.sort,
      sortBy: req.query.sortBy,
    };
  }

  parseQueryObject(
    queryObj: Map<string, string>,
    parsedQueryObj: queryObj,
  ): queryObj {
    //check if the operators are vaild
    queryObj?.forEach((value, key) => {
      const field = this.getField(key);

      const isPagination = this.isPagination(key);

      //only parse queries that are not paginations
      if (!isPagination) {
        const operator = this.isValidOperator(key);

        // a query is either a nested field or a regular field
        // a nested field can either be a reference or a regular field
        if (this.isNestedField(key)) {
          if (this.isReference(key)) {
            const splitByDot = field.replace('-ref', '').split('.');
            const referenceField = splitByDot[0];
            const others = splitByDot.slice(1);
            const addOptionsI = operator === '$regex';

            parsedQueryObj = {
              ...parsedQueryObj,
              references: {
                ...parsedQueryObj?.references,
                [referenceField]: {
                  paths: [...others],
                  value: addOptionsI
                    ? {
                        [operator]: value,
                        $options: 'i',
                      }
                    : {
                        [operator]: value,
                      },
                },
              },
            };
          } else {
            parsedQueryObj = {
              ...parsedQueryObj,
              regular: {
                ...parsedQueryObj?.regular,
                [field]: { [operator]: value },
              },
            };
          }
        } else {
          parsedQueryObj = {
            ...parsedQueryObj,
            regular: {
              ...parsedQueryObj?.regular,
              [field]: { [operator]: value },
            },
          };
        }
      }
    });

    // add options i if the operator is regex
    // TODO: make it so that both options are available
    // based on users need

    this.addOptionsIfRegex(parsedQueryObj);
    this.addRegexIfNot(parsedQueryObj);
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

  addOptionsIfRegex(parsedQueryObj: queryObj) {
    if (!parsedQueryObj?.regular) return;
    Object.keys(parsedQueryObj?.regular).map((key) => {
      Object.keys(parsedQueryObj?.regular[key]).map((k) => {
        if (k === '$regex') {
          parsedQueryObj.regular[key] = {
            ...parsedQueryObj.regular[key],
            $options: 'i',
          };
        }
      });
    });
  }
  addRegexIfNot(queryObj: queryObj) {
    if (!queryObj?.regular) return;
    Object.keys(queryObj?.regular).map((key) => {
      Object.keys(queryObj?.regular[key]).map((k) => {
        if (k === '$not') {
          queryObj.regular[key] = {
            [`$not`]: {
              $regex: queryObj.regular[key].$not,
              $options: 'i',
            } as unknown as string,
          };
        }
      });
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
          // Convert string to number if possible
          if (!isNaN(value) && key !== '$regex') {
            obj[key] = Number(value);
          }
        }
      }
    }
  }
}
