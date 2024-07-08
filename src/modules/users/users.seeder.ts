import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { TUser } from './user.model';
import { faker } from '@faker-js/faker';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(@InjectModel('User') private readonly userModel: Model<TUser>) {}

  async seed(numberOfUsers: number) {
    const users = [];

    for (let i = 0; i < numberOfUsers; i++) {
      const user = {
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        password: await bcrypt.hash('password123', 10),
        avatar: faker.image.avatar(),
        isAdmin: faker.datatype.boolean(),
      };
      users.push(user);
    }

    for (const user of users) {
      const existingUser = await this.userModel
        .findOne({ email: user.email })
        .exec();
      if (!existingUser) {
        await this.userModel.create(user);
        this.logger.log(`Inserted user with email: ${user.email}`);
      } else {
        this.logger.log(`User with email: ${user.email} already exists`);
      }
    }
  }
}
