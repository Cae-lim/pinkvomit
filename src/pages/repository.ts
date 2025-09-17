import { parsePartial, QueryOptions, Repository } from "../repository";
import { Page, ID } from "types";
import database from "../database";
import { ResultSetHeader } from "mysql2";
import { Connection, Pool } from "mysql2/promise";

export interface PageRepositoryInterface extends Repository<Page> {
  insert(page: { id: ID, content: string, title: string, blogID: ID }): Promise<Page | null>
}

export class PageRepository implements PageRepositoryInterface {
  private readonly validFindValues = ["id", "blogID", "title"];
  private readonly validUpdateValues = ["content", "title"];
  private conn: Pool | Connection = database;

  setConnection(conn: Pool | Connection) {
    this.conn = conn;
  }

  async insert(page: Partial<Page>) {
    await this.conn.query<ResultSetHeader>("INSERT INTO pages (id, title, content, blogID) VALUES (?, ?, ?, ?)", [page.id, page.title, page.content, page.blogID]);
    return await this.findOne({ id: page.id });
  }

  async findOne(page: Partial<Page>, options: QueryOptions | {} = {}) {
    const pages = await this.find(page, options);

    return pages !== null ? pages[0] : null;
  }

  async find(page: Partial<Page>, options: QueryOptions | {} = {}) {
    const { keyString, values } = parsePartial(page, this.validFindValues, options);
    const [pages] = await this.conn.query(`SELECT * FROM pages WHERE ${keyString}`, [...values]) as [Page[], any];

    return pages.length > 0 ? pages : null;
  }

  async update(id: ID, page: Partial<Page>, options: QueryOptions | {} = {}) {
    const { keyString, values } = parsePartial(page, this.validUpdateValues, { ...options, joiner: ", " });
    const [pageUpate] = await this.conn.query<ResultSetHeader>(`UPDATE pages SET ${keyString} WHERE id = ?`, [...values, id]);

    if (pageUpate.affectedRows === 0) return null;

    return this.findOne({ id });
  }

  async delete(id: ID) {
    const [pageDelete] = await this.conn.query<ResultSetHeader>("DELETE FROM posts WHERE id = ? ", [id]);

    return pageDelete.affectedRows > 0;
  }
}
