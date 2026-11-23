<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Editor } from '@tiptap/core';
	import Image from '@tiptap/extension-image';
	import Placeholder from '@tiptap/extension-placeholder';
	import TextAlign from '@tiptap/extension-text-align';
	import { Color, TextStyle } from '@tiptap/extension-text-style';
	import StarterKit from '@tiptap/starter-kit';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import { EmailButton } from './emailButton.js';

	type Props = {
		value: string;
		placeholder?: string;
		variables?: { key: string; label: string }[];
		onchange?: (html: string) => void;
	};

	let {
		value = $bindable(''),
		placeholder = '',
		variables = [
			{ key: 'nome', label: 'Nome' },
			{ key: 'email', label: 'E-mail' }
		],
		onchange
	}: Props = $props();

	type Panel = 'link' | 'image' | 'button' | 'variables' | null;

	let host = $state<HTMLDivElement>();
	let editor = $state.raw<Editor>();
	let version = $state(0);
	let panel = $state<Panel>(null);
	let source = $state(false);
	let sourceText = $state('');
	let linkUrl = $state('https://');
	let imageUrl = $state('https://');
	let imageAlt = $state('');
	let buttonLabel = $state('');
	let buttonUrl = $state('https://');

	const COLORS = ['#14121f', '#7c5cff', '#d443d8', '#168050', '#a1650a', '#c2257a', '#6b6b85'];

	onMount(() => {
		if (!host) return;
		const instance = new Editor({
			element: host,
			content: value,
			extensions: [
				StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false } }),
				TextStyle,
				Color,
				TextAlign.configure({ types: ['heading', 'paragraph'] }),
				Image.configure({ inline: false }),
				EmailButton,
				Placeholder.configure({ placeholder })
			],
			editorProps: {
				attributes: {
					class: 'email-paper',
					role: 'textbox',
					'aria-multiline': 'true',
					'aria-label': t('email.editor.label')
				}
			},
			onTransaction: () => {
				version += 1;
			},
			onUpdate: ({ editor: current }) => {
				value = current.getHTML();
				onchange?.(value);
			}
		});
		editor = instance;
		return () => instance.destroy();
	});

	$effect(() => {
		const incoming = value;
		if (!editor || source) return;
		untrack(() => {
			if (incoming !== editor!.getHTML())
				editor!.commands.setContent(incoming, { emitUpdate: false });
		});
	});

	const on = (name: string, attrs?: Record<string, unknown>) => {
		void version;
		return editor?.isActive(name, attrs) ?? false;
	};
	const alignActive = (alignment: string) => {
		void version;
		return editor?.isActive({ textAlign: alignment }) ?? false;
	};
	const blockValue = $derived.by(() => {
		void version;
		if (!editor) return 'p';
		for (const level of [1, 2, 3]) if (editor.isActive('heading', { level })) return `h${level}`;
		return 'p';
	});
	const canUndo = $derived.by(() => {
		void version;
		return editor?.can().undo() ?? false;
	});
	const canRedo = $derived.by(() => {
		void version;
		return editor?.can().redo() ?? false;
	});

	function setBlock(next: string) {
		if (!editor) return;
		const chain = editor.chain().focus();
		if (next === 'p') chain.setParagraph().run();
		else chain.setHeading({ level: Number(next.slice(1)) as 1 | 2 | 3 }).run();
	}

	function openPanel(next: Exclude<Panel, null>) {
		if (panel === next) {
			panel = null;
			return;
		}
		if (next === 'link') linkUrl = editor?.getAttributes('link').href ?? 'https://';
		panel = next;
	}

	const isUrl = (input: string) => {
		try {
			return ['https:', 'http:', 'mailto:'].includes(new URL(input).protocol);
		} catch {
			return false;
		}
	};

	function applyLink() {
		if (!editor || !isUrl(linkUrl.trim())) return;
		editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
		panel = null;
	}

	function applyImage() {
		if (!editor || !isUrl(imageUrl.trim())) return;
		editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() }).run();
		imageUrl = 'https://';
		imageAlt = '';
		panel = null;
	}

	function applyButton() {
		if (!editor || !buttonLabel.trim() || !isUrl(buttonUrl.trim())) return;
		editor
			.chain()
			.focus()
			.setEmailButton({ label: buttonLabel.trim(), href: buttonUrl.trim() })
			.run();
		buttonLabel = '';
		buttonUrl = 'https://';
		panel = null;
	}

	function insertVariable(key: string) {
		editor?.chain().focus().insertContent(`{{${key}}}`).run();
		panel = null;
	}

	function toggleSource() {
		if (!editor) return;
		if (!source) {
			sourceText = editor.getHTML();
			source = true;
			return;
		}
		editor.commands.setContent(sourceText, { emitUpdate: true });
		source = false;
	}

	const tool =
		'grid size-9 shrink-0 cursor-pointer place-items-center rounded-md text-fg-muted hover:bg-surface-hover hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:shadow-focus';
	const toolOn = 'bg-primary/20 text-primary-hover';
	const field =
		'h-10 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-[14px] text-fg outline-none placeholder:text-fg-subtle focus:border-primary focus:shadow-focus';
