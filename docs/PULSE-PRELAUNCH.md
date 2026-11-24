# Pulse Lead — pré-lançamento

## Rodar localmente

`npm install` e `npm run dev`. Para testar o formulário e as Netlify Functions localmente, use `npx netlify dev` e acesse a URL informada pelo Netlify CLI. O comando `npm run dev` sozinho serve apenas o frontend e fará `/.netlify/functions/submit-lead` retornar a página HTML da aplicação.

## Contador

Defina `PUBLIC_LAUNCH_DATE` com uma data absoluta ISO 8601 e timezone explícito, por exemplo `2027-01-27T09:00:00-03:00`. O valor é a data-alvo compartilhada por todos os visitantes; não é recalculado no build nem salvo no navegador. O contador é client-side, portanto relógios incorretos do dispositivo podem alterar a exibição local.

## Google Sheets — opção simples, sem Google Cloud

A opção recomendada para começar é usar um Google Apps Script vinculado à própria planilha. Não é necessário criar projeto no Google Cloud nem Service Account.

1. Crie uma planilha e uma aba chamada `Leads`.
2. Na planilha, abra `Extensões > Apps Script`.
3. Cole o conteúdo de `scripts/google-apps-script.gs`.
4. Salve e publique em `Implantar > Nova implantação > Aplicativo da Web`.
5. Escolha executar como você e permitir acesso a qualquer pessoa com o link.
6. Copie a URL `/exec` da implantação para `GOOGLE_APPS_SCRIPT_URL` nas variáveis do Netlify.
7. Faça um envio de teste e confirme se uma nova linha apareceu na aba `Leads`.

O formulário continua enviando para a Netlify Function; a Function encaminha os dados ao Apps Script server-side, evitando problemas de CORS.

## Google Sheets — opção avançada

1. Crie um projeto no Google Cloud Console e habilite Google Sheets API.
2. Crie uma Service Account, gere uma chave JSON e copie o e-mail da conta.
3. Crie uma planilha privada, uma aba `Leads`, e compartilhe a planilha com o e-mail da Service Account como Editor.
4. Copie o Spreadsheet ID da URL e preencha `GOOGLE_SHEETS_SPREADSHEET_ID`.
5. Preencha `GOOGLE_SERVICE_ACCOUNT_EMAIL` e `GOOGLE_PRIVATE_KEY` (em Netlify, mantenha os `\\n` ou cole o valor multilinha).
6. O script de inicialização usa `scripts/initialize-sheets.mjs` e requer o pacote `googleapis` apenas para setup: `npm install -D googleapis`, então `node scripts/initialize-sheets.mjs`.

A Function grava com `valueInputOption=RAW`, limita tamanhos, normaliza e-mail/telefone, escapa prefixos de formula e registra consentimentos/atribuição. Google Sheets não oferece transação; a chave de idempotência é enviada pelo cliente e serve como base para evolução de deduplicação proporcional ao volume. Não há banco dedicado.

## Netlify e tracking

Configure todas as variáveis de `.env.example` no Site settings do Netlify. `PUBLIC_META_PIXEL_ID` está reservado para o carregamento assíncrono do Pixel na próxima etapa de configuração; a página continua funcional sem ele. Os eventos previstos são `PageView`, `FormStart`, `FormStepCompleted` e `Lead` após confirmação do Sheets.

Exemplo de URL de anúncio:

`?utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign=pulse_research&utm_content={{ad.name}}&utm_term={{placement}}&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}`

## Checklist antes de publicar

- Confirmar elegibilidade, plano incluído, condições dos 30 dias e instruções de resgate.
- Definir a data oficial e preencher `PUBLIC_LAUNCH_DATE`.
- Configurar política de privacidade e Pixel, se aplicável.
- Compartilhar a planilha com a Service Account e executar a inicialização.
- Testar submissão real em ambiente controlado e verificar a linha criada.
- Rodar `npm run check`, `npm run lint` e `npm run build`.

Não foi possível validar a gravação real nem o Pixel neste ambiente porque dependem de credenciais externas. O build local e a validação estática devem ser executados antes do deploy.
