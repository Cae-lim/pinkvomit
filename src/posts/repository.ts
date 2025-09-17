import { ID, Post, Like, Comment, Reply } from 'types';
import { QueryOptions, parsePartial, Repository } from '../repository';
import database from '../database';
import { ResultSetHeader } from 'mysql2';
import { Pool, Connection } from 'mysql2/promise';

export interface PostsRepositoryInterface extends Repository<Post> {
  insert(post: {
    id: ID,
    content: string,
    blogID: ID
  }): Promise<Post | null>
}

export class PostsRepository implements PostsRepositoryInterface {
  private readonly validFindValues = ["id, blogID"];
  private conn: Pool | Connection = database;

  async insert(post: Partial<Post>): Promise<Post | null> {
    const [postInsert] = await this.conn.query<ResultSetHeader>("INSERT INTO posts (id, content, blogID) VALUES (?, ?, ?)",
      [post.id, post.content, post.blogID]);
    return this.findOne({ id: post.id });
  }

  async findOne(post: Partial<Post>, options: QueryOptions | {} = {}): Promise<Post | null> {
    const postResult = await this.find(post, options)
    return postResult === null ? null : postResult[0];
  }

  async find(post: Partial<Post>, options: QueryOptions | {} = {}) {
    const { keyString, values } = parsePartial<Post>(post, this.validFindValues, options);

    const [postResult] = await this.conn.query(`SELECT * FROM posts WHERE ${keyString}`, [...values]) as [Post[], any]

    return postResult.length > 0 ? postResult : null;
  }

  async update(id: ID, post: Partial<Post>, options: QueryOptions | {} = {}): Promise<Post | null> {
    return null; // Posts cannot but updated
  }

  async delete(id: ID) {
    const [postDelete] = await this.conn.query<ResultSetHeader>("DELETE FROM posts WHERE id = ? ", [id]);

    return postDelete.affectedRows > 0;
  }

  setConnection(conn: Pool | Connection) {
    this.conn = conn;
  }
}

export interface LikesRepositoryInterface extends Repository<Like> {
  insert(like: {
    id: ID,
    blogID: ID,
    postID: ID
  }): Promise<Like | null>
}

export class LikesRepository implements LikesRepositoryInterface {
  private readonly validFindValues = ["postID", "blogID"];
  private conn: Pool | Connection = database;

  setConnection(conn: Pool | Connection) {
    this.conn = conn;
  }

  async insert(like: Partial<Like>): Promise<Like | null> {
    await this.conn.query<ResultSetHeader>("INSERT INTO likes (id, blogID, postID) VALUES (?, ?, ?)", [like.id, like.blogID, like.postID]);
    return this.findOne({ id: like.id });
  }

  async findOne(like: Partial<Like>, options: QueryOptions | {} = {}): Promise<Like | null> {
    const likeResult = await this.find(like, options);
    return likeResult === null ? null : likeResult[0];
  }

  async find(like: Partial<Like>, options: QueryOptions | {} = {}): Promise<Like[] | null> {
    const { keyString, values } = parsePartial(like, this.validFindValues, options);
    const [likesResult] = await this.conn.query(`SELECT * FROM likes WHERE ${keyString}`, [...values]) as [Like[], any];
    return likesResult.length > 0 ? likesResult : null;
  }

  async update(id: ID, like: Partial<Like>, options: QueryOptions | {} = {}): Promise<Like | null> {
    return null; // likes cannot be updated;
  }

  async delete(id: ID) {
    const [likeDelete] = await this.conn.query<ResultSetHeader>("DELETE FROM likes WHERE id = ?", [id]);
    return likeDelete.affectedRows > 0;
  }

}

export interface CommentsRepositoryInterface extends Repository<Comment> {
  insert(comment: {
    id: ID,
    content: string,
    postID: ID,
    blogID: ID
  }): Promise<Comment | null>
}

export class CommentsRepository implements CommentsRepositoryInterface {
  private readonly validFindValues = ["postID", "blogID"]
  private conn: Pool | Connection = database;

  setConnection(conn: Pool | Connection) {
    this.conn = conn;
  }

  async insert(comment: Partial<Comment>) {
    await this.conn.query("INSERT INTO comments (id, content, postID, blogID) VALUES (?, ?, ?, ?)", [comment.id, comment.content, comment.postID, comment.blogID]) as [Comment[], any]
    return await this.findOne({ id: comment.id });
  }

  async findOne(comment: Partial<Comment>, options: QueryOptions | {} = {}) {
    const commentResult = await this.find(comment, options);
    return commentResult === null ? null : commentResult[0];
  }

  async find(comment: Partial<Comment>, options: QueryOptions | {} = {}) {
    const { keyString, values } = parsePartial(comment, this.validFindValues, options);
    const [commentsResult] = await this.conn.query(`SELECT * FROM comments WHERE ${keyString}`, [...values]) as [Comment[], any];
    return commentsResult.length > 0 ? commentsResult : null;
  }

  async update(id: ID, comment: Partial<Comment>, options: QueryOptions | {} = {}): Promise<Comment | null> {
    return null // comments cannot be updated
  }

  async delete(id: ID) {
    const [commentDelete] = await this.conn.query<ResultSetHeader>("DELETE FROM comments WHERE id = ?", [id]);
    return commentDelete.affectedRows > 0;
  }
}

export interface RepliesRepositoryInterface extends Repository<Reply> {
  insert(reply: {
    id: ID,
    content: string,
    commentID: ID,
    blogID: ID,
    atBlog: string
  }): Promise<Reply | null>
}

export class RepliesRepository implements RepliesRepositoryInterface {
  private readonly validFindValues = ["commentID", "blogID", "atBlog"]
  private conn: Pool | Connection = database;

  setConnection(conn: Pool | Connection) {
    this.conn = conn;
  }

  async insert(reply: Partial<Reply>) {
    await this.conn.query("INSERT INTO replies (id, content, commentID, blogID, atBlog) VALUES(?, ?, ?, ?, ?)", [reply.id, reply.content, reply.commentID, reply.blogID, reply.atBlog])
    return this.findOne({ id: reply.id });
  }

  async findOne(reply: Partial<Reply>, options: QueryOptions | {} = {}) {
    const replyResult = await this.find(reply, options);
    return replyResult === null ? null : replyResult[0];
  }

  async find(reply: Partial<Reply>, options: QueryOptions | {} = {}) {
    const { keyString, values } = parsePartial(reply, this.validFindValues, options);
    const [repliesResult] = await this.conn.query(`SELECT * FROM reply WHERE ${keyString}`, [...values]) as [Reply[], any];
    return repliesResult.length > 0 ? repliesResult : null;
  }

  async update(id: ID, reply: Partial<Reply>, options: QueryOptions | {} = {}): Promise<Reply | null> {
    return null; // reply cannot be updated 
  }

  async delete(id: ID) {
    const [replyDelete] = await this.conn.query<ResultSetHeader>("DELETE FROM replies WHERE id = ?", [id])
    return replyDelete.affectedRows > 0;
  }
}
