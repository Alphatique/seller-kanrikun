import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

import * as build from '../build/server';

// @ts-expect-error
export const onRequest = createPagesFunctionHandler({ build });
