import fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./lib/prisma";
import fastifyJwt from "@fastify/jwt";
import fastifyBcrypt from "fastify-bcrypt";
import middleware from "./middleware/middleware";
import { error } from "console";

const app = fastify();
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "supersecret",
});
app.register(fastifyBcrypt);

app.register(cors, {
  origin: "http://localhost:5173",
});

app.get("/", async (request, reply) => {
  return { hello: "world" };
});

app.listen({ port: 3333 }).then(() => {
  app.log.info(`server listening}`);
});

// User CRUD
app.post("/users", async (request, reply) => {
  const { email, username, password, confirmPassword } = request.body;

  if (!email || !username || !password || !confirmPassword) {
    return reply.status(400).send({ error: "Missing required fields." });
  }

  if (password != confirmPassword) {
    return reply.status(400).send({ error: "Passwords do not match" });
  }

  const hashedPassword = await app.bcrypt.hash(password);
  const user = await prisma.users.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });
  reply.send(user);
});

app.get("/users", { preHandler: [middleware] }, async (request, reply) => {
  const users = await prisma.users.findMany();
  reply.send(users);
});

app.put("/users/:id", { preHandler: [middleware] }, async (request, reply) => {
  const { id } = request.params;
  const { email, username, password } = request.body;
  const user = await prisma.users.update({
    where: { id: String(id) },
    data: {
      email,
      username,
      password,
    },
  });
  reply.send(user);
});

app.delete(
  "/users/:id",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id } = request.params;
    const user = await prisma.users.delete({
      where: { id: String(id) },
    });
    reply.send(user);
  }
);

// Category CRUD
app.post(
  "/categories",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { title, description, weight } = request.body;
    const category = await prisma.categories.create({
      data: {
        title,
        description,
        weight,
      },
    });
    reply.send(category);
  }
);

app.get("/categories", { preHandler: [middleware] }, async (request, reply) => {
  const categories = await prisma.categories.findMany();
  reply.send(categories);
});

app.put(
  "/categories/:id",
  { preHandler: [middleware] },
  async (request, reply) => {
    console.log(request.body);
    const { id } = request.params;
    const { title, description, weight } = request.body;

    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      reply.status(400).send({ error: "Invalid category ID" });
      return;
    }

    const category = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        title,
        description,
        weight,
      },
    });
    reply.send(category);
  }
);

app.delete(
  "/categories/:id",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id } = request.params;
    const category = await prisma.categories.delete({
      where: { id: Number(id) },
    });
    reply.send(category);
  }
);

// Nominee CRUD under Category
app.get(
  "/categories/:id/nominees",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id } = request.params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return reply.status(400).send({ error: "Invalid category ID." });
    }

    try {
      const category = await prisma.categories.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return reply.status(404).send({ error: "Category not found." });
      }

      const nominees = await prisma.nominees.findMany({
        where: { categoryId },
      });
      reply.send(nominees);
    } catch (error) {
      console.error("Error retrieving nominees:", error);
      reply
        .status(500)
        .send({ error: "An error occurred while retrieving nominees." });
    }
  }
);

app.post(
  "/categories/:id/nominees",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id } = request.params;
    const { name, description, developer, genre } = request.body;

    if (!name || !description || !developer || !genre) {
      return reply.status(400).send({ error: "Missing required fields." });
    }

    try {
      const category = await prisma.categories.findUnique({
        where: { id: Number(id) },
      });

      if (!category) {
        return reply.status(404).send({ error: "Category not found." });
      }

      const nominee = await prisma.nominees.create({
        data: {
          name,
          description,
          developer,
          genre,
          categoryId: Number(id),
        },
      });

      reply.send(nominee);
    } catch (error) {
      console.error("Error creating nominee:", error);
      reply
        .status(500)
        .send({ error: "An error occurred while adding the nominee." });
    }
  }
);

app.put(
  "/categories/:id/nominees/:nomineeId",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id, nomineeId } = request.params;
    const { name, description, developer, genre } = request.body;

    if (!name || !description || !developer || !genre) {
      return reply.status(400).send({ error: "Missing required fields." });
    }

    try {
      const category = await prisma.categories.findUnique({
        where: { id: Number(id) },
      });

      if (!category) {
        return reply.status(404).send({ error: "Category not found." });
      }

      const nominee = await prisma.nominees.update({
        where: { id: Number(nomineeId) },
        data: {
          name,
          description,
          developer,
          genre,
        },
      });

      reply.send(nominee);
    } catch (error) {
      console.error("Error updating nominee:", error);
      reply
        .status(500)
        .send({ error: "An error occurred while updating the nominee." });
    }
  }
);

