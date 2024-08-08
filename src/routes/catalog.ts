import { access, readdir } from "node:fs/promises";
import type { FastifyInstance } from "fastify";
import { default as mime } from "mime";

import { resolve } from "node:path";
import { OPDS_MIME_ALLOW_LIST, feed, rel } from "../opds";
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
			const type = mime.getType(file);

			if (!type || OPDS_MIME_ALLOW_LIST.indexOf(type) === -1) {
				res.log.warn(`Skipping ${file} due to unsupported mime type`);
				continue;
			}

			data.entry(
				toTitleCase(cleanFilename),
				{
					"@_rel": "http://opds-spec.org/acquisition",
					"@_href": `/catalog/${file}`,
					"@_type": type,
				},
				{ name: "John Doe" },
				rel("acquisition"),
				toKebabCase(cleanFilename),
				{
					"@_type": "text",
					"#text": `This is the ${cleanFilename} book`,
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
			const path = resolve(env.dataPath, book);

			// Honestly most of these checks are unnecessary as
			// you'll access the book through an OPDS client but, shrug
			try {
				await access(path);
			} catch {
				return res.status(404).send({ message: "Book not found" });
			}

			const type = mime.getType(path);
			if (!type || OPDS_MIME_ALLOW_LIST.indexOf(type) === -1)
				return res.status(415).send({ message: "Not a supported mime type" });

			return res.header("Content-Type", type).sendFile(book);
		},
	);
}
