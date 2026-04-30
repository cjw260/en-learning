import { PartialType } from '@nestjs/mapped-types';
import { CreateLearnDto } from './create-learn.dto';

export class UpdateLearnDto extends PartialType(CreateLearnDto) {}
