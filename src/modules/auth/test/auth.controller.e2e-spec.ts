import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { AppModule } from '../../../app.module';
import { RegisterPayload } from '../dto/register.payload';
import { TAuthResponse } from '../types/auth.response';
import { LoginPayload } from '../dto/login.payload';
import { userStub } from '../../users/test/user.stub';
import { TUser } from '../../users/user.model';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;
  let createdUser: TUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);
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
  });
});
