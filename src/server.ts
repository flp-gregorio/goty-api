import fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./lib/prisma";
import fastifyJwt from "@fastify/jwt";
import fastifyBcrypt from "fastify-bcrypt";

const app = fastify();
app.register(fastifyJwt, {
  secret: "supersecret",
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

app.post("/users", async (request, reply) => {
  const { email, username, password } = request.body;
  const hashedPassword = await app.bcrypt.hash(password);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });
  reply.send(user);
});

app.get("/users", async (request, reply) => {
  const users = await prisma.user.findMany();
  reply.send(users);
});

app.delete("/users/:id", async (request, reply) => {
  const { id } = request.params;
  const user = await prisma.user.delete({
    where: { id: String(id) },
  });
  reply.send(user);
});

app.put("/users/:id", async (request, reply) => {
  const { id } = request.params;
  const { email, username, password } = request.body;
  const user = await prisma.user.update({
    where: { id: String(id) },
    data: {
      email,
      username,
      password,
    },
  });
  reply.send(user);
});

app.get("/categories", async (request, reply) => {
  const categories = await prisma.category.findMany();
  reply.send(categories);
});

app.post("/categories", async (request, reply) => {
  const { title, description, weight } = request.body;
  const category = await prisma.category.create({
    data: {
      title,
      description,
      weight,
    },
  });
  reply.send(category);
});

app.delete("/categories/:id", async (request, reply) => {
  const { id } = request.params;
  const category = await prisma.category.delete({
    where: { id: Number(id) },
  });
  reply.send(category);
});

app.put("/categories/:id", async (request, reply) => {
  const { id } = request.params;
  const { title, description, weight } = request.body;
  const category = await prisma.category.update({
    where: { id: String(id) },
    data: {
      title,
      description,
      weight,
    },
  });
  reply.send(category);
});

app.get("/categories/:id/nominees", async (request, reply) => {
  const { id } = request.params;

  const categoryId = Number(id);
  if (isNaN(categoryId)) {
    return reply.status(400).send({ error: "Invalid category ID." });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return reply.status(404).send({ error: "Category not found." });
    }

    const nominees = await prisma.nominee.findMany({
      where: { categoryId },
    });
    reply.send(nominees);
  } catch (error) {
    console.error("Error retrieving nominees:", error); // Log the full error
    reply
      .status(500)
      .send({ error: "An error occurred while retrieving nominees." });
  }
});

app.post("/categories/:id/nominees", async (request, reply) => {
  const { id } = request.params;
  const { name, description, developer, genre } = request.body;

  if (!name || !description || !developer || !genre) {
    return reply.status(400).send({ error: "Missing required fields." });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) }, // Ensure id is converted to a number if using a numeric type
    });

    if (!category) {
      return reply.status(404).send({ error: "Category not found." });
    }

    const nominee = await prisma.nominee.create({
      data: {
        name,
        description,
        developer,
        genre,
        categoryId: Number(id), // Ensure id is converted to a number if using a numeric type
      },
    });

    reply.send(nominee);
  } catch (error) {
    console.error("Error creating nominee:", error);
    reply.status(500).send({ error: "An error occurred while adding the nominee." });
  }
});

