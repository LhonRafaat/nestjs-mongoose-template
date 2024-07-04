import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getModelToken } from '@nestjs/mongoose';
import { TUser } from '../user.model';
import { Model } from 'mongoose';
import { userStub } from './user.stub';
import { IQuery, TResponse } from '../../../common/helper/common-types';
import * as bcrypt from 'bcrypt';

// Mock bcrypt.hash function
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<TUser>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<TUser>>(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user', async () => {
    jest
      .spyOn(bcrypt, 'hash')
      .mockResolvedValue(userStub().password as unknown as never);

    jest.spyOn(userModel, 'create').mockResolvedValue(userStub() as any);

    const result = await service.create(userStub());

    expect(result).toEqual(userStub());
    expect(userModel.create).toHaveBeenCalledWith(userStub());
  });

  it('should return all users', async () => {
    const findResponse: TResponse<TUser> = {
      result: [userStub()],
      count: 1,
      limit: 10,
      page: 1,
    };
    jest.spyOn(userModel, 'find').mockImplementation(
      () =>
        ({
          sort: () => ({
            clone: () => ({
              countDocuments: jest.fn().mockResolvedValue(1),
            }),
            limit: () => ({
              skip: jest.fn(),
            }),
            exec: jest.fn().mockResolvedValue([userStub()]),
          }),
        }) as any,
    );
    const result = await service.findAll(
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
    expect(userModel.find).toHaveBeenCalled();
  });

  it('should return a single user', async () => {
    jest.spyOn(userModel, 'findById').mockResolvedValue(userStub() as any);

    const result = await service.findOne(userStub()._id);

    expect(result).toEqual(userStub());
    expect(userModel.findById).toHaveBeenCalledWith(userStub()._id);
  });

  it('should update a user', async () => {
    // Mock findOne to return a user
    jest.spyOn(service, 'findOne').mockResolvedValue(userStub() as any);

    jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockResolvedValue(userStub() as any);

    const result = await service.update(userStub()._id, userStub());

    expect(result).toEqual(userStub());
    expect(service.findOne).toHaveBeenCalledWith(userStub()._id);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userStub()._id,
      userStub(),
      { runValidators: true, new: true },
    );
  });

  it('should delete a user', async () => {
    // Mock findOne to return a user
    jest.spyOn(service, 'findOne').mockResolvedValue(userStub() as any);
    jest
      .spyOn(userModel, 'findByIdAndDelete')
      .mockResolvedValue(userStub() as any);

    const result = await service.remove(userStub()._id);

    expect(result).toEqual({
      message: `User with id ${userStub()._id} deleted`,
    });
    expect(service.findOne).toHaveBeenCalledWith(userStub()._id);
    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(userStub()._id);
  });

  it('should return a user by email', async () => {
    jest.spyOn(userModel, 'findOne').mockImplementation(
      () =>
        ({
          select: jest.fn().mockResolvedValue(userStub() as any),
        }) as any,
    );

    const result = await service.findByEmail(userStub().email);
    expect(result).toEqual(userStub());
    expect(userModel.findOne).toHaveBeenCalledWith({ email: userStub().email });
  });

  it('should update user refresh token', async () => {
    jest.spyOn(userModel, 'findById').mockResolvedValue(userStub() as any);
    jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockResolvedValue(userStub() as any);

    const result = await service.updateRefreshToken(userStub()._id, 'token');
    expect(result).toEqual(userStub());
    expect(userModel.findById).toHaveBeenCalledWith(userStub()._id);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userStub()._id,
      { refreshToken: 'token' },
      { runValidators: true, new: true },
    );
  });
});
