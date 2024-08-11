import { XMLBuilder } from "fast-xml-parser";
import { type Book, DB } from "./database";
import { removeFileExtension, toKebabCase } from "./utils";

// https://specs.opds.io/opds-1.2.html

export const OPDS_MIME_ALLOW_LIST = [
	"application/x-mobipocket-ebook",
	"application/epub+zip",
	"application/x-cbz",
	"application/x-cbr",
	"application/pdf",
	"text/fb2+xml",
];

// Regions help because folding.
// #region OPDS Data Types
interface Link {
	"@_rel": string;
	"@_href": string;
	"@_type": string;
}

interface Author {
	name: string;
}

interface Entry {
	title: string;
	link: Link[];
	author: Author;
	updated: string;
	id: string;
	content: {
		"@_type": string;
		"#text": string;
	};
}

interface Feed {
	"?xml": { "@_version": string; "@_encoding": string };
	feed: {
		"@_xmlns": string;
		id: string;
		link: Link[];
		title: string;
		updated: string;
		entry: Entry[];
	};
}

const BUILDER = new XMLBuilder({
	ignoreAttributes: false,
	format: true,
});

// #endregion
// #region OPDS Data Types Builders
class FeedBuilder {
	#feed: Feed = {
		"?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
		feed: {
			"@_xmlns": "http://www.w3.org/2005/Atom",
			id: "",
			link: [],
			title: "",
			updated: "",
			entry: [],
		},
	};

	id(id: string) {
		this.#feed.feed.id = id;
		return this;
	}

	link(rel: string, href: string, type: string) {
		this.#feed.feed.link.push({ "@_rel": rel, "@_href": href, "@_type": type });
		return this;
	}

	title(title: string) {
		this.#feed.feed.title = title;
		return this;
	}

	updated(updated: string) {
		this.#feed.feed.updated = updated;
		return this;
	}

	entryFromBook(book: Book) {
		this.#feed.feed.entry.push({
			title: book.title,
			link: [
				{
					"@_rel": "http://opds-spec.org/acquisition",
					"@_href": `/catalog/${book.file}`,
					"@_type": book.mime,
				},
				{
					"@_rel": "http://opds-spec.org/image",
					"@_href": book.cover ?? "",
					"@_type": "image/jpeg",
				},
			],
			author: { name: book.author },
			updated: "",
			id: toKebabCase(removeFileExtension(book.file)),
			content: { "@_type": "text", "#text": book.description },
		});

		return this;
	}

	static rel(kind: "acquisition" | "navigation") {
		return `application/atom+xml;profile=opds-catalog;kind=${kind}`;
	}

	build() {
		return BUILDER.build(this.#feed);
	}
}

// #endregion

export const feed = () => new FeedBuilder();
export const rel = FeedBuilder.rel;
