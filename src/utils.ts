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

export const env = {
	port: parseNumber("PORT", 3000),
	host: parseString("HOST", "127.0.0.1"),
} as const;
