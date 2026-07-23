import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { User } from '../models/user.model';
import { BaseRepository } from './base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User)
    model: typeof User,
  ) {
    super(model);
  }

  findByTelegramId(telegramId: string): Promise<User | null> {
    return this.findOne({ where: { telegramId } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    q?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ rows: User[]; count: number }> {
    const where: WhereOptions<User> = {};

    if (params.q) {
      const like = `%${params.q}%`;
      Object.assign(where, {
        [Op.or]: [
          { firstName: { [Op.iLike]: like } },
          { lastName: { [Op.iLike]: like } },
          { username: { [Op.iLike]: like } },
          { email: { [Op.iLike]: like } },
        ],
      });
    }

    const sortable = new Set([
      'createdAt',
      'updatedAt',
      'firstName',
      'email',
      'username',
    ]);
    const sortBy = params.sortBy && sortable.has(params.sortBy)
      ? params.sortBy
      : 'createdAt';
    const sortOrder = params.sortOrder ?? 'DESC';

    return this.model.findAndCountAll({
      where,
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
      order: [[sortBy, sortOrder]],
    });
  }
}
