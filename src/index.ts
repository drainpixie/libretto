import { default as cors } from "@fastify/cors";
import { default as helmet } from "@fastify/helmet";
import { fastify } from "fastify";

import { env } from "./utils";

import catalog from "./routes/catalog";
import root from "./routes/root";

const APP = fastify({ logger: true });

try {
	await APP.register(cors)
		.register(helmet)
		.register(root)
		.register(catalog)
		.listen({ port: env.port, host: env.host });
} catch (err) {
	APP.log.error(err);
	process.exit(1);
}
