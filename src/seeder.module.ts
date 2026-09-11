import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from './app.module';
import { User } from './modules/users/user.schema';
import { UserSeeder } from './modules/users/users.seeder';

// Only loaded by seed.ts, so the seeders (and faker, a dev dependency) stay out of the running app
@Module({
  imports: [
    AppModule,
    MongooseModule.forFeature([{ name: 'User', schema: User }]),
  ],
  providers: [UserSeeder],
})
export class SeederModule {}
