import { ID, Page } from "types";
import { PageRepositoryInterface } from "./repository";
import { Connection, Pool } from "mysql2/promise";
import { BlogRepositoryInterface } from "src/blogs/repository";

export function defaultIndexPage(blogTitle: string) {
  return `
# Welcome to ${blogTitle}
[posts (minimal)]
`
}

export interface PageServiceInterface {
  createPage(title: string, content: string, blogID: ID, userID: ID, index?: boolean, blogTitle?: string): Promise<Page | null>;
  getPage(title: string, blogID: ID): Promise<Page | null>;
  getBlogsPages(blogID: ID): Promise<Page[] | null>;
  deletePage(title: string, blogID: ID, userID: ID): Promise<boolean>;
  setConnection(conn: Pool | Connection): void;
}

export class PageService implements PageServiceInterface {
  constructor(private pageRepository: PageRepositoryInterface, private blogRepo: BlogRepositoryInterface) { }

  // index should only be used when creating new blogs, do not delete or duplicate index pages
  async createPage(title: string, content: string, blogID: ID, userID: ID, index = false, blogTitle = "") {
    if ((await this.blogRepo.findOne({ id: blogID, userID })) === null) return null;

    if (index) {
      title = "index";
      content = defaultIndexPage(blogTitle)
    }

    const id = crypto.randomUUID();
    return await this.pageRepository.insert({ id, content, title, blogID });
  }

  async getPage(title: string, blogID: ID) {
    return await this.pageRepository.findOne({ title, blogID });
  }

  async getBlogsPages(blogID: ID) {
    return await this.pageRepository.find({ blogID });
  }

  async deletePage(title: string, blogID: ID, userID: ID) {
    if (title === "index") return false;
    const page = await this.getPage(title, blogID);
    if (page === null) return false;
    return await this.pageRepository.delete(page.id);
  }

  setConnection(conn: Pool | Connection) {
    this.pageRepository.setConnection(conn);
  }
}
