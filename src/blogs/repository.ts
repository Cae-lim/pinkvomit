import { parsePartial, QueryOptions, Repository } from "src/repository";
import { Blog, ID } from "types";
import database from "../database";
import { ResultSetHeader } from "mysql2";
import { Connection, Pool } from "mysql2/promise";

export interface BlogRepositoryInterface extends Repository<Blog> {
  insert(blog: {
    id: ID,
    title: string,
    userID: ID
  }): Promise<Blog | null>
}

export class BlogRepository implements BlogRepositoryInterface {
  private readonly validFindValues = ["id", "userID", "title"];
  private readonly validUpdateValues = ["title", "stylesheet"];
  private conn: Pool | Connection = database;

  setConnection(conn: Pool | Connection) {
    this.conn = conn;
  }

  async insert(blog: Partial<Blog>): Promise<Blog | null> {
    await this.conn.query("INSERT INTO blogs (id, title, userID) VALUES (?, ?, ?)", [blog.id, blog.title, blog.userID]);

    return await this.findOne(blog);
  }

  async find(blog: Partial<Blog>, options: QueryOptions | {} = {}): Promise<Blog[] | null> {
    const { keyString, values } = parsePartial<Blog>(blog, this.validFindValues, options);

    const [blogResult] = await this.conn.query(`SELECT * FROM blogs WHERE ${keyString}`, [...values]) as [Blog[], any]

    return blogResult.length > 0 ? blogResult : null;
  }

  async findOne(blog: Partial<Blog>, options: QueryOptions | {} = {}): Promise<Blog | null> {
    const blogs = await this.find(blog, options);

    return blogs === null ? null : blogs[0];
  }

  async delete(id: ID): Promise<boolean> {
    const [deleteBlog] = await this.conn.query<ResultSetHeader>("DELETE FROM blogs WHERE id = ?", [id]);

    return deleteBlog.affectedRows > 0;
  }

  async update(id: ID, blog: Partial<Blog>, options: QueryOptions | {} = {}): Promise<Blog | null> {
    const { keyString, values } = parsePartial<Blog>(blog, this.validUpdateValues, { ...options, joiner: ", " });

    const [updateBlog] = await this.conn.query<ResultSetHeader>(`UPDATE blogs SET ${keyString} WHERE id = ?`, [...values, id]);

    if (updateBlog.affectedRows === 0) {
      return null;
    }

    const [[resultBlog]] = await this.conn.query(`SELECT * FROM blogs WHERE id = ?`, [id]) as [Blog[], any];

    return resultBlog || null;
  }
}
