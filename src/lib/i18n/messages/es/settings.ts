import type { settings as source } from '../pt-BR/settings.js';

export const settings: typeof source = {
	pageTitle: 'Configuración',
	description: 'Datos de tu cuenta, equipo y seguridad.',
	guide: {
		title: 'Guía de configuración',
		dismissed:
			'La guía está oculta en el Dashboard. Tu progreso se calcula a partir de los datos reales de la cuenta.',
		completed: 'Completaste la guía. Reábrela para revisar los pasos de tu configuración.',
		visible: 'La guía está visible en el Dashboard.',
		reopen: 'Reabrir guía en el Dashboard'
	},
	security: {
		title: 'Seguridad',
		loadingAria: 'Cargando configuración de seguridad',
		loadError: 'No se pudo cargar la configuración de seguridad.',
		authenticator: {
			title: 'Aplicación de autenticación (opcional)',
			description: 'Usa una aplicación de autenticación en lugar del código enviado por correo.',
			enabled: 'Activada',
			disabled: 'Desactivada',
			codesAvailable: { one: '{count} código disponible', other: '{count} códigos disponibles' },
			regenerate: 'Generar nuevos códigos de recuperación',
			activate: 'Activar app de autenticación',
			startError: 'No se pudo iniciar la configuración.',
			activateError: 'No se pudo activar la aplicación de autenticación.',
			generateError: 'No se pudieron generar nuevos códigos.'
		},
		devices: {
			title: 'Navegadores de confianza',
			description: 'Accesos que pueden ingresar sin solicitar el código por hasta 30 días.',
			empty: 'Ningún navegador de confianza.',
			current: 'Este navegador',
			usage: 'Último uso: {lastUsed} · Vence el: {expiresAt}',
			removeError: 'No se pudo eliminar el navegador de confianza.',
			removeTitle: '¿Eliminar navegador de confianza?',
			removeDescription: '{label} deberá ingresar el código de verificación en el próximo acceso.'
		},
		setup: {
			title: 'Activar app de autenticación',
			instructions:
				'Escanea el código QR con tu aplicación de autenticación e ingresa el código generado.',
			qrAlt: 'Código QR para configurar la aplicación de autenticación',
			cantScan: '¿No puedes escanear?',
			copyKey: 'Copiar clave',
			copied: 'Copiada',
			activate: 'Activar'
		},
		recovery: {
			title: 'Generar nuevos códigos',
			instructions: 'Ingresa el código actual de tu aplicación de autenticación.',
			generate: 'Generar códigos'
		},
		codeLabel: 'Código de 6 dígitos',
		finish: 'Finalizar'
	}
};
