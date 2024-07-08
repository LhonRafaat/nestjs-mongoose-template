import { Model } from 'mongoose';
import { TUser } from '../../users/user.model';
import { AuthService } from '../auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { userStub } from '../../users/test/user.stub';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: Model<TUser>;
  let userService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        AuthService,
        UsersService,
        JwtService,
        ConfigService,
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

    authService = app.get<AuthService>(AuthService);
    userService = app.get<UsersService>(UsersService);
    userModel = app.get<Model<TUser>>(getModelToken('User'));
    jwtService = app.get<JwtService>(JwtService);
    configService = app.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should validate user', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(userStub() as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as unknown as never);
    jest.spyOn(authService, 'getTokens').mockResolvedValue({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    } as any);
    jest.spyOn(authService, 'updateRefreshToken').mockResolvedValue(null);

    const result = await authService.validateUser({
      email: userStub().email,
      password: userStub().password,
    });

    expect(result).toEqual({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
    expect(userService.findByEmail).toHaveBeenCalledWith(userStub().email);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      userStub().password,
      userStub().password,
    );
    expect(authService.getTokens).toHaveBeenCalledWith({
      _id: userStub()._id,
      fullName: userStub().fullName,
    });
    expect(authService.updateRefreshToken).toHaveBeenCalledWith(
      userStub()._id,
      'refresh_token',
    );
  });

  it('should throw UnauthorizedException when validating user with incorrect credentials', async () => {
    // remove the mock resolved value on findByEmail to simulate wrong email
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(userStub() as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as unknown as never);

    await expect(
      authService.validateUser({
        email: userStub().email,
        password: 'wrong_password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should register user', async () => {
    jest.spyOn(userService, 'create').mockResolvedValue(userStub() as any);
    jest.spyOn(authService, 'getTokens').mockResolvedValue({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    } as any);
    jest.spyOn(authService, 'updateRefreshToken').mockResolvedValue(null);

    const result = await authService.register({
      email: userStub().email,
      password: userStub().password,
      fullName: userStub().fullName,
      avatar: userStub().avatar,
    });

    expect(result).toEqual({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
    expect(userService.create).toHaveBeenCalledWith({
      email: userStub().email,
      password: userStub().password,
      fullName: userStub().fullName,
      avatar: userStub().avatar,
    });
    expect(authService.getTokens).toHaveBeenCalledWith({
      _id: userStub()._id,
      fullName: userStub().fullName,
    });
    expect(authService.updateRefreshToken).toHaveBeenCalledWith(
      userStub()._id,
      'refresh_token',
    );
  });

  it('should get tokens', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'ACCESS_SECRET':
          return 'access_secret';
        case 'ACCESS_TOKEN_EXPIRATION':
          return '1h';
        case 'REFRESH_SECRET':
          return 'refresh_secret';
        case 'REFRESH_TOKEN_EXPIRATION':
          return '7d';
        default:
          return null;
      }
    });
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('access_token')
      .mockResolvedValueOnce('refresh_token');

    const result = await authService.getTokens({
      _id: userStub()._id,
      fullName: userStub().fullName,
    });

    expect(result).toEqual({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { _id: userStub()._id, fullName: userStub().fullName },
      { secret: 'access_secret', expiresIn: '1h' },
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { _id: userStub()._id, fullName: userStub().fullName },
      { secret: 'refresh_secret', expiresIn: '7d' },
    );
  });

  it('should update refresh token', async () => {
    jest
      .spyOn(bcrypt, 'hash')
      .mockResolvedValue('hashed_refresh_token' as unknown as never);
    jest.spyOn(userService, 'updateRefreshToken').mockResolvedValue(null);

    await authService.updateRefreshToken(userStub()._id, 'refresh_token');

    expect(bcrypt.hash).toHaveBeenCalledWith('refresh_token', 10);
    expect(userService.updateRefreshToken).toHaveBeenCalledWith(
      userStub()._id,
      'hashed_refresh_token',
    );
  });

  it('should hash data', async () => {
    jest
      .spyOn(bcrypt, 'hash')
      .mockResolvedValue('hashed_data' as unknown as never);

    const result = await authService.hashData('data');

    expect(result).toBe('hashed_data');
    expect(bcrypt.hash).toHaveBeenCalledWith('data', 10);
  });

  it('should refresh tokens', async () => {
    jest.spyOn(userService, 'findOne').mockResolvedValue(userStub() as any);
    jest.spyOn(authService, 'getTokens').mockResolvedValue({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    } as any);
    jest.spyOn(authService, 'updateRefreshToken').mockResolvedValue(null);

    const result = await authService.refreshTokens(userStub()._id);

    expect(result).toEqual({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
    expect(userService.findOne).toHaveBeenCalledWith(userStub()._id);
    expect(authService.getTokens).toHaveBeenCalledWith({
      _id: userStub()._id,
      fullName: userStub().fullName,
    });
    expect(authService.updateRefreshToken).toHaveBeenCalledWith(
      userStub()._id,
      'refresh_token',
    );
  });

  it('should throw UnauthorizedException when refreshing tokens for non-existing user', async () => {
    jest.spyOn(userService, 'findOne').mockResolvedValue(null);

    await expect(authService.refreshTokens(userStub()._id)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should logout user', async () => {
    jest.spyOn(userService, 'updateRefreshToken').mockResolvedValue(null);

    await authService.logout(userStub()._id);

    expect(userService.updateRefreshToken).toHaveBeenCalledWith(
      userStub()._id,
      null,
    );
  });
});
