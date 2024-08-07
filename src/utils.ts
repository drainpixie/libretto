import { resolve } from "node:path";

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

export const env = {
	dataPath: parseString("DATA", resolve(process.cwd(), "data")),
	port: parseNumber("PORT", 3000),
	host: parseString("HOST", "127.0.0.1"),
	id: parseString("ID", "Libretto"),
} as const;
