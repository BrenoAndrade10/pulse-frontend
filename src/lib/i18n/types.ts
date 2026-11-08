export type PluralForms = { one: string; other: string };

export type MessageLeaf = string | PluralForms;

export type DotPaths<T> = {
	[K in keyof T & string]: T[K] extends MessageLeaf ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];
