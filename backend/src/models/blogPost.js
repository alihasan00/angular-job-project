import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./user.js";

const BlogPost = sequelize.define(
  "BlogPost",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 10000],
      },
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "blog_posts",
    timestamps: true,
  }
);

BlogPost.belongsTo(User, {
  foreignKey: "userId",
  as: "author",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(BlogPost, {
  foreignKey: "userId",
  as: "blogPosts",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

BlogPost.prototype.toPublicJSON = function () {
  const post = this.toJSON();

  if (post.author) {
    post.author = {
      id: post.author.id,
      firstName: post.author.firstName,
      lastName: post.author.lastName,
      email: post.author.email,
    };
  }

  return post;
};

BlogPost.findAllWithAuthor = function (options = {}) {
  return this.findAll({
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
    ...options,
  });
};

BlogPost.findByUser = function (userId, options = {}) {
  return this.findAll({
    where: { userId },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
    ...options,
  });
};

export default BlogPost;
