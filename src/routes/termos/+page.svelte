<script lang="ts">
	import LegalDocument from '#lib/components/legal/LegalDocument.svelte';
	import { LEGAL } from '#lib/legal.js';

	const P = LEGAL.productName;

	const sections = [
		{ id: 'aceitacao', title: 'Aceitação e partes' },
		{ id: 'servico', title: 'O serviço' },
		{ id: 'conta', title: 'Cadastro e conta' },
		{ id: 'empresas', title: 'Empresas, membros e permissões' },
		{ id: 'integracoes', title: 'Integrações com a Meta' },
		{ id: 'uso-aceitavel', title: 'Uso aceitável' },
		{ id: 'dados', title: 'Dados e privacidade' },
		{ id: 'planos', title: 'Planos, pagamento e cancelamento' },
		{ id: 'propriedade', title: 'Propriedade intelectual' },
		{ id: 'disponibilidade', title: 'Disponibilidade e suporte' },
		{ id: 'responsabilidade', title: 'Limitação de responsabilidade' },
		{ id: 'encerramento', title: 'Suspensão e encerramento' },
		{ id: 'alteracoes', title: 'Alterações destes termos' },
		{ id: 'lei-foro', title: 'Lei aplicável e foro' },
		{ id: 'contato', title: 'Contato' }
	];
</script>

<LegalDocument
	title="Termos de Uso"
	description="Condições de uso da plataforma {P}."
	updatedAt={LEGAL.termsUpdatedAt}
	{sections}
