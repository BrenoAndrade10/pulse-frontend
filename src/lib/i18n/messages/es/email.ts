import type { email as source } from '../pt-BR/email.js';

export const email: typeof source = {
	page: {
		title: 'Correo',
		description: 'Envía campañas a tus leads y sigue clics y entregas.',
		newCampaign: 'Nueva campaña'
	},
	tabs: {
		tablist: 'Secciones de correo',
		campaigns: 'Campañas',
		automations: 'Automatizaciones',
		settings: 'Configuración'
	},
	status: {
		draft: 'Borrador',
		scheduled: 'Programada',
		sending: 'Enviando',
		sent: 'Enviada',
		active: 'Activa',
		paused: 'Pausada',
		canceled: 'Cancelada',
		failed: 'Falló'
	},
	campaigns: {
		kpi: {
			sent: 'Enviados',
			scheduled: 'Programadas',
			failed: 'Con fallos'
		},
		search: 'Buscar campaña',
		allStatuses: 'Todos los estados',
		table: {
			campaign: 'Campaña',
			segment: 'Segmento',
			status: 'Estado',
			sent: 'Enviados',
			date: 'Fecha'
		},
		subjectLine: 'Asunto: {subject}',
		noSubject: 'Sin asunto',
		progress: 'Enviando {percent}',
		now: 'Ahora',
		count: {
			one: '{formatted} campaña',
			other: '{formatted} campañas'
		},
		empty: {
			title: 'Aún no hay campañas',
			description: 'Crea tu primera campaña y envíala a un segmento de leads.',
			noResults: 'No se encontraron campañas',
			noResultsDescription: 'Ajusta la búsqueda o el filtro de estado.'
		}
	},
	automations: {
		empty: {
			title: 'Aún no hay automatizaciones',
			description: 'Las automatizaciones por disparador aparecen aquí cuando se creen.'
		},
		description: 'Envíos automáticos activados por el comportamiento del lead.',
		new: 'Nueva automatización',
		soon: 'Próximamente',
		search: 'Buscar automatización',
		table: {
			automation: 'Automatización',
			trigger: 'Disparador',
			status: 'Estado',
			sent: 'Enviados',
			clicks: 'Clics',
			actions: 'Acciones'
		},
		actions: {
			pause: 'Pausar',
			resume: 'Reactivar',
			edit: 'Editar'
		},
		triggers: {
			newLead: 'Nuevo lead registrado',
			becameHot: 'El lead se volvió caliente',
			clickedLink: 'Hizo clic en un enlace',
			inactive: 'Sin acción en 7 días'
		},
		count: {
			one: '{formatted} automatización',
			other: '{formatted} automatizaciones'
		}
	},
	settings: {
		errors: {
			taken: 'Este dominio ya está en uso por otro expert.',
			domainRequired: 'Agrega un dominio antes de continuar.',
			notVerified: 'Verifica el dominio de envío antes de enviar.',
			unavailable: 'El proveedor de correo no está disponible ahora. Inténtalo en unos instantes.',
			campaignNotFound: 'Campaña no encontrada.',
			campaignLocked: 'Esta campaña ya se envió o se está enviando y no se puede modificar.',
			campaignInvalid: 'Completa el nombre, el asunto y el mensaje para enviar.',
			scheduleInvalid: 'Elige una fecha y hora futuras, dentro de 1 año.',
			domainInvalid: 'Ingresa un dominio válido, como mail.tudominio.com.',
			senderInvalid: 'Ingresa el nombre y el correo del remitente.',
			providerRejected: 'El proveedor de correo rechazó este dominio.',
			generic: 'No se pudo completar. Inténtalo de nuevo.',
			load: 'No se pudo cargar la configuración de correo.'
		},
		domain: {
			placeholder: 'mail.tudominio.com',
			title: 'Dominio de envío',
			description: 'Agrega estos registros en el proveedor de tu dominio.',
			label: 'Dominio',
			verify: 'Verificar ahora',
			verifying: 'Verificando…',
			status: {
				none: 'No configurado',
				pending: 'Esperando DNS',
				verified: 'Dominio verificado'
			}
		},
		records: {
			empty: 'Los registros DNS aparecen aquí después de agregar el dominio.',
			type: 'Tipo',
			name: 'Nombre',
			value: 'Valor',
			status: 'Estado',
			ok: 'OK',
			pending: 'Pendiente',
			recommended: 'Recomendado',
			copy: 'Copiar valor',
			copied: 'Copiado'
		},
		sender: {
			title: 'Remitente',
			description: 'Cómo aparece tu correo en la bandeja de entrada.',
			name: 'Nombre',
			email: 'Correo',
			replyTo: 'Responder a',
			save: 'Guardar',
			saved: 'Cambios guardados',
			test: 'Enviar correo de prueba',
			testSent: 'Prueba enviada a {email}'
		},
		health: {
			inactive: 'Envío inactivo',
			title: 'Salud del envío',
			description: 'Pausamos automáticamente si la reputación baja.',
			bounce: 'Rebote',
			complaint: 'Quejas',
			limit: 'límite {limit}',
			state: 'Situación',
			active: 'Envío activo'
		},
		limits: {
			empty: 'Los límites se aplican cuando el dominio esté verificado.',
			title: 'Límites y calentamiento',
			description: 'El tope sube poco a poco para proteger el dominio nuevo.',
			today: 'Hoy',
			unit: 'de {limit} correos',
			warmup: 'Día {day} de {total} de calentamiento · mañana {next}'
		},
		suppressions: {
			title: 'Bajas y bloqueos',
			description: 'Quien se dio de baja o rebotó nunca vuelve a recibir.',
			unsub: 'Dados de baja',
			bounces: 'Rebotes',
			complaints: 'Quejas',
			view: 'Ver lista'
		}
	},
	report: {
		back: 'Campañas',
		subline: 'Segmento {segment} · {date}',
		export: 'Exportar CSV',
		kpi: {
			recipients: 'Destinatarios',
			pending: 'En cola',
			suppressed: 'Suprimidos',
			failed: 'Fallos',
			sent: 'Enviados',
			delivered: 'Entregados',
			clicks: 'Clics',
			opens: 'Aperturas*',
			unsub: 'Bajas',
			bounces: 'Rebotes',
			people: '{count} personas',
			emails: '{count} correos',
			estimated: 'estimado'
		},
		chart: {
			title: 'Clics a lo largo del tiempo',
			description: 'Primeras 24 horas tras el envío',
			aria: 'Clics por hora'
		},
		links: {
			empty: 'Aún no hay clics registrados.',
			title: 'Enlaces más clicados',
			description: 'A dónde fueron las personas'
		},
		who: {
			empty: 'Nadie ha hecho clic aún.',
			title: 'Quién hizo clic',
			description: 'Cada clic ya alimenta el Pulse Heat de estas personas',
			createSegment: 'Crear segmento con quien hizo clic',
			lead: 'Lead',
			heat: 'Heat',
			clickedIn: 'Hizo clic en',
			clicks: 'Clics',
			last: 'Último clic'
		},
		opensNote:
			'*Las aperturas son estimadas: apps como Apple Mail precargan las imágenes. Los clics son la métrica más fiable.',
		notFound: 'Campaña no encontrada',
		cancel: 'Cancelar envío',
		cancelTitle: '¿Cancelar esta campaña?',
		cancelDescription:
			'Los correos que aún no salieron no se enviarán. Quien ya los recibió no se ve afectado.',
		cancelConfirm: 'Cancelar envío',
		cancelKeep: 'Mantener',
		failedDomain: 'No se pudo enviar: el dominio de envío no está verificado.'
	},
	compose: {
		title: 'Nueva campaña',
		editTitle: 'Editar campaña',
		description: 'Escribe el mensaje que se enviará a tus leads.',
		subject: 'Asunto',
		message: 'Mensaje',
		back: 'Campañas',
		subjectPlaceholder: 'Bienvenido, {{nome}}',
		editorPlaceholder: 'Escribe el mensaje del correo',
		steps: {
			segment: 'Segmento',
			content: 'Contenido',
			review: 'Revisión y envío'
		},
		stepLabel: 'Paso {{n}}',
		stepsAria: 'Pasos de la campaña',
		stepHints: {
			segment: 'Elige quién lo recibe',
			content: 'Escribe y previsualiza',
			review: 'Revisa y envía'
		},
		segment: {
			title: 'A quién enviar',
			description: 'Elige un segmento. La lista se arma al momento del envío.',
			hot: 'Caliente',
			warm: 'Tibio',
			idle: 'Sin acción',
			hotHint: 'leads prioritarios',
			warmHint: 'leads comprometidos',
			idleHint: 'recibieron y no actuaron',
			recipients: '{count} destinatarios',
			suppressed: '{count} suprimidos (baja o rebote)',
			withinLimit: 'Dentro del límite diario',
			overLimit: 'Sobre el límite diario: el envío se dividirá en días'
		},
		preview: {
			title: 'Vista previa',
			desktop: 'Escritorio',
			mobile: 'Móvil',
			from: 'De',
			subject: 'Asunto',
			footer: 'Recibiste esto porque te registraste en las páginas de {expert}.',
			unsubscribe: 'Darse de baja'
		},
		actions: {
			next: 'Continuar',
			back: 'Volver',
			saveDraft: 'Guardar borrador',
			send: 'Enviar campaña',
			schedule: 'Programar envío'
		},
		review: {
			needsDomain:
				'Configura y verifica el dominio de envío en la pestaña Configuración para enviar.',
			title: 'Revisa antes de enviar',
			segment: 'Segmento',
			recipients: 'Destinatarios',
			sender: 'Remitente',
			subject: 'Asunto',
			when: 'Cuándo enviar',
			now: 'Ahora',
			later: 'Programar'
		},
		validation: {
			subject: 'Indica el asunto',
			content: 'Escribe el mensaje'
		}
	},
	editor: {
		label: 'Editor del mensaje',
		toolbar: 'Herramientas de formato',
		undo: 'Deshacer',
		redo: 'Rehacer',
		blockType: 'Tipo de bloque',
		paragraph: 'Párrafo',
		heading1: 'Título 1',
		heading2: 'Título 2',
		heading3: 'Título 3',
		bold: 'Negrita',
		italic: 'Cursiva',
		underline: 'Subrayado',
		strike: 'Tachado',
		color: 'Color del texto',
		alignLeft: 'Alinear a la izquierda',
		alignCenter: 'Centrar',
		alignRight: 'Alinear a la derecha',
		bulletList: 'Lista con viñetas',
		orderedList: 'Lista numerada',
		quote: 'Cita',
		divider: 'Línea divisoria',
		link: 'Enlace',
		unlink: 'Quitar enlace',
		image: 'Imagen',
		button: 'Botón',
		variables: 'Variables',
		source: 'Código HTML',
		url: 'Dirección del enlace',
		apply: 'Aplicar',
		insert: 'Insertar',
		imageUrl: 'Dirección de la imagen',
		imageAlt: 'Texto alternativo',
		buttonLabel: 'Texto del botón',
		variablesHint: 'Inserta los datos de cada persona:'
	}
};
