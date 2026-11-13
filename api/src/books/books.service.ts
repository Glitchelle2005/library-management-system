import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export interface FindAllBooksQuery {
  genreId?: string | number;
  search?: string;
  page?: string | number;
  limit?: string | number;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    const genre = await this.prisma.genre.findUnique({
      where: { id: createBookDto.genreId },
    });
    if (!genre) {
      throw new NotFoundException(
        `Genre with ID ${createBookDto.genreId} not found`,
      );
    }

    if (createBookDto.isbn) {
      const existingIsbn = await this.prisma.book.findUnique({
        where: { isbn: createBookDto.isbn },
      });
      if (existingIsbn) {
        throw new ConflictException(
          `Book with ISBN "${createBookDto.isbn}" already exists`,
        );
      }
    }

    const availableCopies =
      createBookDto.availableCopies !== undefined
        ? createBookDto.availableCopies
        : createBookDto.totalCopies;

    return this.prisma.book.create({
      data: {
        ...createBookDto,
        availableCopies,
      },
      include: {
        genre: true,
      },
    });
  }

  async findAll(query?: FindAllBooksQuery) {
    const where: any = {};

    if (
      query?.genreId !== undefined &&
      query?.genreId !== null &&
      query?.genreId !== ''
    ) {
      where.genreId = Number(query.genreId);
    }

    if (query?.search && query.search.trim() !== '') {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { author: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const page = query?.page ? Math.max(1, Number(query.page)) : 1;
    const limit = query?.limit ? Math.max(1, Number(query.limit)) : 10;
    const skip = (page - 1) * limit;
    const take = limit;

    return this.prisma.book.findMany({
      where,
      skip,
      take,
      include: {
        genre: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
        reviews: true,
      },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    if (updateBookDto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: updateBookDto.genreId },
      });
      if (!genre) {
        throw new NotFoundException(
          `Genre with ID ${updateBookDto.genreId} not found`,
        );
      }
    }

    if (updateBookDto.isbn) {
      const existingIsbn = await this.prisma.book.findUnique({
        where: { isbn: updateBookDto.isbn },
      });
      if (existingIsbn && existingIsbn.id !== id) {
        throw new ConflictException(
          `Book with ISBN "${updateBookDto.isbn}" already exists`,
        );
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
      include: {
        genre: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
