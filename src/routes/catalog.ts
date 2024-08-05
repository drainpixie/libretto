import type { FastifyInstance } from "fastify";
import { MOCK_DATA, buildOPDSFeed } from "../opds";

export default async function (app: FastifyInstance) {
	app.get("/catalog", async (req, res) => {
		const feed = buildOPDSFeed(MOCK_DATA);

		res.header("Content-Type", "application/atom+xml; charset=utf-8");
		res.send(feed);
	});
}
