<script lang="ts">
	import LegalDocument from '#lib/components/legal/LegalDocument.svelte';
	import { LEGAL } from '#lib/legal.js';

	const P = LEGAL.productName;

	const sections = [
		{ id: 'quem-somos', title: 'Quem somos' },
		{ id: 'abrangencia', title: 'A quem se aplica' },
		{ id: 'dados-coletados', title: 'Dados que tratamos' },
		{ id: 'finalidades', title: 'Finalidades e bases legais' },
		{ id: 'cookies', title: 'Cookies e armazenamento local' },
		{ id: 'compartilhamento', title: 'Compartilhamento' },
		{ id: 'transferencia-internacional', title: 'Transferência internacional' },
		{ id: 'retencao', title: 'Por quanto tempo guardamos' },
		{ id: 'seguranca', title: 'Segurança e incidentes' },
		{ id: 'direitos', title: 'Seus direitos' },
		{ id: 'exclusao-de-dados-meta', title: 'Exclusão de dados da Meta' },
		{ id: 'dados-de-terceiros', title: 'Dados de terceiros: experts, visitantes e leads' },
		{ id: 'menores', title: 'Crianças e adolescentes' },
		{ id: 'alteracoes', title: 'Alterações desta política' },
		{ id: 'contato', title: 'Contato e encarregado' }
	];
</script>

<LegalDocument
	title="Política de Privacidade"
	description="Como o {P} trata dados pessoais, em conformidade com a LGPD (Lei nº 13.709/2018)."
	updatedAt={LEGAL.privacyUpdatedAt}
	{sections}
