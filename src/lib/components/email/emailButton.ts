import { mergeAttributes, Node } from '@tiptap/core';

export const BUTTON_STYLE =
	'display:inline-block;background:#7c5cff;color:#ffffff;padding:12px 24px;border-radius:10px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		emailButton: {
			setEmailButton: (attributes: { label: string; href: string }) => ReturnType;
		};
	}
}

export const EmailButton = Node.create({
	name: 'emailButton',
	group: 'block',
	atom: true,
	selectable: true,
	draggable: true,

	addAttributes() {
		return {
			label: { default: 'Clique aqui' },
			href: { default: 'https://' }
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-email-button]',
				getAttrs: (node) => {
					const anchor = (node as HTMLElement).querySelector('a');
					return {
						label: anchor?.textContent ?? 'Clique aqui',
						href: anchor?.getAttribute('href') ?? 'https://'
					};
				}
			}
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			'div',
			mergeAttributes(HTMLAttributes, {
				'data-email-button': '',
				style: 'margin:20px 0;text-align:center;'
			}),
			[
				'a',
				{
					href: node.attrs.href,
					target: '_blank',
					rel: 'noopener noreferrer',
					style: BUTTON_STYLE
				},
				node.attrs.label
			]
		];
	},

	addCommands() {
		return {
			setEmailButton:
				(attributes) =>
				({ commands }) =>
					commands.insertContent({ type: this.name, attrs: attributes })
		};
	}
});
