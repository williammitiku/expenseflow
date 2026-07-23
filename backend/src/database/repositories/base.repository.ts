import { Injectable } from '@nestjs/common';
import {
  Attributes,
  CreationAttributes,
  DestroyOptions,
  FindOptions,
  Identifier,
  UpdateOptions,
} from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';

/**
 * Generic repository — all domain repositories extend this.
 * Keeps Sequelize access out of services (Repository Pattern).
 */
@Injectable()
export abstract class BaseRepository<M extends Model> {
  protected constructor(protected readonly model: ModelCtor<M>) {}

  findById(id: Identifier, options?: FindOptions<Attributes<M>>): Promise<M | null> {
    return this.model.findByPk(id, options);
  }

  findOne(options: FindOptions<Attributes<M>>): Promise<M | null> {
    return this.model.findOne(options);
  }

  findAll(options?: FindOptions<Attributes<M>>): Promise<M[]> {
    return this.model.findAll(options);
  }

  create(values: CreationAttributes<M>): Promise<M> {
    return this.model.create(values);
  }

  async update(
    id: Identifier,
    values: Partial<Attributes<M>>,
    options?: UpdateOptions<Attributes<M>>,
  ): Promise<M | null> {
    const entity = await this.findById(id);
    if (!entity) {
      return null;
    }
    return entity.update(values as never, options as never);
  }

  async softDelete(id: Identifier, options?: DestroyOptions<Attributes<M>>): Promise<boolean> {
    const deleted = await this.model.destroy({
      ...options,
      where: { ...(options?.where ?? {}), id } as never,
    });
    return deleted > 0;
  }

  count(options?: FindOptions<Attributes<M>>): Promise<number> {
    return this.model.count(options);
  }
}
