import { ID, Like, Post, Comment, Reply } from 'types';
import { CommentsRepositoryInterface, LikesRepositoryInterface, PostsRepositoryInterface, RepliesRepositoryInterface } from './repository';
import { BlogServiceInterface } from 'src/blogs/service';

export interface PostServiceInterface {
  createPost(content: string, blogID: ID, userID: ID): Promise<Post | null>
  getPostsByBlog(blogID: ID): Promise<Post[] | null>
  blogOwnsPost(postID: ID, blogID: ID): Promise<boolean>
  getPost(postID: ID, blogID: ID): Promise<Post | null>
}

export class PostService implements PostServiceInterface {
  constructor(private postsRepository: PostsRepositoryInterface, private blogService: BlogServiceInterface) { }

  async createPost(content: string, blogID: ID, userID: ID) {
    if (!(await this.blogService.userOwnsBlog(blogID, userID))) return null;
    const id = crypto.randomUUID();
    return await this.postsRepository.insert({ id, blogID: blogID, content });
  }

  async getPostsByBlog(blogID: ID) {
    return await this.postsRepository.find({ blogID });
  }

  async getPost(postID: ID, blogID: ID) {
    return this.postsRepository.findOne({ id: postID, blogID });
  }

  async blogOwnsPost(postID: ID, blogID: ID) {
    const post = this.getPost(postID, blogID);
    return post !== null;
  }
}

export interface LikeServiceInterface {
  createLike(postID: ID, blogID: ID, userID: ID): Promise<Like | null>
  deleteLike(postID: ID, blogID: ID): Promise<boolean>
  getLikesByPost(postID: ID): Promise<Like[] | null>
}

export class LikeService implements LikeServiceInterface {
  constructor(private likesRepository: LikesRepositoryInterface, private postService: PostServiceInterface, private blogService: BlogServiceInterface) { }

  async createLike(postID: ID, blogID: ID, userID: ID): Promise<Like | null> {
    if (!(await this.blogService.userOwnsBlog(blogID, userID))) return null;

    const id = crypto.randomUUID();
    return await this.likesRepository.insert({ id, blogID, postID });
  }

  async deleteLike(postID: ID, blogID: ID) {
    const like = await this.likesRepository.findOne({ postID, blogID });
    if (like === null) return false;
    return this.likesRepository.delete(like.id);
  }

  async getLikesByPost(postID: ID) {
    return this.likesRepository.find({ postID });
  }
}

export interface CommentServiceInterface {
  createComment(content: string, postID: ID, blogID: ID, userID: ID): Promise<Comment | null>
  getCommentsByPost(postID: ID): Promise<Comment[] | null>
}

export class CommentService implements CommentServiceInterface {
  constructor(private commentsRepository: CommentsRepositoryInterface, private blogService: BlogServiceInterface) { }

  async createComment(content: string, postID: ID, blogID: ID, userID: ID) {
    if (!(await this.blogService.userOwnsBlog(blogID, userID))) return null;
    const id = crypto.randomUUID();
    return await this.commentsRepository.insert({ id, content, postID, blogID });
  }

  async getCommentsByPost(postID: ID) {
    return await this.commentsRepository.find({ postID });
  }
}

export interface ReplyServiceInterface {
  createReply(content: string, atBlog: string, commentID: ID, blogID: ID, userID: ID): Promise<Reply | null>
  getRepliesByComment(commentID: ID): Promise<Reply[] | null>
}

class ReplyService implements ReplyServiceInterface {
  constructor(private repliesRepository: RepliesRepositoryInterface, private blogService: BlogServiceInterface) { }

  async createReply(content: string, atBlog: string, commentID: ID, blogID: ID, userID: ID) {
    if (!(await this.blogService.userOwnsBlog(blogID, userID))) return null;
    const id = crypto.randomUUID();
    return await this.repliesRepository.insert({ id, content, commentID, blogID, atBlog });
  }

  async getRepliesByComment(commentID: ID) {
    return await this.repliesRepository.find({ commentID });
  }
}
