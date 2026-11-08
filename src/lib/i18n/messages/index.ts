import * as en from './en/index.js';
import * as es from './es/index.js';
import * as ptBR from './pt-BR/index.js';

export type Messages = typeof ptBR;

export const messages = { 'pt-BR': ptBR, es, en } as const;
