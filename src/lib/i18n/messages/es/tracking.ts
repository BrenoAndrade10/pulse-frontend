import type { tracking as source } from '../pt-BR/tracking.js';

export const tracking: typeof source = {
	title: 'Rastreo',
	description:
		'Mide lo que hacen los visitantes en las páginas de {expert}: clics, registros y compras.',
	descriptionAll: 'Mide lo que hacen los visitantes en las páginas de tus expertos.',
	selectSubject: 'el rastreo',
	selectEmpty: 'El rastreo se configura por experto. Registra uno para comenzar.',
	loading: 'Cargando rastreo',
	urlErrors: {
		empty: 'Pega el enlace de la página.',
		invalid: 'Ese enlace no parece válido. Ej.: https://misitio.com/pagina',
		insecure: 'Usa una página con https://. El píxel solo funciona en sitios seguros.',
		notPublic: 'Usa la dirección pública de la página, como misitio.com.'
	},
	unavailable: {
		title: 'Rastreo en preparación',
		description:
			'Esta función aún no está disponible en el servidor. En cuanto se habilite, configurarás todo desde aquí.'
	},
	loadError: {
		title: 'No se pudo cargar el rastreo',
		description: 'Inténtalo de nuevo en unos instantes.'
	},
	activate: {
		title: 'Descubre quién hizo clic, se registró y compró',
		description:
			'Activa el píxel de Pulse para {expert}, instálalo en las páginas y elige, haciendo clic en la propia página, qué acciones se convierten en eventos. Sin tocar código para cada botón.',
		button: 'Activar rastreo',
		hint: 'Puedes desactivarlo cuando quieras.',
		error: 'No se pudo activar el rastreo. Inténtalo de nuevo.',
		step: 'Paso {number}:',
		highlights: {
			install: {
				title: 'Instala el píxel',
				text: 'Un código único, pegado una sola vez en el sitio.'
			},
			point: {
				title: 'Señala los elementos',
				text: 'En la propia página, haz clic en el botón o formulario.'
			},
			track: { title: 'Sigue los resultados', text: 'Leads, registros y compras por campaña.' }
		}
	},
	pages: {
		title: 'Páginas configuradas',
		description:
			'Páginas que ya tienen eventos y a qué lanzamiento cuentan los registros de cada una.',
		empty: 'Aún no hay páginas configuradas. Pega un enlace arriba para comenzar.',
		autoLaunch: 'Lanzamiento en curso (automático)',
		launchLabel: 'Lanzamiento de los registros de esta página',
		events: { one: '{count} evento', other: '{count} eventos' },
		updated: 'actualizada {time}',
		continue: 'Seguir configurando',
		saveError: 'No se pudo guardar el lanzamiento de la página. Inténtalo de nuevo.'
	},
	setup: {
		title: 'Configurar eventos',
		description:
			'Pega el enlace de la página. Eliges en la propia página qué clics y formularios se convierten en eventos.',
		urlLabel: 'Enlace de la página',
		urlPlaceholder: 'https://misitio.com/pagina-de-ventas',
		submit: 'Abrir y configurar',
		newDomain: '· se autorizará a enviar eventos a este píxel',
		notInstalled:
			'El píxel aún no envió ningún evento. Instala antes el código de abajo en esa página: sin él, el editor no aparece.',
		success:
			'Abrimos la página en una pestaña nueva. Configura los eventos allí: aparecerán aquí en cuanto se guarden.',
		popupBlocked:
			'El navegador bloqueó la nueva pestaña. Permite las ventanas emergentes para Pulse e inténtalo de nuevo.',
		openError: 'No se pudo abrir la configuración. Inténtalo de nuevo.',
		step: 'Paso {number}:',
		steps: {
			open: {
				title: 'Abre la página',
				text: 'Se abre en una pestaña nueva, con el editor de Pulse.'
			},
			click: {
				title: 'Haz clic en el elemento',
				text: 'Un botón, enlace o formulario de la página.'
			},
			event: { title: 'Elige el evento', text: 'Lead, compra, registro o un nombre propio.' }
		}
	},
	install: {
		title: 'Instalación del píxel',
		description: 'Instálalo una sola vez en todas las páginas que quieres medir.',
		installed: 'Instalado',
		waiting: 'Esperando el primer evento',
		lastEvent: 'Último evento {time}',
		copyAria: 'Copiar código del píxel',
		copy: 'Copiar',
		copied: 'Copiado',
		copiedAnnounce: 'Código copiado',
		guides: {
			html: {
				label: 'HTML',
				steps: {
					one: 'Abre el HTML de la página (o la plantilla que usan todas las páginas).',
					two: 'Pega el código justo antes de </head>.',
					three: 'Publica y abre la página una vez para que el píxel envíe el primer evento.'
				}
			},
			wordpress: {
				label: 'WordPress',
				steps: {
					one: 'Instala un plugin de códigos, como WPCode, o usa el campo de scripts de tu tema.',
					two: 'Agrega el código en el encabezado (Header) de todas las páginas.',
					three: 'Guarda, limpia la caché del sitio y abre la página una vez.'
				}
			},
			gtm: {
				label: 'Google Tag Manager',
				steps: {
					one: 'Crea una etiqueta de tipo HTML personalizado y pega el código.',
					two: 'Usa el activador All Pages (todas las páginas).',
					three: 'Publica el contenedor y abre la página una vez.'
				}
			}
		}
	}
};
