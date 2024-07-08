import { TUser } from '../user.model';

export const userStub = (): TUser => {
  return {
    _id: '667ef71fb67a3ddc02f2adc3',
    fullName: 'john doe',
    email: 'example@gmail.com',
    refreshToken: '132324',
    password: '12345',
    avatar: 'slaw',
    isAdmin: false,
    createdAt: '2024-06-28T17:47:11.539Z',
    updatedAt: '2024-07-04T12:49:02.693Z',
  };
};
