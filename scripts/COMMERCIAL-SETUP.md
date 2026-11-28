# Captação comercial: variáveis e Apps Script

## Variáveis novas (Netlify, somente servidor)

| Variável | Uso |
|---|---|
| `COMMERCIAL_SHARED_SECRET` | Segredo compartilhado (mín. 16 caracteres, aleatório) enviado pelas Functions `c-track` e `c-lead` ao Apps Script. |

Já existentes e reutilizadas: `GOOGLE_APPS_SCRIPT_URL`, `PUBLIC_SITE_URL` (usada na checagem de Origin). Opcional: `NETLIFY_DEV=true` (definida pelo `netlify dev`) faz o `c-lead` simular sucesso sem Apps Script. Em produção, sem URL ou segredo, o `c-lead` responde 503 e o cadastro não é confirmado; o `c-track` responde `skipped:true`.

## Reimplantar o Apps Script

1. Abra a planilha, `Extensões > Apps Script`, e substitua o conteúdo pelo de `scripts/google-apps-script.gs`.
2. `Configurações do projeto > Propriedades do script`: crie `COMMERCIAL_SHARED_SECRET` com o mesmo valor do Netlify.
3. Execute `setupCommercialSheets` uma vez (autorize). Cria `CommercialSessions`, `CommercialEvents` e `CommercialLeads` com cabeçalho congelado. As abas `Leads` e `Tracking` não são alteradas.
4. `Implantar > Gerenciar implantações > Editar > Nova versão` (mantém a mesma URL). Acesso: qualquer pessoa.
5. Defina `COMMERCIAL_SHARED_SECRET` no Netlify e faça novo deploy.

`node scripts/commercial-sheets-setup.mjs [NomeDaAba]` imprime os cabeçalhos (TSV) lidos do próprio script, para conferência.

## Colunas novas e migração

- `CommercialSessions` ganhou, no final, `Interações com demonstrações`: resumo `demoType|operationType:plays,progress,maxStep,completed,replays` separado por `; `, mesclado por máximo. As colunas antigas não mudam.
- `CommercialSessions` também ganhou `Cenários explorados` (lista única de `scenario` com FeatureExplore ou Demo*, mesclada por união). A chave do resumo de demonstrações passou a ser `demoType|(operationType ou scenario)`.
- Rodar `setupCommercialSheets` de novo (ou qualquer lote novo) acrescenta cabeçalhos faltantes ao final de abas já criadas, sem apagar dados.
- Eventos `DemoCompleted`/`DemoReplay` e props `demoType`, `step`, `maxStep`, `totalSteps`, `durationMs` vão na coluna `Propriedades` de `CommercialEvents`. Demos não vão ao Pixel.

## Comportamento

- Eventos: dedupe por `eventId` (CacheService por 6 h + últimas 600 linhas da aba); melhor esforço, sem garantia exactly-once.
- Sessões: uma linha por sessão, atualizada por merge (máximos, OR, união de listas) sob `LockService`, com `flush()` antes de liberar o lock.
- Leads: `leadId` derivado do `leadKey` do cliente (idempotente); e-mail repetido com outra chave retorna `duplicate:true` e não cria linha nem dispara `Lead`.
- Valores de texto iniciados por `= + - @` (e tab/CR) recebem `'` (formula injection) no servidor e no Apps Script.
- Testes (`?pl_test=1`, localhost) e possíveis automações vão marcados nas colunas `Teste`/`Possível automação`; filtre-os nas análises.
