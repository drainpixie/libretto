import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { default as sqlite } from "better-sqlite3";
import { default as mime } from "mime";

import { APP } from ".";
import { OPDS_MIME_ALLOW_LIST } from "./opds";
import { ENV, fetchBookInfo, removeFileExtension } from "./utils";

export const DB = sqlite(resolve(process.cwd(), "libretto.db"));

export interface Book {
	id: number;
	title: string;
	author: string;
	description: string;
	file: string;
	mime: string;
	cover?: string;
}

export async function initialise() {
	DB.pragma("journal_mode = WAL");
	DB.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id      INTEGER PRIMARY KEY,
      cover   TEXT,
      title   TEXT NOT NULL,
      author  TEXT NOT NULL,
	  description TEXT NOT NULL,
      file    TEXT NOT NULL,
      mime    TEXT NOT NULL
    );
  `);

	for (const file of await readdir(ENV.dataPath)) {
		const mimetype = mime.getType(file);
		if (!mimetype || OPDS_MIME_ALLOW_LIST.indexOf(mimetype) === -1) {
			APP.log.warn(`Skipping ${file} due to unsupported mime type`);
			continue;
		}

		if (DB.prepare("SELECT * FROM books WHERE file = ?").get(file)) {
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
        INSERT INTO books (title, author, cover, file, mime, description)
        VALUES (?, ?, ?, ?, ?, ?);
      `).run(
				data.title,
				data.author,
				data.cover,
				file,
				mimetype,
				data.description,
			);
		} catch (error) {
			APP.log.error(error);
		}
	}
}

export function getBook(slug: string) {
	return DB.prepare("SELECT * FROM books WHERE file = ?").get(slug) as Book;
}

export function getAllBooks() {
	return DB.prepare("SELECT * FROM books").all() as Book[];
}
