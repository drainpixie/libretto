import type { FastifyInstance } from "fastify";

export default async function (app: FastifyInstance) {
	app.get("/", async (req, res) => ({ message: "online" }));
}
