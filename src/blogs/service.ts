import { Blog, ID } from "types";
import { BlogRepositoryInterface } from "./repository";
import database from "../database";
import { PageRepositoryInterface } from "src/pages/repository";
import { UserRepositoryInterface } from "src/auth/repository";
import { defaultIndexPage } from "src/pages/service";

export interface BlogServiceInterface {
  createBlog(title: string, userID: ID): Promise<Blog | null>
  getBlog(blogID: ID, userID: ID): Promise<Blog | null>
  getBlogByID(blogID: ID): Promise<Blog | null>
  getBlogByTitle(title: string): Promise<Blog | null>
  getBlogsByUser(userID: ID): Promise<Blog[] | null>
  blogExists(title: string): Promise<boolean>
  userOwnsBlog(blogID: ID, userID: ID): Promise<boolean>
  userOwnsBlogTitle(title: string, userID: ID): Promise<boolean>
}

export class BlogService implements BlogServiceInterface {
  constructor(private blogRepository: BlogRepositoryInterface, private pageRepo: PageRepositoryInterface, private userRepo: UserRepositoryInterface) { }

  async createBlog(title: string, userID: ID) {
    if ((await this.userRepo.findOne({ id: userID })) === null) return null;

    if ((await this.blogExists(title))) return null;

    const connection = await database.getConnection();
    await connection.beginTransaction()

    try {
      this.blogRepository.setConnection(connection);
      const id = crypto.randomUUID();
      const blog = await this.blogRepository.insert({ id, title, userID })
      if (blog === null) {
        throw new Error("Blog not created");
      }

      this.pageRepo.setConnection(connection);
      const pageID = crypto.randomUUID();
      const indexPage = await this.pageRepo.insert({ id: pageID, content: defaultIndexPage(title), title: "index", blogID: id })
      if (indexPage === null) {
        throw new Error("Index page was not created");
      }


      await connection.commit();
      return blog;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release()
      this.blogRepository.setConnection(database)
      this.pageRepo.setConnection(database);
    }
  }

  async getBlogByID(blogID: ID): Promise<Blog | null> {
    return await this.blogRepository.findOne({ id: blogID });
  }

  async getBlog(blogID: ID, userID: ID): Promise<Blog | null> {
    return await this.blogRepository.findOne({ id: blogID, userID })
  }

  async getBlogByTitle(title: string): Promise<Blog | null> {
    return await this.blogRepository.findOne({ title });
  }

  async blogExists(title: string) {
    return (await this.getBlogByTitle(title)) !== null;
  }

  async userOwnsBlog(blogID: ID, userID: ID): Promise<boolean> {
    return (await this.getBlog(blogID, userID)) !== null;
  }

  async userOwnsBlogTitle(title: string, userID: ID) {
    return (await this.blogRepository.findOne({ title, userID })) !== null;
  }

  async getBlogsByUser(userID: ID): Promise<Blog[] | null> {
    return await this.blogRepository.find({ userID });
  }
}
