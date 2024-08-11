import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { default as sqlite } from "better-sqlite3";
import { default as mime } from "mime";

import { APP } from ".";
import { OPDS_MIME_ALLOW_LIST } from "./opds";
import { ENV, fetchBookInfo, removeFileExtension } from "./utils";

export const DB = sqlite(resolve(process.cwd(), "libretto.db"));

export interface Book<SQL extends boolean = true> {
	id: number;
	cover?: string;
	isbn: string;
	file: string;
	mime: string;
	link: string;
	language: string;
	published: string;
	publisher?: string;
	title: string;
	authors: SQL extends true ? string : string[];
	categories: SQL extends true ? string : string[];
	description: string;
}

export async function initialise() {
	DB.pragma("journal_mode = WAL");
	DB.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id      		INTEGER PRIMARY KEY,
      cover   		TEXT,
	  publisher 	TEXT,
	  isbn 			TEXT NOT NULL,
      file 			TEXT NOT NULL,
      mime 			TEXT NOT NULL,
	  link 			TEXT NOT NULL,
	  language 		TEXT NOT NULL,
	  published 	TEXT NOT NULL,
      title 		TEXT NOT NULL,
      authors  		TEXT NOT NULL,
	  categories 	TEXT NOT NULL,
	  description 	TEXT NOT NULL
    );
  `);

	for (const file of await readdir(ENV.dataPath)) {
		const mimetype = mime.getType(file);
		if (!mimetype || OPDS_MIME_ALLOW_LIST.indexOf(mimetype) === -1) {
			APP.log.warn(`Skipping ${file} due to unsupported mime type`);
			continue;
		}

		if (getBook(file)) {
			APP.log.warn(`Skipping ${file} due to already being in the database`);
			continue;
		}

		try {
			const data = await fetchBookInfo(removeFileExtension(file));

			if (!data) {
				APP.log.warn(`Skipping ${file} due to missing metadata`);
				continue;
			}

			DB.prepare(`
			INSERT INTO books (cover, isbn, file, mime, link, language, published, publisher, title, authors, categories, description)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
			`).run(
				data.thumbnail,
				data.isbn,
				file,
				mimetype,
				data.link,
				data.language,
				data.publishedDate,
				data.publisher,
				data.title,
				JSON.stringify(data.authors ?? []),
				JSON.stringify(data.categories ?? []),
				data.description,
			);
		} catch (error) {
			APP.log.error(error);
		}
	}
}

function transformSQLBook(b: Book<true>): Book<false> {
	return {
		...b,
		authors: JSON.parse(b.authors),
		categories: JSON.parse(b.categories),
	};
}

export function getBook(slug: string) {
	const book = DB.prepare("SELECT * FROM books WHERE file = ?").get(slug);
	return book ? transformSQLBook(book as Book) : null;
}

export function getAllBooks() {
	return DB.prepare("SELECT * FROM books")
		.all()
		.map((book) => transformSQLBook(book as Book));
}
