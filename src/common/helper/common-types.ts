import { Request } from 'express';
import { TUser } from '../../modules/users/user.model';

export interface SearchObj {
  [key: string]:
    | number
    | {
        $regex: string;
        $options: string;
      };
}

interface DateQuery {
  [key: string]: {
    $gte: string;
    $lte: string;
  };
}

export interface IRequest extends Request {
  searchObj: SearchObj;
  dateQr: DateQuery;
  skip: number;
  user: TUser;
}
