import BlogPost from "../../models/blogPost.js";
import User from "../../models/user.js";
import OpenAI from "openai";

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await BlogPost.findAndCountAll({
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      posts: posts.map((post) => post.toPublicJSON()),
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: count,
        postsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      message: "Error fetching blog posts",
      error: error.message,
    });
  }
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        message: "Blog post not found",
      });
    }

    res.json(post.toPublicJSON());
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      message: "Error fetching blog post",
      error: error.message,
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    if (title.length < 3 || title.length > 255) {
      return res.status(400).json({
        message: "Title must be between 3 and 255 characters",
      });
    }

    if (description.length < 10 || description.length > 10000) {
      return res.status(400).json({
        message: "Description must be between 10 and 10,000 characters",
      });
    }

    const post = await BlogPost.create({
      title,
      description,
      userId,
    });

    const postWithAuthor = await BlogPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.status(201).json(postWithAuthor.toPublicJSON());
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(400).json({
      message: "Error creating blog post",
      error: error.message,
    });
  }
};

const generatePostWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        message: "Prompt is required and must be a string",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: process.env.AI_API_URL,
    });

    const systemMessage = `You are a creative blog writer. Generate engaging blog posts with catchy titles and detailed descriptions. Always respond with valid JSON format containing "title" and "description" fields.`;

    const completion = await openai.chat.completions.create({
      model: "claude-3-5-sonnet-20241022",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content;

    let generatedTitle, generatedDescription;

    try {
      const parsedResponse = JSON.parse(aiResponse);
      generatedTitle = parsedResponse.title;
      generatedDescription = parsedResponse.description;
    } catch (parseError) {
      const lines = aiResponse.split("\n");
      generatedTitle =
        lines
          .find((line) => line.toLowerCase().includes("title"))
          ?.replace(/title:?\s*/i, "")
          .trim() || "AI Generated Post";
      generatedDescription =
        lines
          .find((line) => line.toLowerCase().includes("description"))
          ?.replace(/description:?\s*/i, "")
          .trim() || aiResponse;
    }

    if (generatedTitle) {
      generatedTitle = generatedTitle.replace(/^["\s,]+|["\s,]+$/g, "");
    }
    if (generatedDescription) {
      generatedDescription = generatedDescription.replace(
        /^["\s,]+|["\s,]+$/g,
        ""
      );
    }

    res.json({
      message: "AI content generated successfully",
      generatedContent: {
        title: generatedTitle,
        description: generatedDescription,
      },
    });
  } catch (error) {
    console.error("Error generating AI content:", error);

    if (
      error.message.includes("api_key") ||
      error.message.includes("authentication")
    ) {
      return res.status(401).json({
        message:
          "Invalid Claude API key. Please check your CLAUDE_API_KEY environment variable.",
        error: "Authentication failed",
      });
    }

    if (
      error.message.includes("model") ||
      error.message.includes("not found")
    ) {
      return res.status(400).json({
        message:
          "Model not found. Please check if the Claude model is available.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Error generating AI content",
      error: error.message,
    });
  }
};

export { getPosts, getPost, createPost, generatePostWithAI };
