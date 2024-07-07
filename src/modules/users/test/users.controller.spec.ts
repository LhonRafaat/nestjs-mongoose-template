import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { getModelToken } from '@nestjs/mongoose';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory/casl-ability.factory';
import { IQuery, TResponse } from '../../../common/helper/common-types';
import { TUser } from '../user.model';
import { userStub } from './user.stub';
import * as bcrypt from 'bcrypt';

describe('UsersController', () => {
  let userController: UsersController;
  let userService: UsersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
        CaslAbilityFactory,
      ],
    }).compile();

    userController = app.get<UsersController>(UsersController);
    userService = app.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('should return all users', async () => {
    const findResponse: TResponse<TUser> = {
      result: [userStub()],
      count: 1,
      limit: 10,
      page: 1,
    };

    jest.spyOn(userService, 'findAll').mockResolvedValue(findResponse);
    const result = await userController.findAll(
      {
        dateQr: {},
        searchObj: {},
        skip: 0,
      } as any,
      {
        sort: 'createdAt',
        orderBy: 'desc',
        limit: 10,
        page: 1,
      } as IQuery,
    );
    expect(result).toEqual(findResponse);
  });

  it('should return one user', async () => {
    jest.spyOn(userService, 'findOne').mockResolvedValue(userStub());
    const result = await userController.findOne(userStub()._id);
    expect(result).toEqual(userStub());
  });

  it('should return me', async () => {
    jest.spyOn(userService, 'findOne').mockResolvedValue(userStub());
    const result = await userController.getMe({
      user: userStub(),
    } as any);
    expect(result).toEqual(userStub());
  });

  it('should return a user by id', async () => {
    jest.spyOn(userService, 'findOne').mockResolvedValue(userStub());
    const result = await userController.findOne(userStub()._id);
    expect(result).toEqual(userStub());
  });

  it('should delete a user', async () => {
    jest
      .spyOn(userService, 'remove')
      .mockResolvedValue({ message: `User with id ${userStub()._id} deleted` });
    const result = await userController.remove(userStub()._id);
    expect(result).toEqual({
      message: `User with id ${userStub()._id} deleted`,
    });
  });
});
