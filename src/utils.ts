import { arch, platform } from "node:os";
import { resolve } from "node:path";
import { default as ISBN } from "@library-pals/isbn";

import { version } from "../package.json";

const LIBRETTO_HEADER = `Libretto/${version} (Node.js ${process.version}; ${platform()}; ${arch()})`;
const FETCH_OPTIONS = {
	headers: { "User-Agent": LIBRETTO_HEADER },
};

/**
 * Fetch info about a book from OpenLibrary.org
 * TODO: Write a better, type-safe wrapper around this API
 */
export async function fetchBookInfo(title: string) {
	const searchResponse = await fetch(
		`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`,
		FETCH_OPTIONS,
	);

	const searchData = await searchResponse.json();
	const isbn = searchData.docs?.[0]?.isbn?.[0];
	if (!isbn) return null;

	// We use `@library-pals/isbn` to resolve the ISBN because
	// OpenLibrary's API sucks and returns missing data and just overall
	// horrible-to-work-with JSON
	const resolver = new ISBN();

	try {
		return resolver.resolve(isbn, FETCH_OPTIONS);
	} catch {
		return null;
	}
}

/**
 * Utility to create parser without repeating type signature
 */
const createValueParser =
	<T = unknown>(parser: (value: unknown) => T) =>
	(key: string, defaultValue: T) => {
		const value = process.env[key];
		return value ? parser(value) : defaultValue;
	};

const parseNumber = createValueParser(Number);
const parseString = createValueParser((v) => `${v}`);

export const toTitleCase = (input: string) =>
	input.replace(
		/\w\S*/g,
		(txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
	);

export const toKebabCase = (input: string) =>
	input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

export const removeFileExtension = (input: string) =>
	input.split(".").shift() ?? input;

export const ENV = {
	dataPath: parseString("DATA", resolve(process.cwd(), "data")),
	port: parseNumber("PORT", 3000),
	host: parseString("HOST", "127.0.0.1"),
	id: parseString("ID", "Libretto"),
} as const;