>
	<p>
		Estes Termos de Uso (“Termos”) regulam o acesso e o uso da plataforma <strong>{P}</strong>. Leia
		com atenção: ao criar uma conta ou usar o serviço, você declara que leu, entendeu e concorda com
		estes Termos e com a <a href="/privacidade">Política de Privacidade</a>.
	</p>

	<h2 id="aceitacao">1. Aceitação e partes</h2>
	<p>
		O {P} é fornecido por <strong>{LEGAL.companyName}</strong>, CNPJ {LEGAL.cnpj}, com sede em
		{LEGAL.address} (“{P}”, “nós”). “Você” ou “usuário” é a pessoa que cria conta e usa a
		plataforma. Se você usa o {P} em nome de uma empresa, declara ter poderes para vinculá-la a estes
		Termos.
	</p>

	<h2 id="servico">2. O serviço</h2>
	<p>
		O {P} é uma plataforma online (software como serviço) para gestores de tráfego, agências e empresas
		acompanharem a operação de marketing digital dos experts que gerenciam: cadastro de experts e metas,
		conexão de contas de anúncios e perfis da Meta (Facebook e Instagram) e visualização consolidada de
		métricas como investimento, receita, ROAS, leads e custo por lead.
	</p>
	<p>
		As métricas exibidas dependem dos dados fornecidos pelas plataformas integradas. O {P} não garante
		resultados de campanhas, desempenho de anúncios nem retorno sobre investimento.
	</p>

	<h2 id="conta">3. Cadastro e conta</h2>
	<ul>
		<li>
			Para usar o {P} você deve ter <strong>18 anos ou mais</strong> e plena capacidade civil.
		</li>
		<li>
			As informações do cadastro devem ser verdadeiras, completas e atualizadas. Você responde pela
			veracidade dos dados que informar.
		</li>
		<li>
			A conta é pessoal e intransferível. Você é responsável por manter sua senha em sigilo e por
			todas as atividades realizadas na sua conta. Avise-nos imediatamente em caso de uso não
			autorizado.
		</li>
		<li>
			Você pode encerrar suas sessões ativas pela plataforma a qualquer momento, inclusive em todos
			os dispositivos.
		</li>
	</ul>

	<h2 id="empresas">4. Empresas, membros e permissões</h2>
	<p>
		Os dados no {P} são organizados por empresa (espaço de trabalho). Quem cria uma empresa torna-se seu
		<strong>administrador</strong>. Administradores respondem pela gestão dos membros, pelas
		permissões concedidas e pelo conteúdo inserido no espaço da empresa. Os dados de uma empresa não
		são acessíveis a outras empresas.
	</p>

	<h2 id="integracoes">5. Integrações com a Meta</h2>
	<ul>
		<li>
			A conexão com contas do Facebook e do Instagram só ocorre mediante sua autorização expressa e
			com as permissões que você escolher conceder. Você pode revogá-las a qualquer momento.
		</li>
		<li>
			Ao conectar uma conta, você declara ter autorização do titular daquela conta e dos ativos de
			anúncio para permitir o acesso pelo {P}.
		</li>
		<li>
			O uso dos produtos da Meta continua sujeito aos termos e políticas da própria Meta. O {P} não é
			afiliado, patrocinado nem endossado pela Meta Platforms, Inc.
		</li>
		<li>
			Mudanças, limitações ou indisponibilidade das APIs da Meta podem afetar funcionalidades do {P}
			sem que isso caracterize falha na prestação do serviço.
		</li>
	</ul>

	<h2 id="uso-aceitavel">6. Uso aceitável</h2>
	<p>Ao usar o {P}, você se compromete a não:</p>
	<ul>
		<li>violar a legislação aplicável, inclusive a LGPD, ou direitos de terceiros;</li>
		<li>
			inserir dados pessoais de terceiros sem base legal adequada ou dados pessoais sensíveis;
		</li>
		<li>
			tentar acessar contas, dados ou áreas sem autorização, contornar mecanismos de segurança ou
			explorar vulnerabilidades;
		</li>
		<li>
			fazer engenharia reversa, copiar, revender ou sublicenciar o serviço, ou extrair dados de
			forma automatizada (scraping) sem autorização;
		</li>
		<li>
			sobrecarregar a infraestrutura, enviar código malicioso ou interferir no funcionamento da
			plataforma;
		</li>
		<li>usar o serviço para fraudes, spam ou qualquer finalidade ilícita.</li>
	</ul>

	<h2 id="dados">7. Dados e privacidade</h2>
	<p>
		O tratamento de dados pessoais segue a <a href="/privacidade">Política de Privacidade</a> e a
		LGPD. Quanto aos dados de terceiros que você inserir na plataforma (como os dos experts), você
		atua como <strong>controlador</strong> e o {P} como <strong>operador</strong>: você garante ter
		base legal para o tratamento e para compartilhá-los conosco, e nós os tratamos apenas para
		prestar o serviço, seguindo suas instruções e a lei.
	</p>
	<p>
		Os dados que você insere continuam sendo seus. Você pode solicitar a exportação ou a exclusão a
		qualquer momento, nos termos da Política de Privacidade.
	</p>

	<h2 id="planos">8. Planos, pagamento e cancelamento</h2>
	<ul>
		<li>
			O {P} pode oferecer planos gratuitos e pagos. Preços, limites, periodicidade e forma de pagamento
			serão informados de forma clara antes da contratação.
		</li>
		<li>
			Quando a contratação for feita por consumidor pela internet, é garantido o direito de
			arrependimento em até 7 dias da contratação, com devolução integral dos valores pagos (art. 49
			do Código de Defesa do Consumidor e Decreto nº 7.962/2013).
		</li>
		<li>
			Você pode cancelar a assinatura a qualquer momento, sem multa. O cancelamento vale ao fim do
			período já pago, até o qual o acesso é mantido.
		</li>
		<li>
			Reajustes de preço serão comunicados com antecedência mínima de 30 dias e só valerão a partir
			do período seguinte.
		</li>
	</ul>

	<h2 id="propriedade">9. Propriedade intelectual</h2>
	<p>
		O software, a marca, o layout e os demais elementos do {P} pertencem a {LEGAL.companyName} ou a seus
		licenciantes e são protegidos pela legislação de propriedade intelectual. Estes Termos concedem a
		você uma licença limitada, não exclusiva e intransferível de uso do serviço enquanto sua conta estiver
		ativa, sem transferir qualquer direito de propriedade.
	</p>

	<h2 id="disponibilidade">10. Disponibilidade e suporte</h2>
	<p>
		Empregamos esforços razoáveis para manter o {P} disponível e seguro, mas o serviço pode passar por
		interrupções para manutenção, atualizações ou por eventos fora do nosso controle. Sempre que possível,
		manutenções programadas serão comunicadas com antecedência. O suporte é prestado pelo e-mail {LEGAL.supportEmail}.
	</p>

	<h2 id="responsabilidade">11. Limitação de responsabilidade</h2>
	<p>
		Na máxima extensão permitida pela lei, o {P} não responde por: decisões de negócio ou de investimento
		em mídia tomadas com base nas métricas exibidas; dados incorretos, incompletos ou atrasados fornecidos
		por plataformas de terceiros; danos causados por uso indevido da conta, inclusive por compartilhamento
		de senha; ou indisponibilidades de serviços de terceiros.
	</p>
	<p>
		Nada nestes Termos exclui ou limita direitos que não possam ser afastados por lei, inclusive os
		previstos no Código de Defesa do Consumidor quando aplicável.
	</p>

	<h2 id="encerramento">12. Suspensão e encerramento</h2>
	<ul>
		<li>Você pode encerrar sua conta a qualquer momento.</li>
		<li>
			Podemos suspender ou encerrar contas que violem estes Termos ou a lei, ou que coloquem em
			risco a segurança da plataforma ou de outros usuários. Exceto em casos graves ou por
			determinação legal, avisaremos antes e daremos oportunidade de regularização.
		</li>
		<li>
			Após o encerramento, os dados serão tratados conforme os prazos de retenção da Política de
			Privacidade.
		</li>
	</ul>

	<h2 id="alteracoes">13. Alterações destes termos</h2>
	<p>
		Podemos alterar estes Termos para refletir mudanças no serviço ou na legislação. Alterações
		relevantes serão comunicadas por e-mail ou na plataforma com antecedência razoável. Se você não
		concordar, poderá encerrar a conta antes da vigência; o uso continuado após essa data implica
		concordância.
	</p>

	<h2 id="lei-foro">14. Lei aplicável e foro</h2>
	<p>
		Estes Termos são regidos pelas leis da República Federativa do Brasil. Se você for consumidor,
		fica eleito o foro do seu domicílio (art. 101, I, do Código de Defesa do Consumidor). Nos demais
		casos, fica eleito o foro da comarca de {LEGAL.forum}, com renúncia a qualquer outro.
	</p>

	<h2 id="contato">15. Contato</h2>
	<p>
		Dúvidas sobre estes Termos: <strong>{LEGAL.supportEmail}</strong>. Assuntos de privacidade e
		dados pessoais: <strong>{LEGAL.privacyEmail}</strong>.
	</p>
</LegalDocument>
