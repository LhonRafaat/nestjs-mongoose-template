import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { AppModule } from '../../../app.module';
import { RegisterPayload } from '../dto/register.payload';
import { TAuthResponse } from '../types/auth.response';
import { LoginPayload } from '../dto/login.payload';
import { userStub } from '../../users/test/user.stub';
import { TUser } from '../../users/user.model';
import { GoogleStrategy } from '../strategies/google.strategy';
import { IRequest } from '../../../common/helper/common-types';
import cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;
  let createdUser: TUser;
  let googleConfigured: boolean;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser()); // main.ts does this too, the cookie strategies need it
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    googleConfigured = !!moduleFixture.get(GoogleStrategy, { strict: false });
  });

  afterAll(async () => {
    await usersService.remove(createdUser._id);
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user and return tokens', async () => {
      const registerPayload: RegisterPayload = {
        email: userStub().email,
        password: userStub().password,
        fullName: userStub().fullName,
        avatar: userStub().avatar,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(201);
      createdUser = await usersService.findByEmail(userStub().email);
      const tokens: TAuthResponse = response.body;
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should return tokens for valid credentials', async () => {
      const loginPayload: LoginPayload = {
        email: userStub().email,
        password: userStub().password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginPayload)
        .expect(201);

      const tokens: TAuthResponse = response.body;
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      const loginPayload: LoginPayload = {
        email: userStub().email,
        password: 'wrong_password',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginPayload)
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout user', async () => {
      const loginPayload: LoginPayload = {
        email: userStub().email,
        password: userStub().password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginPayload)
        .expect(201);

      const accessToken = loginResponse.body.accessToken;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should return new tokens', async () => {
      const loginPayload: LoginPayload = {
        email: userStub().email,
        password: userStub().password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginPayload)
        .expect(201);

      const refreshToken = loginResponse.body.refreshToken;

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(201);

      const tokens: TAuthResponse = response.body;
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('should accept the refresh token from the cookie', async () => {
      const loginPayload: LoginPayload = {
        email: userStub().email,
        password: userStub().password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginPayload)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${loginResponse.body.refreshToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
    });
  });

  describe('/auth/google (GET)', () => {
    it('should redirect to google, or return 404 when it is not configured', async () => {
      await request(app.getHttpServer())
        .get('/auth/google')
        .expect(googleConfigured ? 302 : 404);
    });
  });

  describe('google callback', () => {
    it('should create an oauth user without a password and return tokens', async () => {
      const googleUser = {
        fullName: 'Google User',
        email: 'google-e2e@example.com',
        avatar: 'avatar',
        oauthProvider: 'google',
        oauthProviderId: 'google-e2e-id',
      };

      const tokens = await authService.handleGoogleCallback({
        user: googleUser,
      } as unknown as IRequest);

      const user = await usersService.findByEmail(googleUser.email);
      await usersService.remove(user._id);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(user.oauthProviderId).toBe(googleUser.oauthProviderId);
      expect(user.password).toBeUndefined();
    });
  });
});
