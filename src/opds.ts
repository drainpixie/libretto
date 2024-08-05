// https://specs.opds.io/opds-1.2.html
import { XMLBuilder } from "fast-xml-parser";

interface Link {
	"@_rel": string;
	"@_href": string;
	"@_type": string;
}

interface Author {
	name: string;
	uri: string;
}

interface Entry {
	title: string;
	link: Link;
	updated: string;
	id: string;
	content: {
		"@_type": string;
		"#text": string;
	};
}

export interface OPDSFeed {
	"?xml": { "@_version": string; "@_encoding": string };
	feed: {
		"@_xmlns": string;
		id: string;
		link: Link[];
		title: string;
		updated: string;
		author: Author;
		entry: Entry[];
	};
}

const BUILDER = new XMLBuilder({
	ignoreAttributes: false,
	format: true,
});

export function buildOPDSFeed(data: OPDSFeed): string {
	return BUILDER.build(data);
}

export const MOCK_DATA: OPDSFeed = {
	"?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
	feed: {
		"@_xmlns": "http://www.w3.org/2005/Atom",
		id: "urn:uuid:2853dacf-ed79-42f5-8e8a-a7bb3d1ae6a2",
		link: [
			{
				"@_rel": "self",
				"@_href": "/opds-catalogs/root.xml",
				"@_type": "application/atom+xml;profile=opds-catalog;kind=navigation",
			},
			{
				"@_rel": "start",
				"@_href": "/opds-catalogs/root.xml",
				"@_type": "application/atom+xml;profile=opds-catalog;kind=navigation",
			},
		],
		title: "OPDS Catalog Root Example",
		updated: "2010-01-10T10:03:10Z",
		author: {
			name: "Spec Writer",
			uri: "http://opds-spec.org",
		},
		entry: [
			{
				title: "Popular publications",
				link: {
					"@_rel": "http://opds-spec.org/sort/popular",
					"@_href": "/opds-catalogs/popular.xml",
					"@_type":
						"application/atom+xml;profile=opds-catalog;kind=acquisition",
				},
				updated: "2010-01-10T10:01:01Z",
				id: "urn:uuid:d49e8018-a0e0-499e-9423-7c175fa0c56e",
				content: {
					"@_type": "text",
					"#text": "Popular publications from this catalog based on downloads.",
				},
			},
		],
	},
};
