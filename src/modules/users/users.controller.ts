import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TUser } from './user.model';
import { AuthGuard } from '@nestjs/passport';
import {
  IQuery,
  IRequest,
  TResponse,
  getResponseType,
} from '../../common/helper/common-types';
import { QueryTypes } from '../../common/decorators/query.decorator';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(TUser) // this decorator helps us to resolve TUser class when used in getResponseType function
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse(getResponseType(TUser))
  @QueryTypes()
  async findAll(
    @Req() req: IRequest,
    @Query() query: IQuery,
  ): Promise<TResponse<TUser>> {
    return this.usersService.findAll(req, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req: IRequest): TUser {
    return req.user;
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TUser> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
