import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { buildQueryFilter } from '../query-filter';

describe('buildQueryFilter', () => {
  const paths = {
    _id: { instance: 'ObjectId', options: {} },
    fullName: { instance: 'String', options: {} },
    email: { instance: 'String', options: {} },
    password: { instance: 'String', options: { select: false } },
    isAdmin: { instance: 'Boolean', options: {} },
    author: { instance: 'ObjectId', options: { ref: 'Author' } },
    editors: {
      instance: 'Array',
      options: {},
      embeddedSchemaType: { options: { ref: 'Author' } },
    },
  };

  let distinct: jest.Mock;
  let dbModel: jest.Mock;
  let model: Model<unknown>;

  beforeEach(() => {
    distinct = jest.fn().mockResolvedValue(['id-1', 'id-2']);
    dbModel = jest.fn().mockReturnValue({ distinct });
    model = {
      schema: { paths, path: (name: string) => paths[name] },
      db: { model: dbModel },
    } as unknown as Model<unknown>;
  });

  it('should return an empty filter when there is no query', async () => {
    expect(await buildQueryFilter(model)).toEqual({});
  });

  it('should pass regular filters through', async () => {
    const regular = { fullName: { $regex: 'lee', $options: 'i' } };

    expect(await buildQueryFilter(model, { regular })).toEqual(regular);
  });

  it('should resolve a reference to the ids of the referenced documents', async () => {
    const filter = await buildQueryFilter(model, {
      references: {
        author: { paths: ['fullName'], value: { $regex: 'lee' } },
      },
    });

    expect(filter).toEqual({ author: { $in: ['id-1', 'id-2'] } });
    expect(dbModel).toHaveBeenCalledWith('Author');
    expect(distinct).toHaveBeenCalledWith('_id', {
      fullName: { $regex: 'lee' },
    });
  });

  it('should join a nested reference path', async () => {
    await buildQueryFilter(model, {
      references: {
        author: { paths: ['address', 'city'], value: { $eq: 'erbil' } },
      },
    });

    expect(distinct).toHaveBeenCalledWith('_id', {
      'address.city': { $eq: 'erbil' },
    });
  });

  it('should resolve a reference held in an array', async () => {
    const filter = await buildQueryFilter(model, {
      references: {
        editors: { paths: ['fullName'], value: { $eq: 'lee' } },
      },
    });

    expect(filter).toEqual({ editors: { $in: ['id-1', 'id-2'] } });
    expect(dbModel).toHaveBeenCalledWith('Author');
  });

  it('should reject a field that is not a reference', async () => {
    await expect(
      buildQueryFilter(model, {
        references: { fullName: { paths: ['x'], value: { $eq: 'lee' } } },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should search the text fields only, skipping hidden ones', async () => {
    expect(await buildQueryFilter(model, { search: 'lee' })).toEqual({
      $or: [
        { fullName: { $regex: 'lee', $options: 'i' } },
        { email: { $regex: 'lee', $options: 'i' } },
      ],
    });
  });

  it('should treat the search term as a literal', async () => {
    const filter = (await buildQueryFilter(model, { search: 'a.b+c' })) as {
      $or: { fullName: { $regex: string } }[];
    };

    expect(filter.$or[0].fullName.$regex).toBe('a\\.b\\+c');
  });

  it('should combine regular filters with a search', async () => {
    const filter = await buildQueryFilter(model, {
      regular: { isAdmin: { $eq: true as unknown as string } },
      search: 'lee',
    });

    expect(filter).toMatchObject({ isAdmin: { $eq: true } });
    expect(filter.$or).toHaveLength(2);
  });
});
