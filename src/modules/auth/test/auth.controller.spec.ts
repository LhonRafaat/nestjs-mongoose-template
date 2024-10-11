import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginPayload } from '../dto/login.payload';
import { RegisterPayload } from '../dto/register.payload';
import { TAuthResponse } from '../types/auth.response';
import { UnauthorizedException } from '@nestjs/common';
import { userStub } from '../../users/test/user.stub';
import { Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  const mockResponse = {
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens', async () => {
      const loginPayload: LoginPayload = {
        email: userStub().email,
        password: userStub().password,
      };
      const tokens: TAuthResponse = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(tokens);

      expect(await authService.validateUser(loginPayload)).toEqual(tokens);
      expect(authService.validateUser).toHaveBeenCalledWith(loginPayload);
    });

    it('should throw UnauthorizedException', async () => {
      const loginPayload: LoginPayload = {
        email: userStub().email,
        password: userStub().password,
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        authController.login(loginPayload, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.validateUser).toHaveBeenCalledWith(loginPayload);
    });
  });

  describe('register', () => {
    it('should return tokens', async () => {
      const registerPayload: RegisterPayload = {
        email: userStub().email,
        password: userStub().password,
        fullName: userStub().fullName,
        avatar: userStub().avatar,
      };
      const tokens: TAuthResponse = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(tokens);

      expect(await authService.register(registerPayload)).toEqual(tokens);
      expect(authService.register).toHaveBeenCalledWith(registerPayload);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const req = { user: { _id: userStub()._id } };

      jest.spyOn(authService, 'logout').mockResolvedValue(null);

      await authController.logout(req as any);

      expect(authService.logout).toHaveBeenCalledWith(userStub()._id);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens', async () => {
      const req = { user: { _id: userStub()._id } };
      const tokens: TAuthResponse = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      jest.spyOn(authService, 'refreshTokens').mockResolvedValue(tokens);

      expect(await authService.refreshTokens(req.user._id)).toEqual(tokens);
      expect(authService.refreshTokens).toHaveBeenCalledWith(userStub()._id);
    });
  });
});
