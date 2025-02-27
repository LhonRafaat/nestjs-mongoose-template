import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TUser } from './user.model';
import { RegisterPayload } from '../auth/dto/register.payload';
import * as bcrypt from 'bcrypt';
import { IRequest, TResponse } from '../../common/helper/common-types';
import { OAuthRegisterPayload } from '../auth/dto/oauth-register-payload';
import { UpdateUserPayload } from './dto/update-user.payload';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<TUser>) {}

  async findAll(req: IRequest): Promise<TResponse<TUser>> {
    const users = this.userModel
      .find({
        ...req.queryObj?.regular,
      })
      .sort({
        [req.pagination.sort]: req.pagination.sortBy === 'desc' ? -1 : 1,
      });

    const total = await users.clone().countDocuments();

    users.limit(req.pagination.limit).skip(req.pagination.skip);

    const response: TResponse<TUser> = {
      result: await users.exec(),
      count: total,
      limit: req.pagination.limit,
      page: req.pagination.page,
    };

    return response;
  }

  async create(payload: RegisterPayload) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(payload.password, saltOrRounds);
    return await this.userModel.create({
      ...payload,
      password: hashedPassword,
    });
  }

  async createWithProvider(payload: OAuthRegisterPayload) {
    return await this.userModel.create({
      ...payload,
    });
  }

  async update(id: string, payload: UpdateUserPayload): Promise<TUser> {
    await this.findOne(id);
    return await this.userModel.findByIdAndUpdate(id, payload, {
      runValidators: true,
      new: true,
    });
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    await this.findOne(id);
    return await this.userModel.findByIdAndUpdate(
      id,
      {
        refreshToken,
      },
      { new: true, runValidators: true },
    );
  }

  async findOne(id: string): Promise<TUser> {
    const user = await this.userModel.findById(id);
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<TUser> {
    const user = await this.userModel.findOne({ email }).select('+password');
    return user;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.userModel.findByIdAndDelete(id);

    return { message: `User with id ${id} deleted` };
  }
}
