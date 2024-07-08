import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './user.schema';
import { UserSeeder } from './users.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: User }])],

  controllers: [UsersController],
  providers: [UsersService, UserSeeder],
  exports: [UsersService, UserSeeder],
})
export class UsersModule {}
