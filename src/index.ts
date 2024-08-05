import { fastify } from "fastify";
import { env } from "./utils";

const app = fastify({ logger: true });

try {
	await app.listen({ port: env.port });
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