>
	<p>
		Esta Política explica, de forma clara, quais dados pessoais o <strong>{P}</strong> trata, por
		que trata, com quem compartilha, por quanto tempo guarda e como você pode exercer seus direitos.
		Ela segue a Lei Geral de Proteção de Dados Pessoais (<strong>LGPD — Lei nº 13.709/2018</strong
		>), o Marco Civil da Internet (Lei nº 12.965/2014) e as normas da Autoridade Nacional de
		Proteção de Dados (ANPD).
	</p>

	<h2 id="quem-somos">1. Quem somos</h2>
	<p>
		O {P} é operado por <strong>{LEGAL.companyName}</strong>, inscrita no CNPJ sob o nº
		{LEGAL.cnpj}, com sede em {LEGAL.address} (“{P}”, “nós”). Para os dados da sua conta e do uso da
		plataforma, somos o <strong>controlador</strong>, isto é, quem decide como e por que esses dados
		são tratados (art. 5º, VI, da LGPD).
	</p>

	<h2 id="abrangencia">2. A quem se aplica</h2>
	<p>
		Esta Política se aplica às pessoas que criam conta e usam o {P} — profissionais e empresas que gerenciam
		experts e campanhas de marketing digital —, às pessoas cujos dados são cadastrados na plataforma por
		nossos clientes (por exemplo, os experts) e às pessoas que visitam as páginas em que nossos clientes
		instalaram o pixel do {P} ou que preenchem formulários nessas páginas (“visitantes” e “leads”). Para
		visitantes e leads, veja especialmente a
		<a href="#dados-de-terceiros">seção 12</a>. O painel do {P} é um serviço profissional e não é destinado
		a menores de 18 anos.
	</p>

	<h2 id="dados-coletados">3. Dados que tratamos</h2>
	<div class="overflow-x-auto">
		<table>
			<thead>
				<tr><th>Categoria</th><th>Dados</th><th>Origem</th></tr>
			</thead>
			<tbody>
				<tr>
					<td>Conta</td>
					<td>
						Nome, sobrenome, e-mail, nome da empresa, papel na empresa (administrador ou membro) e
						senha — que nunca é armazenada em texto: guardamos apenas um resumo criptográfico
						irreversível (argon2id).
					</td>
					<td>Você, no cadastro</td>
				</tr>
				<tr>
					<td>Sessão e segurança</td>
					<td>
						Endereço IP, navegador/dispositivo (user agent), data e hora de acesso e de login e
						identificador da sessão.
					</td>
					<td>Coletados automaticamente ao usar a plataforma</td>
				</tr>
				<tr>
					<td>Experts e operação</td>
					<td>
						Nome, e-mail, nicho e perfil do Instagram de experts, IDs de conta de anúncios e de
						pixel e metas de desempenho.
					</td>
					<td>Cadastrados por você (cliente)</td>
				</tr>
				<tr>
					<td>Dados da Meta</td>
					<td>
						Quando você conecta uma conta do Facebook/Instagram: tokens de acesso (armazenados
						criptografados), identificadores de contas, páginas e perfis, métricas de campanhas e
						publicações, conforme as permissões que você conceder.
					</td>
					<td>Meta Platforms, mediante sua autorização</td>
				</tr>
				<tr>
					<td>Visitantes das páginas dos clientes (pixel)</td>
					<td>
						Eventos de navegação: visualização de página, cliques em elementos configurados e envio
						de formulários; endereço da página e de origem (referrer), parâmetros de campanha (UTM e
						fbclid), data e hora, navegador e dispositivo aproximados (user agent) e um
						identificador anônimo (cookie <code>_pulse_id</code>). O endereço IP é usado apenas para
						estimar a região aproximada e é guardado somente como resumo criptográfico (hash).
					</td>
					<td>Coletados pelo pixel instalado pelo cliente nas páginas dele</td>
				</tr>
				<tr>
					<td>Leads (formulários mapeados)</td>
					<td>
						Somente os campos que o cliente escolher mapear: nome, e-mail, telefone, campos
						personalizados e a marcação da caixa de consentimento, além do histórico de cadastros
						por lançamento. Senhas e dados de cartão nunca são lidos.
					</td>
					<td>Preenchidos pelo próprio titular no formulário da página do cliente</td>
				</tr>
				<tr>
					<td>Atendimento</td>
					<td>Mensagens e informações que você nos enviar pelos canais de contato.</td>
					<td>Você</td>
				</tr>
			</tbody>
		</table>
	</div>
	<p>
		Não tratamos dados pessoais sensíveis (art. 5º, II, da LGPD) e pedimos que você não os insira na
		plataforma nem os mapeie nos formulários rastreados pelo pixel.
	</p>

	<h2 id="finalidades">4. Finalidades e bases legais</h2>
	<p>Só tratamos dados com uma base legal prevista no art. 7º da LGPD:</p>
	<div class="overflow-x-auto">
		<table>
			<thead>
				<tr><th>Finalidade</th><th>Base legal</th></tr>
			</thead>
			<tbody>
				<tr>
					<td>Criar e manter sua conta, autenticar o acesso e prestar o serviço contratado</td>
					<td>Execução de contrato (art. 7º, V)</td>
				</tr>
				<tr>
					<td>Conectar contas da Meta, importar e exibir métricas de campanhas a seu pedido</td>
					<td>Execução de contrato (art. 7º, V)</td>
				</tr>
				<tr>
					<td>
						Proteger contas e a plataforma: detectar uso indevido de sessão, tentativas de invasão e
						fraudes
					</td>
					<td>Legítimo interesse (art. 7º, IX), limitado ao estritamente necessário</td>
				</tr>
				<tr>
					<td>Guardar registros de acesso à aplicação e atender requisições de autoridades</td>
					<td>
						Cumprimento de obrigação legal ou regulatória (art. 7º, II; art. 15 do Marco Civil da
						Internet)
					</td>
				</tr>
				<tr>
					<td>Responder solicitações de suporte e de titulares</td>
					<td>Execução de contrato e cumprimento de obrigação legal (art. 7º, V e II)</td>
				</tr>
				<tr>
					<td>Exercer direitos em processos judiciais, administrativos ou arbitrais</td>
					<td>Exercício regular de direitos (art. 7º, VI)</td>
				</tr>
				<tr>
					<td>
						Registrar eventos das páginas dos clientes e armazenar os leads dos formulários
						mapeados, para que o cliente meça campanhas e acesse seus contatos
					</td>
					<td>
						Definida pelo cliente, que é o controlador (por exemplo, consentimento ou legítimo
						interesse); o {P} trata como operador, seguindo as instruções do cliente (seção 12)
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<p>
		Não vendemos dados pessoais, não os usamos para publicidade de terceiros e não tomamos decisões
		baseadas unicamente em tratamento automatizado que afetem seus interesses (art. 20 da LGPD).
	</p>

	<h2 id="cookies">5. Cookies e armazenamento local</h2>
	<p>
		<strong>No painel do {P}</strong>, usamos apenas o que é estritamente necessário para o
		funcionamento e a segurança do serviço:
	</p>
	<ul>
		<li>
			<strong><code>refresh_token</code></strong> — cookie essencial de autenticação. É
			<em>HttpOnly</em> (inacessível a scripts), <em>Secure</em> e <em>SameSite=Strict</em>. Dura
			até o fim da sessão do navegador ou, se você marcar “Lembrar de mim”, até 30 dias.
		</li>
		<li>
			<strong>Armazenamento de sessão do navegador</strong> — dados técnicos de navegação da própria aplicação
			(posição de rolagem e histórico), sem dados pessoais, apagados ao fechar a aba.
		</li>
	</ul>
	<p>
		<strong
			>No painel, não usamos cookies de publicidade, de rastreamento ou de análise de terceiros.</strong
		>
		Por serem estritamente necessários, esses recursos não dependem de consentimento. As fontes tipográficas
		do site são carregadas do Google Fonts, o que faz seu navegador informar ao Google o seu endereço
		IP no carregamento da página.
	</p>
	<p>
		<strong>Nas páginas dos clientes que instalaram o pixel do {P}</strong>, são usados:
	</p>
	<ul>
		<li>
			<strong><code>_pulse_id</code></strong> — cookie primário (do próprio domínio da página do cliente)
			com um identificador anônimo, usado para reconhecer o mesmo navegador entre visitas e medir campanhas.
			Dura até 12 meses. Não contém nome, e-mail nem outros dados de identificação direta.
		</li>
		<li>
			<strong>Armazenamento de sessão do navegador</strong> — parâmetros de campanha (UTM) da visita atual
			e, só para o cliente que está configurando o pixel, o acesso temporário ao editor. Apagado ao fechar
			a aba.
		</li>
	</ul>
	<p>
		O cliente pode exigir consentimento antes de qualquer coleta, configurando o pixel com
		<code>data-consent="required"</code> e informando a escolha do visitante (por exemplo, pelo banner
		de cookies da página). Enquanto o consentimento não é dado, ou se for recusado, o pixel não envia
		nenhum evento e não cria o cookie. Cabe ao cliente, como controlador, decidir quando o consentimento
		é necessário e oferecer o banner.
	</p>

	<h2 id="compartilhamento">6. Compartilhamento</h2>
	<p>
		Compartilhamos dados apenas quando necessário e com as seguintes categorias de destinatários:
	</p>
	<ul>
		<li>
			<strong>Operadores que nos prestam serviços</strong>, contratualmente obrigados a tratar os
			dados só conforme nossas instruções: banco de dados gerenciado (Neon), armazenamento de
			sessões (Upstash), banco de dados analítico de eventos do pixel (ClickHouse Cloud), hospedagem
			({LEGAL.hostingProvider}), hospedagem do painel e do script do pixel (Netlify) e fontes
			tipográficas (Google Fonts).
		</li>
		<li>
			<strong>Meta Platforms</strong>, somente quando você conecta uma conta do Facebook/Instagram,
			para obter os dados autorizados por você. Quando o cliente ativar o envio de eventos à Meta
			(Conversions API), os eventos poderão ser enviados com e-mail e telefone do lead apenas em
			forma de resumo criptográfico (hash SHA-256). O uso dos dados pela própria Meta segue a
			política de privacidade dela.
		</li>
		<li><strong>Autoridades públicas</strong>, quando houver obrigação legal ou ordem judicial.</li>
		<li>
			<strong>Em operações societárias</strong> (fusão, aquisição ou incorporação), com garantia de continuidade
			desta Política.
		</li>
	</ul>

	<h2 id="transferencia-internacional">7. Transferência internacional</h2>
	<p>
		Alguns operadores mantêm servidores fora do Brasil ({LEGAL.dataRegion}). Nesses casos, a
		transferência ocorre nas hipóteses do art. 33 da LGPD, com a adoção de cláusulas-padrão
		contratuais nos termos da Resolução CD/ANPD nº 19/2024 ou de outro mecanismo admitido pela ANPD,
		garantindo nível de proteção compatível com o da lei brasileira.
	</p>

	<h2 id="retencao">8. Por quanto tempo guardamos</h2>
	<ul>
		<li>
			<strong>Dados da conta e dados cadastrados por você:</strong> enquanto a conta estiver ativa.
			Após o encerramento, são eliminados em até {LEGAL.accountDeletionDays} dias, salvo os casos de guarda
			obrigatória abaixo.
		</li>
		<li>
			<strong>Sessões:</strong> expiram após 7 dias sem uso e, no máximo, 30 dias após o login. São apagadas
			imediatamente ao sair da conta.
		</li>
		<li>
			<strong>Registros de acesso à aplicação</strong> (IP, data e hora): 6 meses, conforme o art. 15
			do Marco Civil da Internet.
		</li>
		<li>
			<strong>Dados da Meta:</strong> enquanto a conexão estiver ativa; são excluídos quando a conta é
			desconectada, quando a autorização é revogada ou mediante solicitação (veja a seção 11).
		</li>
		<li>
			<strong>Eventos do pixel:</strong> 13 meses, sendo apagados automaticamente depois disso.
		</li>
		<li>
			<strong>Métricas agregadas:</strong> totais de visitas, cliques e cadastros por lançamento, dia,
			página e origem são anonimizados, não permitem identificar nenhuma pessoa (art. 12 da LGPD) e podem
			ser mantidos por prazo indeterminado para comparação histórica.
		</li>
		<li>
			<strong>Leads:</strong> enquanto a conta do cliente estiver ativa ou até o cliente excluí-los. Após
			o encerramento da conta do cliente, são eliminados em até 90 dias.
		</li>
		<li>
			Dados necessários ao cumprimento de obrigação legal ou ao exercício de direitos podem ser
			mantidos pelo prazo exigido em lei (art. 16 da LGPD).
		</li>
	</ul>

	<h2 id="seguranca">9. Segurança e incidentes</h2>
	<p>Adotamos medidas técnicas e administrativas proporcionais ao risco (art. 46 da LGPD), como:</p>
	<ul>
		<li>Senhas protegidas com argon2id e nunca armazenadas em texto;</li>
		<li>Tokens de acesso a plataformas de terceiros criptografados (AES-256-GCM);</li>
		<li>
			Dados dos leads criptografados em repouso (AES-256-GCM), com identificação por resumo
			criptográfico com chave (HMAC) para reconhecer a mesma pessoa sem expor o dado;
		</li>
		<li>
			Endereço IP dos visitantes guardado apenas como hash e eventos do pixel armazenados sem dados
			de identificação direta, apenas com o identificador interno do lead;
		</li>
		<li>Registro de quem exportou os leads e quando;</li>
		<li>Comunicação criptografada (HTTPS/TLS) e cookies HttpOnly, Secure e SameSite;</li>
		<li>
			Credenciais de acesso de curta duração, renovação com detecção de reuso e encerramento remoto
			de sessões;
		</li>
		<li>
			Isolamento dos dados por empresa (tenant), controle de acesso por perfil e política de
			segurança de conteúdo (CSP) no navegador.
		</li>
	</ul>
	<p>
		Nenhum sistema é totalmente imune a falhas. Se ocorrer um incidente de segurança que possa
		acarretar risco ou dano relevante aos titulares, comunicaremos a ANPD e os titulares afetados
		nos prazos e na forma da Resolução CD/ANPD nº 15/2024.
	</p>

	<h2 id="direitos">10. Seus direitos</h2>
	<p>
		Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer momento (se você é visitante ou
		lead da página de um cliente, veja como fazer o pedido na
		<a href="#dados-de-terceiros">seção 12</a>):
	</p>
	<ul>
		<li>confirmação da existência de tratamento e acesso aos seus dados;</li>
		<li>correção de dados incompletos, inexatos ou desatualizados;</li>
		<li>
			anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em
			desconformidade com a lei;
		</li>
		<li>
			portabilidade dos dados a outro fornecedor, observados os segredos comercial e industrial;
		</li>
		<li>eliminação dos dados tratados com base no consentimento, quando for o caso;</li>
		<li>informação sobre as entidades com as quais compartilhamos seus dados;</li>
		<li>informação sobre a possibilidade de não consentir e suas consequências;</li>
		<li>revogação do consentimento, quando for a base legal utilizada;</li>
		<li>
			oposição a tratamento realizado com fundamento em outra base legal, em caso de descumprimento
			da lei;
		</li>
		<li>revisão de decisões tomadas unicamente com base em tratamento automatizado (art. 20).</li>
	</ul>
	<p>
		Para exercer esses direitos, escreva para <strong>{LEGAL.privacyEmail}</strong>. Poderemos pedir
		informações para confirmar sua identidade. A confirmação de existência e o acesso em formato
		simplificado são atendidos de imediato, e a declaração completa, em até 15 dias (art. 19 da
		LGPD). Você também pode apresentar petição à
		<a href="https://www.gov.br/anpd" rel="noopener noreferrer" target="_blank">ANPD</a>.
	</p>

	<h2 id="exclusao-de-dados-meta">11. Exclusão de dados da Meta (Facebook e Instagram)</h2>
	<p>Você pode solicitar a exclusão dos dados obtidos da Meta de qualquer uma destas formas:</p>
	<ol>
		<li>
			No {P}, abra o expert, vá em <strong>Integrações da Meta</strong> e desconecte a conta;
		</li>
		<li>
			No Facebook, acesse <strong>Configurações e privacidade → Configurações → Apps e sites</strong
			>, remova o {P} e solicite a exclusão dos dados;
		</li>
		<li>
			Envie um e-mail para <strong>{LEGAL.privacyEmail}</strong> com o assunto “Exclusão de dados da Meta”,
			informando o e-mail da sua conta.
		</li>
	</ol>
	<p>
		Excluímos os tokens de acesso e os dados importados da Meta associados à conta, exceto o que
		precisarmos manter por obrigação legal, e confirmamos a conclusão pelo mesmo canal.
	</p>

	<h2 id="dados-de-terceiros">12. Dados de terceiros: experts, visitantes e leads</h2>
	<p>
		Quando nossos clientes tratam dados de outras pessoas por meio do {P} — os experts que gerenciam,
		os visitantes das páginas em que instalaram o pixel e os leads dos formulários dessas páginas —, o
		cliente é o <strong>controlador</strong> desses dados e responsável por ter base legal para
		tratá-los; o {P} atua como <strong>operador</strong>, tratando-os apenas para prestar o serviço
		e conforme as instruções do cliente.
	</p>
	<h3>Como funciona o pixel</h3>
	<ul>
		<li>
			O cliente instala o pixel do {P} nas páginas dele e escolhe, no editor, quais cliques e formulários
			viram eventos.
		</li>
		<li>
			Nos formulários, o pixel lê <strong>somente os campos que o cliente mapeou</strong> (nome, e-mail,
			telefone, campos personalizados e a caixa de consentimento). Ele nunca lê senhas nem dados de cartão.
		</li>
		<li>
			Os dados dos leads ficam criptografados. A mesma pessoa é reconhecida como um único lead por
			expert, com o histórico dos cadastros em cada lançamento.
		</li>
		<li>
			O cliente pode ver, exportar (em CSV) e excluir os leads dele no painel. As exportações ficam
			registradas.
		</li>
	</ul>
	<h3>Como exercer seus direitos</h3>
	<p>
		Se você é um expert, um visitante ou um lead e quer exercer os direitos do art. 18 da LGPD
		(acesso, correção, eliminação, entre outros), procure a empresa responsável pela página ou que
		cadastrou seus dados — ela é a controladora. Se nos procurar diretamente em
		<strong>{LEGAL.privacyEmail}</strong>, encaminharemos o pedido a ela e apoiaremos o atendimento,
		inclusive com as ferramentas de exportação e exclusão da plataforma.
	</p>

	<h2 id="menores">13. Crianças e adolescentes</h2>
	<p>
		O {P} é destinado exclusivamente a maiores de 18 anos e não é direcionado a crianças e adolescentes,
		nos termos do Estatuto da Criança e do Adolescente e do ECA Digital (Lei nº 15.211/2025). Se identificarmos
		dados de menores tratados indevidamente, eles serão eliminados.
	</p>

	<h2 id="alteracoes">14. Alterações desta política</h2>
	<p>
		Podemos atualizar esta Política para refletir mudanças no serviço ou na legislação. A data da
		última atualização fica no topo da página e, em mudanças relevantes, avisaremos por e-mail ou na
		plataforma com antecedência razoável.
	</p>

	<h2 id="contato">15. Contato e encarregado</h2>
	<p>
		Encarregado pelo tratamento de dados pessoais (art. 41 da LGPD):
		<strong>{LEGAL.dpoName}</strong> — <strong>{LEGAL.privacyEmail}</strong>.
	</p>
	<p>
		Demais assuntos: <strong>{LEGAL.supportEmail}</strong>. {LEGAL.companyName}, CNPJ {LEGAL.cnpj},
		{LEGAL.address}.
	</p>
</LegalDocument>
