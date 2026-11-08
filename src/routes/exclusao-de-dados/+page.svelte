<script lang="ts">
	import LegalDocument from '#lib/components/legal/LegalDocument.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import { LEGAL } from '#lib/legal.js';

	const sections = $derived([
		{ id: 'solicitar', title: t('misc.dataDeletion.sections.request') },
		{ id: 'desconectar', title: t('misc.dataDeletion.sections.disconnect') },
		{ id: 'apagado', title: t('misc.dataDeletion.sections.deleted') },
		{ id: 'prazo', title: t('misc.dataDeletion.sections.deadline') },
		{ id: 'retencao', title: t('misc.dataDeletion.sections.retention') },
		{ id: 'privacidade', title: t('misc.dataDeletion.sections.privacy') }
	]);
</script>

<LegalDocument
	title={t('misc.dataDeletion.title')}
	description={t('misc.dataDeletion.description')}
	updatedAt={LEGAL.dataDeletionUpdatedAt}
	{sections}
>
	<p>{t('misc.dataDeletion.intro', { product: LEGAL.productName })}</p>

	<h2 id="solicitar">1. {t('misc.dataDeletion.sections.request')}</h2>
	<p>{t('misc.dataDeletion.requestLead')}</p>
	<p>
		<a href="mailto:{LEGAL.privacyEmail}">{LEGAL.privacyEmail}</a> —
		{t('misc.dataDeletion.requestEmail', { email: LEGAL.privacyEmail })}
	</p>
	<p>{t('misc.dataDeletion.requestConfirmation')}</p>

	<h2 id="desconectar">2. {t('misc.dataDeletion.sections.disconnect')}</h2>
	<p>{t('misc.dataDeletion.disconnect')}</p>
	<p><a href="/integrations">{t('misc.dataDeletion.disconnectLink')}</a></p>

	<h2 id="apagado">3. {t('misc.dataDeletion.sections.deleted')}</h2>
	<p>{t('misc.dataDeletion.deleted')}</p>

	<h2 id="prazo">4. {t('misc.dataDeletion.sections.deadline')}</h2>
	<p>{t('misc.dataDeletion.deadline', { days: LEGAL.accountDeletionDays })}</p>

	<h2 id="retencao">5. {t('misc.dataDeletion.sections.retention')}</h2>
	<p>{t('misc.dataDeletion.retention')}</p>

	<h2 id="privacidade">6. {t('misc.dataDeletion.sections.privacy')}</h2>
	<p>
		{t('misc.dataDeletion.privacy')}
		<a href="/privacidade">{t('misc.dataDeletion.privacyLink')}</a>.
	</p>
</LegalDocument>
