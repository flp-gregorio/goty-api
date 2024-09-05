import { FastifyReply, FastifyRequest } from "fastify";

const middleware = async (req: FastifyRequest, res: FastifyReply) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    res.status(401).send({ message: "Unauthorized" });
  }
  const [Bearer, token] = authorization.split(" ");
  try {
    await req.jwtVerify();
  } catch (error) {
    return res.status(401).send({ message: "Invalid Token" });
  }
};

export default middleware;
