import { default as cors } from "@fastify/cors";
import { default as helmet } from "@fastify/helmet";
import { default as staticd } from "@fastify/static";
import { fastify } from "fastify";

import { initialise } from "./database";
import { ENV } from "./utils";

import catalog from "./routes/catalog";
import root from "./routes/root";

export const APP = fastify({ logger: true });

try {
	await initialise();
	APP.log.info("Database initialised");

	await APP.register(cors)
		.register(helmet)
		.register(root)
		.register(staticd, { root: ENV.dataPath })
		.register(catalog)
		.listen({ port: ENV.port, host: ENV.host });
} catch (err) {
	APP.log.error(err);
	process.exit(1);
}
