import { Request } from 'express';

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
  user: any; // this will be any for now unitl user type is created
}
