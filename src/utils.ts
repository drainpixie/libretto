const createValueParser =
	<T = unknown>(parser: (value: unknown) => T) =>
	(key: string, defaultValue: T) => {
		const value = process.env[key];
		return value ? parser(value) : defaultValue;
	};

const parseNumber = createValueParser(Number);

export const env = {
	port: parseNumber("PORT", 3000),
} as const;
