import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

// @ts-ignore
import * as build from '../build/server';

// @ts-ignore
export const onRequest = createPagesFunctionHandler({ build });
