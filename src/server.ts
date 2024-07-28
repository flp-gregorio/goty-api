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
