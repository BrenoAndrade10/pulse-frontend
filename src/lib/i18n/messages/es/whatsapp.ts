import type { whatsapp as source } from '../pt-BR/whatsapp.js';

export const whatsapp: typeof source = {
	list: {
		pageTitle: 'WhatsApp',
		title: 'Mensajes de WhatsApp',
		descriptionExpert: 'Automatiza mensajes para los leads de {name}.',
		descriptionNoExpert: 'Automatiza mensajes a partir de los eventos de tus expertos.',
		create: 'Crear automatización',
		loading: 'Cargando automatizaciones',
		loadError: {
			title: 'No se pudieron cargar las automatizaciones',
			description: 'Actualiza la página e inténtalo de nuevo.'
		},
		empty: {
			title: 'Aún no hay automatizaciones',
			description: 'Envía mensajes automáticamente cuando tus leads realicen una acción.'
		},
		filters: {
			event: 'Filtrar por evento',
			destination: 'Filtrar por destino',
			allEvents: 'Todos los eventos',
			allDestinations: 'Todos los destinos',
			clear: 'Limpiar filtros',
			noResults: {
				title: 'No se encontraron automatizaciones',
				description: 'Cambia los filtros para ver otras automatizaciones.'
			}
		},
		destination: {
			private: 'Privado',
			group: 'Grupo',
			groupNamed: 'Grupo “{name}”'
		},
		status: {
			active: 'Activa',
			paused: 'Pausada'
		},
		delayMinutes: 'después de {value} min',
		delayHours: 'después de {value} h',
		buttonsOne: '{count} botón',
		buttonsOther: '{count} botones',
		pause: 'Pausar {name}',
		activate: 'Activar {name}',
		edit: 'Editar',
		duplicate: 'Duplicar',
		delete: 'Eliminar',
		copyName: '{name} (copia)',
		errors: {
			toggle: 'No se pudo cambiar el estado de la automatización.',
			duplicate: 'No se pudo duplicar la automatización.',
			delete: 'No se pudo eliminar la automatización.'
		},
		deleteDialog: {
			title: '¿Eliminar automatización?',
			description: '“{name}” se eliminará de forma permanente.'
		}
	},
	selectExpert: {
		subject: 'las automatizaciones de WhatsApp',
		emptyDescription: 'Las automatizaciones se configuran por experto. Registra uno para comenzar.'
	},
	page: {
		noExpert: {
			title: 'Ningún experto registrado',
			descriptionNew: 'Registra un experto antes de crear una automatización.',
			descriptionEdit: 'Registra un experto antes de editar una automatización.',
			action: 'Registrar experto'
		},
		loadingEditor: 'Cargando editor',
		notFound: 'Automatización no encontrada.'
	},
	preview: {
		label: 'Vista previa del mensaje en WhatsApp',
		business: 'Tu empresa',
		online: 'en línea',
		bodyPlaceholder: 'Tu mensaje aparece aquí.',
		buttonPlaceholder: 'Texto del botón',
		replyPlaceholder: 'La respuesta automática aparece aquí.'
	},
	editor: {
		titleNew: 'Nueva automatización',
		titleEdit: 'Editar automatización',
		description: 'Configura cuándo y cómo se enviará el mensaje por WhatsApp.',
		destination: {
			legend: '¿Dónde se enviará el mensaje?',
			privateTitle: 'Conversación privada',
			privateDescription: 'Envía un mensaje directamente al lead del evento.',
			groupTitle: 'Grupo de WhatsApp',
			groupDescription: 'Envía un mensaje a los participantes de un grupo.',
			soon: 'Próximamente',
			help: 'El envío a grupos aún no está disponible en la integración actual.'
		},
		legacy: {
			title: 'Automatización de grupo de solo lectura',
			description: 'Este destino pertenece a una versión anterior de la automatización.',
			alert:
				'El envío a grupos aún no está disponible en la integración actual. Esta automatización no se puede modificar ni guardar.',
			name: 'Nombre',
			group: 'Grupo',
			event: 'Evento',
			state: 'Estado',
			active: 'Activa',
			draft: 'Borrador'
		},
		preview: 'Vista previa',
		previewLive: 'Vista previa en tiempo real',
		general: {
			title: '1. Información general',
			description: 'Identifica esta automatización para encontrarla después.',
			name: 'Nombre de la automatización',
			namePlaceholder: 'Ej.: Bienvenida tras el registro'
		},
		trigger: {
			title: '2. Disparador',
			description: 'Elige el evento que inicia esta automatización.',
			event: 'Evento',
			launch: 'Lanzamiento',
			anyLaunch: 'Cualquier lanzamiento',
			pixelHint: 'Los eventos personalizados aparecerán después de configurar el rastreo.'
		},
		recipients: {
			title: '3. Destinatarios',
			description: 'Define quién recibirá este mensaje.',
			lead: 'Lead del evento',
			leadDescription: 'El mensaje se enviará al contacto que activó el evento.',
			warning: 'El lead debe haber ingresado su WhatsApp en el formulario.'
		},
		timing: {
			title: '4. Momento del envío',
			description: 'Elige si el mensaje se enviará de inmediato o con demora.',
			legend: 'Momento del envío',
			now: 'Al instante',
			nowDescription: 'Enviar en cuanto ocurra el evento.',
			later: 'Con demora',
			laterDescription: 'Esperar antes de enviar.',
			time: 'Tiempo',
			unit: 'Unidad',
			minutes: 'Minutos',
			hours: 'Horas'
		},
		message: {
			title: '5. Mensaje',
			description: 'Personaliza el contenido que se envía al contacto.',
			header: 'Encabezado (opcional)',
			body: 'Cuerpo del mensaje',
			footer: 'Pie de mensaje (opcional)',
			formatting: 'Formato del mensaje',
			bold: 'Negrita',
			italic: 'Cursiva',
			strike: 'Tachado',
			mono: 'Monoespaciado',
			placeholder: '¡Hola, {{primeiro_nome}}! Tu inscripción fue confirmada.',
			insertVariable: 'Insertar variable:',
			unknownVariable: 'Variable desconocida: {variables}.'
		},
		buttons: {
			title: '6. Botones',
			description: 'Agrega respuestas rápidas, un enlace o envía sin botones.',
			type: 'Tipo',
			none: 'Sin botones',
			quickReply: 'Respuesta rápida',
			link: 'Enlace',
			button: 'Botón {number}',
			moveUp: 'Mover botón hacia arriba',
			moveDown: 'Mover botón hacia abajo',
			remove: 'Quitar botón',
			label: 'Etiqueta',
			reply: 'Respuesta automática',
			url: 'URL',
			addQuickReply: 'Agregar respuesta rápida'
		},
		errors: {
			maxChars: 'Usa un máximo de {limit} caracteres.',
			nameRequired: 'Ingresa un nombre para la automatización.',
			bodyRequired: 'Escribe el mensaje que se enviará.',
			delayInvalid: 'Ingresa un número entero mayor que cero.',
			buttonLabel: 'Ingresa el texto de todos los botones.',
			buttonReply: 'Ingresa la respuesta automática de todos los botones.',
			buttonUrl: 'Ingresa una URL válida que comience con https://.',
			save: 'No se pudo guardar el borrador. Inténtalo de nuevo.'
		},
		confirmLeave: 'Tienes cambios sin guardar. ¿Quieres salir?',
		confirmDiscard: '¿Descartar los cambios de esta automatización?',
		footer: {
			help: 'El envío automático se habilitará cuando el backend de automatizaciones esté disponible.',
			saveDraft: 'Guardar borrador',
			activate: 'Activar automatización'
		}
	}
};
