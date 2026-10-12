export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export type ButtonStyle = {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
};

const BASE = [
	// A cor da borda fica em cada variante: duas cores de borda na mesma lista
	// competiriam e a vencedora dependeria da ordem do CSS gerado.
	'inline-flex items-center justify-center gap-2 border',
	'font-[inherit] font-bold whitespace-nowrap no-underline hover:no-underline',
	'[transition:background_0.15s,background-position_0.3s,border-color_0.15s,color_0.15s,box-shadow_0.2s,transform_0.1s,opacity_0.2s]',
	'not-disabled:active:[transform:translateY(1px)] disabled:cursor-not-allowed disabled:opacity-60'
].join(' ');

const VARIANTS: Record<ButtonVariant, string> = {
	primary: [
		'border-transparent bg-gradient-brand bg-size-[150%_150%] bg-position-[0%_50%] text-white',
		'shadow-[0_8px_24px_-8px_rgb(192_77_255/0.55)]',
		'not-disabled:hover:bg-position-[100%_50%] not-disabled:hover:shadow-[0_10px_28px_-8px_rgb(255_77_157/0.6)]'
	].join(' '),
	secondary: 'bg-surface border-border-strong text-fg not-disabled:hover:bg-surface-hover',
	ghost:
		'border-transparent bg-transparent text-fg-muted not-disabled:hover:bg-surface not-disabled:hover:text-fg',
	danger: 'bg-danger/12 border-danger/35 text-danger-soft not-disabled:hover:bg-danger/20'
};

/**
 * Classes Tailwind de botão. Usado pelo componente Button e por links com
 * aparência de botão: `<a class={buttonClass({ variant: 'secondary' })}>`.
 * Altura, padding, fonte e raio são definidos uma única vez por combinação,
 * para que nenhuma classe conflite com outra.
 */
export function buttonClass({
	variant = 'primary',
	size = 'md',
	fullWidth = false
}: ButtonStyle = {}): string {
	const sizing = size === 'sm' ? 'px-3 text-[13px] rounded-sm' : 'px-[18px] text-[14px] rounded-md';
	const height = fullWidth ? 'h-12 w-full' : size === 'sm' ? 'h-[34px]' : 'h-[42px]';

	return `${BASE} ${sizing} ${height} ${VARIANTS[variant]}`;
}
