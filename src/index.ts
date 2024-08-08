import { default as cors } from "@fastify/cors";
import { default as helmet } from "@fastify/helmet";
import { default as staticd } from "@fastify/static";
import { fastify } from "fastify";

import { initialise } from "./database";
import { env } from "./utils";

import catalog from "./routes/catalog";
import root from "./routes/root";

export const APP = fastify({ logger: true });

try {
	await initialise();
	APP.log.info("Database initialised");

	await APP.register(cors)
		.register(helmet)
		.register(root)
		.register(staticd, { root: env.dataPath })
		.register(catalog)
		.listen({ port: env.port, host: env.host });
} catch (err) {
	APP.log.error(err);
	process.exit(1);
}
