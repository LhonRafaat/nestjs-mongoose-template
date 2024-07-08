import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service';
import { AuthService } from '../../auth/auth.service';
import { TUser } from '../user.model';
import { AppModule } from '../../../app.module';
import { userStub } from './user.stub';
import { LoginPayload } from '../../auth/dto/login.payload';
import { RegisterPayload } from '../../auth/dto/register.payload';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let authService: AuthService;
  let jwtService: JwtService;
  let accessToken: string;
  let refreshToken: string;
  let createdUser: TUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Register a new user and get the access token
    const registerPayload: RegisterPayload = {
      email: 'test@gmail.com',
      password: userStub().password,
      fullName: userStub().fullName + '1',
      avatar: userStub().avatar,
      isAdmin: true,
    };

    createdUser = await usersService.create(registerPayload);
    const { accessToken: token, refreshToken: RToken } =
      await authService.getTokens({
        _id: createdUser._id,
        fullName: createdUser.fullName,
      });
    accessToken = token;
    refreshToken = RToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should return TResponse', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });
  });

  describe('/users/me (GET)', () => {
    it('should return the current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body._id.toString()).toEqual(createdUser._id.toString());
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUser._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', createdUser._id.toString());
      expect(response.body).toHaveProperty('email', createdUser.email);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete a user by ID', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${createdUser._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });
});
