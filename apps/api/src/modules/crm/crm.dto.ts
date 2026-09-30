import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { InteractionType } from '@prisma/client';
import { PaginationDto } from '../../common/pagination.dto';

export class CustomerQueryDto extends PaginationDto { @IsOptional() @IsString() search?: string; @IsOptional() @IsString() tag?: string; }
export class AddNoteDto { @IsString() @Length(1, 4000) body: string; }
export class AddInteractionDto { @IsEnum(InteractionType) type: InteractionType; @IsString() @Length(1, 200) subject: string; @IsOptional() @IsString() @Length(0, 5000) body?: string; }
