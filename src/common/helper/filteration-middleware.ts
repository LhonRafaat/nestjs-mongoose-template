import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { IRequest } from './common-types';
import { isArray } from 'class-validator';

@Injectable()
export class FilterationMiddleware implements NestMiddleware {
  async use(req: IRequest, res: Response, next: NextFunction) {
    let searchObj;

    if (isArray(req.query.search) && isArray(req.query.searchVal)) {
      if (req.query.search?.length !== req.query.searchVal?.length)
        throw new BadRequestException(
          'Please make sure your search queries match',
        );
      req.query.search.forEach((el, index) => {
        if (
          req.query.searchVal[index] !== '' &&
          Number.isInteger(+req.query.searchVal[index])
        ) {
          searchObj = {
            ...searchObj,
            [`${el}`]: +req.query.searchVal[index],
          };
        } else {
          if (el)
            searchObj = {
              ...searchObj,
              [`${el}`]: {
                $regex: req.query.searchVal[index],
                $options: 'i',
              },
            };
        }
      });
    } else {
      req.query.searchVal !== '' && Number.isInteger(+req.query.searchVal)
        ? (searchObj = { [`${req.query.search}`]: +req.query.searchVal })
        : req.query.search &&
          (searchObj = {
            [`${req.query.search}`]: {
              $regex: req.query.searchVal,
              $options: 'i',
            },
          });
    }
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

    if (req.query.start || req.query.end) {
      dateQr = {};

      // if start exists add it to the dateQr
      if (req.query.start) {
        dateQr[req.query.dateField as string] = {
          ...dateQr[req.query.dateField as string],
          $gte: req.query.start,
        };
      }

      // if end exists add it to the dateQr
      if (req.query.end) {
        dateQr[req.query.dateField as string] = {
          ...dateQr[req.query.dateField as string],
          $lte: req.query.end,
        };
      }
    }
    req.dateQr = dateQr;
    req.searchObj = searchObj;

    const skip: number = (+req.query.page - 1) * +req.query.limit;
    req.skip = skip;

    next();
  }
}
