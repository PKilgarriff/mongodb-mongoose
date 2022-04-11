import mongoose from "mongoose";
import Blog from "./model/blog.js";

mongoose.connect(
  "mongodb://localhost:27017/?directConnection=true&serverSelectionTimeoutMS=2000"
);

// Create a new blog post object
const article = await Blog.create({
  title: "Awesome Post!",
  slug: "awesome-post",
  published: true,
  content: "This is the best post ever",
  tags: ["featured", "announcement"],
});
console.log("Created Article:", article);

article.title = "Even More Awesome Post";
await article.save();
console.log("Updated Once:", article);

article.title = "Actually It's Just Fine as a Post";
await article.save();
console.log("Updated Twice:", article);

let articleId = article._id;

const returnArticle = await Blog.findById(articleId).exec();
console.log("Queried from DB by ID:", returnArticle);
