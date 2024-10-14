import { PartialType } from '@nestjs/swagger';
import { TUser } from '../user.model';

export class UpdateUserPayload extends PartialType(TUser) {}
