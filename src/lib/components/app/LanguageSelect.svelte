<script lang="ts">
	import Select from '#lib/components/ui/Select.svelte';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import { LOCALES, isLocale } from '#lib/i18n/locales.js';

	type Props = { id?: string; showLabel?: boolean };

	let { id = 'language', showLabel = true }: Props = $props();

	const options = LOCALES.map((locale) => ({
		value: locale.code,
		label: `${locale.flag} ${locale.label}`
	}));

	function change(event: Event & { currentTarget: HTMLSelectElement }) {
		const value = event.currentTarget.value;
		if (isLocale(value)) i18n.set(value);
	}
</script>

<Select
	{id}
	label={showLabel ? t('common.language.label') : undefined}
	aria-label={showLabel ? undefined : t('common.language.label')}
	value={i18n.locale}
	{options}
	onchange={change}
/>
