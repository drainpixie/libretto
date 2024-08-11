import { access, readdir } from "node:fs/promises";
import type { FastifyInstance } from "fastify";
import { default as mime } from "mime";

import { resolve } from "node:path";
import { getAllBooks } from "../database";
import { OPDS_MIME_ALLOW_LIST, feed, rel } from "../opds";
import { ENV, removeFileExtension, toKebabCase, toTitleCase } from "../utils";

export default async function (app: FastifyInstance) {
	app.get("/catalog", async (_, res) => {
		const data = feed()
			.title(ENV.id)
			.id(ENV.id.toLowerCase())
			.link("self", "/catalog", rel("navigation"))
			.link("start", "/catalog", rel("navigation"))
			.updated(new Date().toISOString());

		for (const book of getAllBooks()) {
			data.entryFromBook(book);
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
			const path = resolve(ENV.dataPath, book);

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
