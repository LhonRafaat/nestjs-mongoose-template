import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { IRequest } from './common-types';

@Injectable()
export class FilterationMiddleware implements NestMiddleware {
  async use(req: IRequest, res: Response, next: NextFunction) {
    let searchObj;

    searchObj = {
      [`${req.query.search}`]: {
        $regex: req.query.searchVal,
        $options: 'i',
      },
    };
    req.query.searchVal !== '' && Number.isInteger(+req.query.searchVal)
      ? (searchObj = { [`${req.query.search}`]: +req.query.searchVal })
      : (searchObj = {
          [`${req.query.search}`]: {
            $regex: req.query.searchVal,
            $options: 'i',
          },
        });

    if (!req.query.limit) {
      req.query.limit = '10';
    }
    if (!req.query.page) {
      req.query.page = '1';
    }
    if (!req.query.sort) {
      req.query.sort = 'createdAt';
    }

    //checking for date
    let dateQr = undefined;
    if (!req.query.dateField) req.query.dateField = 'createdAt';

    if (req.query.start && req.query.end)
      dateQr = {
        [req.query.dateField as string]: {
          $gte: req.query.start,
          $lte: req.query.end,
        },
      };
    req.dateQr = dateQr;
    req.searchObj = searchObj;

    const skip: number = (+req.query.page - 1) * +req.query.limit;
    req.skip = skip;

    next();
  }
}
