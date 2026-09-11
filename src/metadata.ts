export default async () => {
  const t = {
    ['./modules/users/user.model.js']:
      await import('./modules/users/user.model.js'),
  };
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./modules/users/user.model.js'),
          {
            TUser: {
              _id: { required: true, type: () => String },
              fullName: { required: true, type: () => String },
              email: { required: true, type: () => String },
              password: { required: false, type: () => String },
              oauthProvider: { required: false, type: () => String },
              oauthProviderId: { required: false, type: () => String },
              avatar: { required: true, type: () => String },
              refreshToken: { required: true, type: () => String },
              isAdmin: { required: true, type: () => Boolean },
              createdAt: { required: true, type: () => String },
              updatedAt: { required: true, type: () => String },
            },
          },
        ],
      ],
      controllers: [
        [
          import('./app.controller.js'),
          { AppController: { getHello: { type: String } } },
        ],
        [
          import('./modules/users/users.controller.js'),
          {
            UsersController: {
              findAll: {},
              getMe: { type: t['./modules/users/user.model.js'].TUser },
              findOne: { type: t['./modules/users/user.model.js'].TUser },
              remove: {},
            },
          },
        ],
        [
          import('./modules/auth/auth.controller.js'),
          {
            AuthController: {
              login: {},
              register: {},
              googleAuth: {},
              googleAuthRedirect: {},
              logout: {},
              refreshToken: {},
            },
          },
        ],
      ],
    },
  };
};