</script>

{#snippet toolButton(
	icon: IconName,
	label: string,
	active: boolean,
	action: () => void,
	disabled = false
)}
	<button
		type="button"
		class={[tool, active && toolOn]}
		aria-label={label}
		title={label}
		aria-pressed={active}
		{disabled}
		onmousedown={(event) => event.preventDefault()}
		onclick={action}
	>
		<Icon name={icon} size={17} />
	</button>
{/snippet}

{#snippet divider()}
	<span class="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true"></span>
{/snippet}

<div class="overflow-hidden rounded-lg border border-border bg-bg-elevated">
	<div
		class="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-2.5 py-2"
		role="toolbar"
		aria-label={t('email.editor.toolbar')}
	>
		{@render toolButton(
			'undo',
			t('email.editor.undo'),
			false,
			() => editor?.chain().focus().undo().run(),
			!canUndo || source
		)}
		{@render toolButton(
			'redo',
			t('email.editor.redo'),
			false,
			() => editor?.chain().focus().redo().run(),
			!canRedo || source
		)}
		{@render divider()}
		<select
			class="h-9 cursor-pointer rounded-md border border-border bg-surface px-2.5 text-[13px] font-semibold text-fg outline-none hover:border-border-strong focus-visible:border-primary"
			aria-label={t('email.editor.blockType')}
			value={blockValue}
			disabled={source}
			onchange={(event) => setBlock(event.currentTarget.value)}
		>
			<option value="p">{t('email.editor.paragraph')}</option>
			<option value="h1">{t('email.editor.heading1')}</option>
			<option value="h2">{t('email.editor.heading2')}</option>
			<option value="h3">{t('email.editor.heading3')}</option>
		</select>
		{@render divider()}
		{@render toolButton(
			'bold',
			t('email.editor.bold'),
			on('bold'),
			() => editor?.chain().focus().toggleBold().run(),
			source
		)}
		{@render toolButton(
			'italic',
			t('email.editor.italic'),
			on('italic'),
			() => editor?.chain().focus().toggleItalic().run(),
			source
		)}
		{@render toolButton(
			'underline',
			t('email.editor.underline'),
			on('underline'),
			() => editor?.chain().focus().toggleUnderline().run(),
			source
		)}
		{@render toolButton(
			'strikethrough',
			t('email.editor.strike'),
			on('strike'),
			() => editor?.chain().focus().toggleStrike().run(),
			source
		)}
		<div class="flex items-center gap-1 px-1" role="group" aria-label={t('email.editor.color')}>
			{#each COLORS as color (color)}
				<button
					type="button"
					class="size-5 shrink-0 cursor-pointer rounded-full border border-white/20 focus-visible:shadow-focus"
					style:background={color}
					aria-label={`${t('email.editor.color')} ${color}`}
					disabled={source}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => editor?.chain().focus().setColor(color).run()}
				></button>
			{/each}
		</div>
		{@render divider()}
		{@render toolButton(
			'align-left',
			t('email.editor.alignLeft'),
			alignActive('left'),
			() => editor?.chain().focus().setTextAlign('left').run(),
			source
		)}
		{@render toolButton(
			'align-center',
			t('email.editor.alignCenter'),
			alignActive('center'),
			() => editor?.chain().focus().setTextAlign('center').run(),
			source
		)}
		{@render toolButton(
			'align-right',
			t('email.editor.alignRight'),
			alignActive('right'),
			() => editor?.chain().focus().setTextAlign('right').run(),
			source
		)}
		{@render divider()}
		{@render toolButton(
			'list',
			t('email.editor.bulletList'),
			on('bulletList'),
			() => editor?.chain().focus().toggleBulletList().run(),
			source
		)}
		{@render toolButton(
			'list-ordered',
			t('email.editor.orderedList'),
			on('orderedList'),
			() => editor?.chain().focus().toggleOrderedList().run(),
			source
		)}
		{@render toolButton(
			'quote',
			t('email.editor.quote'),
			on('blockquote'),
			() => editor?.chain().focus().toggleBlockquote().run(),
			source
		)}
		{@render toolButton(
			'minus',
			t('email.editor.divider'),
			false,
			() => editor?.chain().focus().setHorizontalRule().run(),
			source
		)}
		{@render divider()}
		{@render toolButton(
			'link',
			t('email.editor.link'),
			on('link') || panel === 'link',
			() => openPanel('link'),
			source
		)}
		{#if on('link')}
			{@render toolButton(
				'unlink',
				t('email.editor.unlink'),
				false,
				() => editor?.chain().focus().extendMarkRange('link').unsetLink().run(),
				source
			)}
		{/if}
		{@render toolButton(
			'image',
			t('email.editor.image'),
			panel === 'image',
			() => openPanel('image'),
			source
		)}
		{@render toolButton(
			'pointer',
			t('email.editor.button'),
			panel === 'button',
			() => openPanel('button'),
			source
		)}
		{@render toolButton(
			'braces',
			t('email.editor.variables'),
			panel === 'variables',
			() => openPanel('variables'),
			source
		)}
		<span class="ml-auto"></span>
		{@render toolButton('code', t('email.editor.source'), source, toggleSource)}
	</div>

	{#if panel && !source}
		<div
			class="flex flex-wrap items-center gap-2 border-b border-border bg-bg-elevated px-3 py-2.5"
		>
			{#if panel === 'link'}
				<input
					class={field}
					type="url"
					bind:value={linkUrl}
					placeholder="https://"
					aria-label={t('email.editor.url')}
					onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), applyLink())}
				/>
				<button
					type="button"
					class="h-10 cursor-pointer rounded-md bg-primary px-4 text-[13.5px] font-semibold"
					onclick={applyLink}>{t('email.editor.apply')}</button
				>
			{:else if panel === 'image'}
				<input
					class={field}
					type="url"
					bind:value={imageUrl}
					placeholder="https://…/imagem.png"
					aria-label={t('email.editor.imageUrl')}
				/>
				<input
					class={field}
					bind:value={imageAlt}
					placeholder={t('email.editor.imageAlt')}
					aria-label={t('email.editor.imageAlt')}
				/>
				<button
					type="button"
					class="h-10 cursor-pointer rounded-md bg-primary px-4 text-[13.5px] font-semibold"
					onclick={applyImage}>{t('email.editor.insert')}</button
				>
			{:else if panel === 'button'}
				<input
					class={field}
					bind:value={buttonLabel}
					placeholder={t('email.editor.buttonLabel')}
					aria-label={t('email.editor.buttonLabel')}
				/>
				<input
					class={field}
					type="url"
					bind:value={buttonUrl}
					placeholder="https://"
					aria-label={t('email.editor.url')}
				/>
				<button
					type="button"
					class="h-10 cursor-pointer rounded-md bg-primary px-4 text-[13.5px] font-semibold"
					onclick={applyButton}>{t('email.editor.insert')}</button
				>
			{:else if panel === 'variables'}
				<span class="text-[13px] text-fg-muted">{t('email.editor.variablesHint')}</span>
				{#each variables as variable (variable.key)}
					<button
						type="button"
						class="h-9 cursor-pointer rounded-full border border-border-strong bg-surface px-3.5 text-[13px] font-semibold hover:bg-surface-hover"
						onclick={() => insertVariable(variable.key)}
					>
						{variable.label} <span class="text-fg-subtle">{`{{${variable.key}}}`}</span>
					</button>
				{/each}
			{/if}
			<button
				type="button"
				class="ml-auto grid size-9 cursor-pointer place-items-center rounded-md text-fg-muted hover:bg-surface hover:text-fg"
				aria-label={t('common.actions.close')}
				onclick={() => (panel = null)}
			>
				<Icon name="x" size={16} />
			</button>
		</div>
	{/if}

	<div
		class="email-stage max-h-[560px] min-h-[360px] overflow-y-auto bg-[#e9e7f2] p-5"
		hidden={source}
	>
		<div class="mx-auto max-w-[620px]" bind:this={host}></div>
	</div>

	{#if source}
		<textarea
			class="block min-h-[360px] w-full resize-y border-0 bg-bg px-4 py-3 font-mono text-[13px] text-fg outline-none"
			bind:value={sourceText}
			spellcheck="false"
			aria-label={t('email.editor.source')}></textarea>
	{/if}
</div>

<style>
	:global(.email-paper) {
		min-height: 320px;
		padding: 36px 40px;
		border-radius: 12px;
		background: #ffffff;
		color: #1d1b26;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 16px;
		line-height: 1.65;
		outline: none;
		box-shadow: 0 12px 30px -18px rgb(20 18 31 / 0.35);
	}
	:global(.email-paper:focus-visible) {
		box-shadow:
			0 12px 30px -18px rgb(20 18 31 / 0.35),
			0 0 0 3px rgb(124 92 255 / 0.4);
	}
	:global(.email-paper p) {
		margin: 0 0 14px;
	}
	:global(.email-paper h1) {
		margin: 0 0 14px;
		font-size: 28px;
		line-height: 1.25;
	}
	:global(.email-paper h2) {
		margin: 0 0 12px;
		font-size: 22px;
		line-height: 1.3;
	}
	:global(.email-paper h3) {
		margin: 0 0 10px;
		font-size: 18px;
	}
	:global(.email-paper a) {
		color: #6a43f0;
		text-decoration: underline;
	}
	:global(.email-paper ul),
	:global(.email-paper ol) {
		margin: 0 0 14px;
		padding-left: 24px;
	}
	:global(.email-paper ul) {
		list-style: disc;
	}
	:global(.email-paper ol) {
		list-style: decimal;
	}
	:global(.email-paper li > p) {
		margin: 0 0 4px;
	}
	:global(.email-paper h1),
	:global(.email-paper h2),
	:global(.email-paper h3) {
		font-weight: 700;
	}
	:global(.email-paper blockquote) {
		margin: 0 0 14px;
		padding-left: 16px;
		border-left: 3px solid #d8d2f5;
		color: #5b5670;
	}
	:global(.email-paper hr) {
		margin: 22px 0;
		border: 0;
		border-top: 1px solid #e5e1f0;
	}
	:global(.email-paper img) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
	}
	:global(.email-paper img.ProseMirror-selectednode),
	:global(.email-paper [data-email-button].ProseMirror-selectednode) {
		outline: 2px solid #7c5cff;
		outline-offset: 3px;
	}
	:global(.email-paper p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		height: 0;
		color: #9a95a8;
		pointer-events: none;
	}
</style>
