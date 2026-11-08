import type { reels as source } from '../pt-BR/reels.js';

export const reels: typeof source = {
	page: {
		title: 'Publicaciones',
		descriptionExpert: 'Fotos, carruseles, videos y Reels de Instagram de {name}.',
		descriptionAll: 'Contenido publicado por las cuentas conectadas.',
		configureInstagram: 'Configurar Instagram',
		automationsError:
			'No se pudieron cargar los DM automáticos. Las publicaciones se muestran con normalidad; actualiza la página para configurar los DM.',
		loadMore: 'Cargar más'
	},
	selectExpert: {
		subject: 'las publicaciones de Instagram',
		emptyDescription: 'Registra un experto antes de conectar una cuenta de Instagram.'
	},
	errors: {
		loadMore: 'No se pudieron cargar más publicaciones.',
		searchIncomplete:
			'No se pudo buscar en todas las publicaciones. Los resultados muestran solo las ya cargadas.',
		notConnected: {
			title: 'Instagram no conectado',
			description: 'Conecta la cuenta profesional de este experto para ver las publicaciones.'
		},
		expired: {
			title: 'Conexión vencida',
			description:
				'Vuelve a conectar el Instagram de este experto para seguir importando las publicaciones.'
		},
		invalid: {
			title: 'Acceso a Instagram rechazado',
			description:
				'Meta ya no aceptó la autorización de esta cuenta. Vuelve a conectar el Instagram del experto.'
		},
		unavailable: {
			title: 'Instagram no respondió',
			description: 'La cuenta sigue conectada. Inténtalo de nuevo en unos instantes.'
		},
		unexpected: {
			title: 'No se pudieron cargar las publicaciones',
			description: 'Inténtalo de nuevo en unos instantes.'
		},
		reconnect: 'Reconectar Instagram',
		connect: 'Conectar Instagram'
	},
	empty: {
		title: 'Aún no hay publicaciones',
		description: 'Las publicaciones de esta cuenta de Instagram aparecerán aquí.',
		noResultsTitle: 'No se encontraron publicaciones',
		noResultsDescription:
			'Prueba con otras palabras del texto, pega el enlace de la publicación o cambia los filtros.',
		clearFilters: 'Borrar filtros'
	},
	search: {
		label: 'Buscar publicaciones',
		placeholder: 'Buscar por el texto o pegar el enlace de la publicación',
		clear: 'Borrar búsqueda',
		kindFilter: 'Filtrar por tipo',
		dmFilter: 'Filtrar por DM automático',
		sort: 'Ordenar publicaciones'
	},
	filters: {
		kind: {
			all: 'Todos los tipos',
			reel: 'Reels',
			photo: 'Fotos',
			carousel: 'Carruseles',
			video: 'Videos'
		},
		dm: {
			all: 'Con o sin DM',
			active: 'Con DM activo',
			paused: 'Con DM en pausa',
			none: 'Sin DM automático'
		},
		sort: {
			recent: 'Más recientes',
			comments: 'Más comentadas',
			likes: 'Más gustadas'
		}
	},
	status: {
		loading: 'Cargando publicaciones',
		scanning: 'Buscando en todas las publicaciones… {count} cargadas hasta ahora.',
		found: {
			one: '{count} publicación encontrada',
			other: '{count} publicaciones encontradas'
		},
		foundInRecent: 'en las {count} más recientes',
		foundInTotal: 'de {count}',
		searchOlder: 'Buscar en las más antiguas',
		chooseOne: 'Elige una publicación y configura la palabra clave que activa el DM automático.',
		activeCount: {
			one: '{count} publicación con DM automático activo.',
			other: '{count} publicaciones con DM automático activo.'
		}
	},
	card: {
		noCaption: 'Sin texto',
		dateUnavailable: 'Fecha no disponible',
		likesTitle: 'Me gusta',
		likes: { one: '{count} me gusta', other: '{count} me gusta' },
		commentsTitle: 'Comentarios',
		comments: { one: '{count} comentario', other: '{count} comentarios' },
		dmActive: 'DM activo',
		dmPaused: 'DM en pausa',
		withButton: 'DM con botón',
		withButtonSr: 'con botón',
		repliesComment: 'Responde el comentario',
		repliesCommentSr: 'responde el comentario',
		noDm: 'Sin DM automático',
		editAria: 'Editar DM automático',
		configureAria: 'Configurar DM automático',
		edit: 'Editar',
		configure: 'Configurar DM'
	},
	media: {
		kind: {
			reel: 'Reel',
			photo: 'Foto',
			carousel: 'Carrusel',
			video: 'Video'
		},
		previous: 'Elemento anterior',
		next: 'Siguiente elemento',
		unavailable: 'Contenido no disponible por el momento',
		carousel: 'carrusel',
		item: 'elemento',
		groupWithItems: '{kind} con {count} elementos',
		itemOf: '{index} de {total}',
		coverAlt: 'Portada: {text}',
		pause: 'Pausar video',
		play: 'Reproducir video',
		unmute: 'Activar sonido',
		mute: 'Silenciar',
		openInstagram: 'Abrir en Instagram'
	},
	dialog: {
		title: 'DM automático',
		noCaption: 'Publicación sin texto',
		close: 'Cerrar',
		intro:
			'Cuando alguien comente una de las palabras clave en esta publicación, recibirá el siguiente mensaje por Direct.',
		keywords: 'Palabras clave',
		removeKeyword: 'Quitar {keyword}',
		addAnother: 'Agregar otra',
		keywordPlaceholder: 'Ej.: quiero, link, lo quiero',
		keywordHint:
			'Presiona Enter o coma para agregar (hasta {max}). Las mayúsculas y los acentos no importan, y la palabra debe aparecer completa en el comentario.',
		keywordTooLong: 'Cada palabra clave debe tener como máximo {max} caracteres.',
		keywordRequired: 'Agrega al menos una palabra clave.',
		message: 'Mensaje del DM',
		messagePlaceholder: '¡Hola! Qué bueno que quieres saber más. Aquí está el enlace: …',
		messageHint:
			'Se envía una sola vez por comentario, como respuesta privada. Quien no sigue la cuenta lo recibe en Solicitudes de mensaje.',
		messageTooLongWithButton: 'Con botón, el mensaje puede tener hasta {max} caracteres.',
		messageRequired: 'Escribe el mensaje que se enviará por DM.',
		withButton: 'Agregar botón con enlace',
		withButtonHint: 'Aparece justo debajo del mensaje y abre el enlace al tocarlo.',
		buttonLabel: 'Texto del botón',
		buttonLabelPlaceholder: 'Ej.: Ver material',
		buttonLabelRequired: 'Escribe el texto del botón.',
		buttonUrl: 'Enlace',
		buttonUrlRequired: 'Indica el enlace que abre el botón.',
		buttonUrlInvalid: 'Usa un enlace que comience con https://.',
		preview: 'Vista previa del DM',
		previewEmpty: 'Tu mensaje aparece aquí.',
		withCommentReply: 'Responder el comentario públicamente',
		withCommentReplyHint: 'Se publica en el comentario después de enviar el DM.',
		commentReply: 'Respuesta al comentario',
		commentReplyPlaceholder: 'Ej.: ¡Te lo mandé por Direct! 📩',
		commentReplyHint: 'Es visible para todos. Si el DM no se envía, el comentario no se responde.',
		commentReplyRequired: 'Escribe la respuesta al comentario o desmarca la opción.',
		active: 'Automatización activa',
		activeHint: 'Desmarca para pausar sin perder la configuración.',
		sent: { one: '{count} DM enviado', other: '{count} DM enviados' },
		lastSent: '· último el {date}',
		delete: 'Eliminar',
		cancel: 'Cancelar',
		save: 'Guardar',
		saveFailed: 'No se pudo guardar. Inténtalo de nuevo.',
		deleteFailed: 'No se pudo eliminar la automatización. Inténtalo de nuevo.',
		apiErrors: {
			notConnected: 'Conecta el Instagram de este experto antes de activar el DM automático.',
			expired:
				'La conexión con Instagram venció. Vuelve a conectar la cuenta para activar el DM automático.',
			invalid: 'Meta rechazó el acceso de esta cuenta. Vuelve a conectar el Instagram del experto.',
			graphError:
				'Meta no confirmó el seguimiento de los comentarios de esta cuenta. Inténtalo de nuevo en unos instantes.',
			unavailable: 'Instagram no respondió. Inténtalo de nuevo en unos instantes.'
		}
	}
};