app.delete(
  "/categories/:id/nominees/:nomineeId",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id, nomineeId } = request.params;

    try {
      const category = await prisma.categories.findUnique({
        where: { id: Number(id) },
      });

      if (!category) {
        return reply.status(404).send({ error: "Category not found." });
      }

      const nominee = await prisma.nominees.delete({
        where: { id: Number(nomineeId) },
      });

      reply.send(nominee);
    } catch (error) {
      console.error("Error deleting nominee:", error);
      reply
        .status(500)
        .send({ error: "An error occurred while deleting the nominee." });
    }
  }
);

// Winner CRUD
app.post("/winners", { preHandler: [middleware] }, async (request, reply) => {
  const { categoryId, nomineeId } = request.body;
  const winner = await prisma.winners.create({
    data: {
      categoryId: categoryId,
      nomineeId: nomineeId,
    },
  });
  reply.send(winner);
});

app.get("/winners", { preHandler: [middleware] }, async (request, reply) => {
  const winners = await prisma.winners.findMany();
  reply.send(winners);
});

app.put(
  "/winners/:id",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id } = request.params;
    const { categoryId, nomineeId } = request.body;
    const winner = await prisma.winners.update({
      where: { id: Number(id) },
      data: {
        categoryId,
        nomineeId,
      },
    });
    reply.send(winner);
  }
);

app.delete(
  "/winners/:id",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id } = request.params;
    const winner = await prisma.winners.delete({
      where: { id: Number(id) },
    });
    reply.send(winner);
  }
);

// Vote CRUD
app.post("/votes", { preHandler: [middleware] }, async (request, reply) => {
  const { userId, categoryId, nomineeId } = request.body;
  const vote = await prisma.votes.create({
    data: {
      userId,
      categoryId,
      nomineeId,
    },
  });
  reply.send(vote);
});

app.get("/votes", { preHandler: [middleware] }, async (request, reply) => {
  const votes = await prisma.votes.findMany();
  reply.send(votes);
});

app.put("/votes/:id", { preHandler: [middleware] }, async (request, reply) => {
  const { id } = request.params;
  const { userId, categoryId, nomineeId } = request.body;
  const vote = await prisma.votes.update({
    where: { id: Number(id) },
    data: {
      userId,
      categoryId,
      nomineeId,
    },
  });
  reply.send(vote);
});

app.delete(
  "/votes/:id",
  { preHandler: [middleware] },
  async (request, reply) => {
    const { id } = request.params;
    const vote = await prisma.votes.delete({
      where: { id: Number(id) },
    });
    reply.send(vote);
  }
);

app.get(
  "/leaderboard",
  { preHandler: [middleware] },
  async (request, reply) => {
    try {
      // Get all users and calculate their points based on correct votes
      const usersWithPoints = await prisma.users.findMany({
        select: {
          id: true,
          username: true,
          Votes: {
            select: {
              nomineeId: true,
              categoryId: true,
              nominee: {
                select: {
                  Winners: true,
                },
              },
            },
          },
        },
      });

      const leaderboard = usersWithPoints.map((user) => {
        let points = 0;

        user.Votes.forEach((vote) => {
          const correctVote = vote.nominee.Winners.find(
            (winner) =>
              winner.categoryId === vote.categoryId &&
              winner.nomineeId === vote.nomineeId
          );

          if (correctVote) {
            points += 1; // Increment points for each correct vote
          }
        });

        return {
          id: user.id,
          username: user.username,
          points,
        };
      });

      // Sort the leaderboard by points in descending order
      leaderboard.sort((a, b) => b.points - a.points);

      reply.send(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      reply
        .status(500)
        .send({ error: "An error occurred while fetching the leaderboard." });
    }
  }
);

app.post("/login", async (request, reply) => {
  const { username, password } = request.body;

  if (!username || !password) {
    return reply.status(400).send({ error: "Missing required fields." });
  }

  const user = await prisma.users.findUnique({
    where: { username },
  });

  if (!user) {
    return reply.status(404).send({ error: "User not found." });
  }

  const passwordMatch = await app.bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return reply.status(401).send({ error: "Invalid password." });
  }

  const token = app.jwt.sign({ userId: user.id });

  reply.send({ token });
});
