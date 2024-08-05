import { default as cors } from "@fastify/cors";
import { default as helmet } from "@fastify/helmet";
import { fastify } from "fastify";

import { env } from "./utils";

import catalog from "./routes/catalog";
import root from "./routes/root";

const app = fastify({ logger: true });

try {
	await app
		.register(cors)
		.register(helmet)
		.register(root)
		.register(catalog)
		.listen({ port: env.port, host: env.host });
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
