import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalCopies: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  genreId: number;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  publishedYear?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  availableCopies?: number;
}
