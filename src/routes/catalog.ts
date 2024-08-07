import { readdir } from "node:fs/promises";
import type { FastifyInstance } from "fastify";

import { feed, rel } from "../opds";
import { env, removeFileExtension, toKebabCase, toTitleCase } from "../utils";

export default async function (app: FastifyInstance) {
	app.get("/catalog", async (_, res) => {
		const data = feed()
			.title(env.id)
			.id(env.id.toLowerCase())
			.link("self", "/catalog", rel("navigation"))
			.link("start", "/catalog", rel("navigation"))
			.updated(new Date().toISOString());

		for (const file of await readdir(env.dataPath)) {
			// TODO: Parse metadata from file
			const cleanFilename = removeFileExtension(file);

			data.entry(
				toTitleCase(cleanFilename),
				{
					"@_rel": "http://opds-spec.org/acquisition",
					"@_href": `/catalog/${file}`,
					"@_type": "application/epub+zip", // TODO: Mimetype
				},
				rel("acquisition"),
				toKebabCase(cleanFilename),
				{
					"@_type": "text",
					"#text": `This izs the ${cleanFilename} book`,
				},
			);
		}

		res.header("Content-Type", "application/atom+xml; charset=utf-8");
		res.send(data.build());
	});

	interface BookParams {
		book: string;
	}

	const bookSchema = {
		params: {
			type: "object",
			properties: {
				book: { type: "string" },
			},
		},
	};

	app.get<{ Params: BookParams }>(
		"/catalog/:book",
		{ schema: bookSchema },
		async (req, res) => {
			const { book } = req.params;

			res.header("Content-Type", "application/epub+zip"); // TODO: Mimetype
			return res.sendFile(book);
		},
	);
}
