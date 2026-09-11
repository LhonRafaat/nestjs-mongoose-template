import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import mongoose, { Connection, Model, Types } from 'mongoose';
import { buildQueryFilter } from '../query-filter';
import { QueryMiddleware } from '../query-middleware';
import { IRequest } from '../common-types';

type TQueryAuthor = { fullName: string };
type TQueryPost = { title: string; views: number; author: Types.ObjectId };

// the reference queries need two collections, so this uses its own throwaway models
describe('buildQueryFilter (e2e)', () => {
  const middleware = new QueryMiddleware();
  let connection: Connection;
  let Author: Model<TQueryAuthor>;
  let Post: Model<TQueryPost>;

  const parse = async (query: Record<string, string>) => {
    const req = { query } as unknown as IRequest;
    await middleware.use(req, {} as Response, jest.fn());
    return req.queryObj;
  };

  const titlesFor = async (query: Record<string, string>) => {
    const posts = await Post.find(
      await buildQueryFilter(Post, await parse(query)),
    ).sort({ title: 1 });
    return posts.map((post) => post.title);
  };

  beforeAll(async () => {
    connection = await mongoose
      .createConnection(process.env.DB_URL)
      .asPromise();

    Author = connection.model(
      'QueryFilterAuthor',
      new mongoose.Schema<TQueryAuthor>({ fullName: String }),
      'query_filter_authors',
    );
    Post = connection.model(
      'QueryFilterPost',
      new mongoose.Schema<TQueryPost>({
        title: String,
        views: Number,
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'QueryFilterAuthor',
        },
      }),
      'query_filter_posts',
    );

    const [lee, sara] = await Author.create([
      { fullName: 'Lee Grade' },
      { fullName: 'Sara Ali' },
    ]);

    await Post.create([
      { title: 'first post', views: 5, author: lee._id },
      { title: 'second post', views: 50, author: sara._id },
    ]);
  });

  afterAll(async () => {
    await Author.deleteMany({});
    await Post.deleteMany({});
    await connection.close();
  });

  it('should filter on a field of the referenced document', async () => {
    expect(await titlesFor({ 'author.fullName-ref-contains': 'lee' })).toEqual([
      'first post',
    ]);
  });

  it('should return nothing when the reference does not match', async () => {
    expect(await titlesFor({ 'author.fullName-ref-equals': 'nobody' })).toEqual(
      [],
    );
  });

  it('should search the text fields', async () => {
    expect(await titlesFor({ search: 'second' })).toEqual(['second post']);
  });

  it('should filter on a comma separated list', async () => {
    expect(await titlesFor({ 'title-in': 'first post,second post' })).toEqual([
      'first post',
      'second post',
    ]);
  });

  it('should filter on a number', async () => {
    expect(await titlesFor({ 'views-greaterThan': '10' })).toEqual([
      'second post',
    ]);
  });

  it('should reject a reference query on a field that is not a reference', async () => {
    await expect(
      titlesFor({ 'title.x-ref-contains': 'first' }),
    ).rejects.toThrow(BadRequestException);
  });
});
