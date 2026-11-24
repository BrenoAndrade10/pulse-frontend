export default async (request: Request) =>
	new Response(
		JSON.stringify({
			success: false,
			message: 'A função de entrevista requer o token seguro gerado no cadastro.'
		}),
		{ status: 501, headers: { 'content-type': 'application/json' } }
	);
