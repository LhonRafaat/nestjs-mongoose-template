import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { QueryMiddleware } from '../query-middleware';
import { IRequest } from '../common-types';

describe('QueryMiddleware', () => {
  const middleware = new QueryMiddleware();

  const run = async (query: Record<string, string>): Promise<IRequest> => {
    const req = { query } as unknown as IRequest;
    await middleware.use(req, {} as Response, jest.fn());
    return req;
  };

  it('should add the default pagination', async () => {
    const req = await run({});

    expect(req.pagination).toEqual({
      limit: 10,
      page: 1,
      skip: 0,
      sort: 'createdAt',
      sortBy: 'desc',
    });
    expect(req.queryObj).toBeUndefined();
  });

  it('should compute skip from page and limit', async () => {
    const req = await run({ page: '3', limit: '5' });

    expect(req.pagination).toMatchObject({ limit: 5, page: 3, skip: 10 });
  });

  it('should make contains a case insensitive regex', async () => {
    const req = await run({ 'fullName-contains': 'lee' });

    expect(req.queryObj.regular).toEqual({
      fullName: { $regex: 'lee', $options: 'i' },
    });
  });

  it('should turn notContains into a negated regex', async () => {
    const req = await run({ 'fullName-notContains': 'lee' });

    expect(req.queryObj.regular).toEqual({
      fullName: { $not: { $regex: 'lee', $options: 'i' } },
    });
  });

  it('should split in and notIn into arrays', async () => {
    const req = await run({
      'email-in': 'a@b.c, d@e.f',
      'fullName-notIn': 'lee',
    });

    expect(req.queryObj.regular).toEqual({
      email: { $in: ['a@b.c', 'd@e.f'] },
      fullName: { $nin: ['lee'] },
    });
  });

  it('should convert numeric values to numbers', async () => {
    const req = await run({ 'views-greaterThan': '10' });

    expect(req.queryObj.regular).toEqual({ views: { $gt: 10 } });
  });

  it('should keep an empty value instead of turning it into 0', async () => {
    const req = await run({ 'fullName-equals': '' });

    expect(req.queryObj.regular).toEqual({ fullName: { $eq: '' } });
  });

  it('should keep nested fields as a dotted path', async () => {
    const req = await run({ 'address.city-contains': 'erbil' });

    expect(req.queryObj.regular).toEqual({
      'address.city': { $regex: 'erbil', $options: 'i' },
    });
  });

  it('should parse a reference query', async () => {
    const req = await run({ 'author.fullName-ref-contains': 'lee' });

    expect(req.queryObj.references).toEqual({
      author: {
        paths: ['fullName'],
        value: { $regex: 'lee', $options: 'i' },
      },
    });
    expect(req.queryObj.regular).toBeUndefined();
  });

  it('should parse a nested path on a reference query', async () => {
    const req = await run({ 'author.address.city-ref-equals': 'erbil' });

    expect(req.queryObj.references.author).toEqual({
      paths: ['address', 'city'],
      value: { $eq: 'erbil' },
    });
  });

  it('should normalize notContains on a reference query', async () => {
    const req = await run({ 'author.fullName-ref-notContains': 'lee' });

    expect(req.queryObj.references.author.value).toEqual({
      $not: { $regex: 'lee', $options: 'i' },
    });
  });

  it('should keep the search term', async () => {
    const req = await run({ search: 'lee' });

    expect(req.queryObj).toEqual({ search: 'lee' });
  });

  it('should reject an unknown operator', async () => {
    await expect(run({ 'fullName-like': 'lee' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should reject a reference query without a field', async () => {
    await expect(run({ 'author-ref-contains': 'lee' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
