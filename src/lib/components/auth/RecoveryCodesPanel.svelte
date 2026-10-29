<script lang="ts">
	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';

	type Props = { codes: string[]; oncontinue: () => void; continueLabel?: string };

	let { codes, oncontinue, continueLabel = 'Continuar' }: Props = $props();
	let saved = $state(false);
	let copied = $state(false);

	const text = $derived(codes.join('\n'));

	async function copyCodes() {
		await navigator.clipboard.writeText(text);
		copied = true;
	}

	function downloadCodes() {
		const url = URL.createObjectURL(new Blob([`${text}\n`], { type: 'text/plain;charset=utf-8' }));
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = 'codigos-recuperacao-pulse.txt';
		anchor.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="flex flex-col gap-4">
	<div class="rounded-md border border-warning/30 bg-warning/8 p-3.5 text-[13.5px] text-[#ffe2b3]">
		Estes códigos não serão mostrados novamente. Cada código pode ser usado uma única vez.
	</div>
	<ul class="grid grid-cols-2 gap-2 max-[420px]:grid-cols-1" aria-label="Códigos de recuperação">
		{#each codes as code (code)}
			<li
				class="rounded-sm border border-border bg-surface px-3 py-2 text-center font-mono font-bold"
			>
				{code}
			</li>
		{/each}
	</ul>
	<div class="flex flex-wrap gap-2">
		<Button variant="secondary" size="sm" onclick={copyCodes}
			>{copied ? 'Copiado' : 'Copiar'}</Button
		>
		<Button variant="secondary" size="sm" onclick={downloadCodes}>Baixar .txt</Button>
		<Button variant="secondary" size="sm" onclick={() => window.print()}>Imprimir</Button>
	</div>
	<Checkbox id="recovery-codes-saved" bind:checked={saved}>
		Guardei meus códigos em local seguro
	</Checkbox>
	<Button fullWidth disabled={!saved} onclick={oncontinue}>{continueLabel}</Button>
</div>
