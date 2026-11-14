// Dutch interface texts (written by people). English text is the key.
import shared from './nl/shared';
import app from './nl/app';
import screens from './nl/screens';
import learning from './nl/learning';
import tools from './nl/tools';
import errors from './nl/errors';

export const NL: Record<string, string> = { ...shared, ...app, ...screens, ...learning, ...tools, ...errors };
