import { listExperts } from '#lib/services/experts.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => ({ experts: await listExperts() });
