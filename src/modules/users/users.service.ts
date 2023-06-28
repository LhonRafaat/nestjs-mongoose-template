import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TUser } from './user.model';
import { RegisterPayload } from '../auth/dto/register.payload';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<TUser>) {}

  findAll() {
    return `This action returns all users`;
  }

  async create(payload: RegisterPayload) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(payload.password, saltOrRounds);
    return await this.userModel.create({
      ...payload,
      password: hashedPassword,
    });
  }

  async findOne(id: string): Promise<TUser> {
    const user = await this.userModel.findById(id);
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<TUser> {
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
