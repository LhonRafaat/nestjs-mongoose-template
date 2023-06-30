import { Request } from 'express';
import { TUser } from '../../modules/users/user.model';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { InferSubjects } from '@casl/ability';

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

export const getResponseType = (Type: any) => {
  return {
    schema: {
      allOf: [
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(Type) },
            },

            count: {
              type: 'number',
              default: 0,
            },
            page: {
              type: 'number',
              default: 0,
            },
            limit: {
              type: 'number',
              default: 0,
            },
          },
        },
      ],
    },
  };
};

export class TResponse<T> {
  @ApiProperty()
  result: T[];

  @ApiProperty()
  count: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export interface IQuery {
  limit: number;
  page: number;
  sort: string;
  orderBy: string;
  search: string[];
  searchVal: string[] | number[];
  start: string;
  end: string;
}

export type Subjects = InferSubjects<typeof TUser | 'all'>;

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export interface RequiredRule {
  subject: Subjects;
  action: Action;
}
