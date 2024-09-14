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

    this.parseQueryObject(
      new Map(Object.entries(req.query as unknown as Record<string, string>)),
      parsedQueryObj,
    );

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
    queryObj.forEach((value, key) => {
      const operator = this.isValidOperator(key);
      const field = this.getField(key);

      const isPagination = this.isPagination(key);

      if (!isPagination) {
        if (this.isNestedField(key)) {
        }
        parsedQueryObj = {
          ...parsedQueryObj,
          regular: { [field]: { [operator]: value } },
        };
      }
    });

    console.log(parsedQueryObj);

    return parsedQueryObj;
  }

  isValidOperator(key: string): string {
    const operator = key.split('-').pop();
    const mongoOp = operators.get(operator);
    if (!operator && !paginationKeys.includes(operator)) {
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
}
