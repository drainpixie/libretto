import type { FastifyInstance } from "fastify";
import { feed } from "../opds";

export default async function (app: FastifyInstance) {
	app.get("/catalog", async (_, res) => {
		const data = feed()
			.id("urn:uuid:2853dacf-ed79-42f5-8e8a-a7bb3d1ae6a2")
			.link(
				"self",
				"/opds-catalogs/root.xml",
				"application/atom+xml;profile=opds-catalog;kind=navigation",
			)
			.link(
				"start",
				"/opds-catalogs/root.xml",
				"application/atom+xml;profile=opds-catalog;kind=navigation",
			)
			.title("OPDS Catalog Root")
			.updated(new Date().toISOString())
			.author("John Doe", "http://example.com")
			.entry(
				"Popular Publications",
				{
					"@_rel": "http://opds-spec.org/shelf",
					"@_href": "/opds-catalogs/popular.xml",
					"@_type": "application/atom+xml;profile=opds-catalog",
				},
				new Date().toISOString(),
				"urn:uuid:2853dacf-ed79-42f5-8e8a-a7bb3d1ae6a2:popular",
				{ "@_type": "text", "#text": "Popular Publications" },
			);

		res.header("Content-Type", "application/atom+xml; charset=utf-8");
		res.send(data.build());
	});
}
