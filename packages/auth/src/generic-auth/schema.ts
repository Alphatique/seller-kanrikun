import type { BetterAuthOptions } from 'better-auth';
import type { FieldAttribute } from 'better-auth/db';
import { z } from 'zod';

export const accountSchema = z.object({
	id: z.string(),
	providerId: z.string(),
	accountId: z.string(),
	userId: z.string(),
	accessToken: z.string().nullable().optional(),
	refreshToken: z.string().nullable().optional(),
	idToken: z.string().nullable().optional(),
	/**
	 * Access token expires at
	 */
	expiresAt: z.date().nullable().optional(),
	/**
	 * Password is only stored in the credential provider
	 */
	password: z.string().optional().nullable(),
});

export const userSchema = z.object({
	id: z.string(),
	email: z.string().transform(val => val.toLowerCase()),
	emailVerified: z.boolean().default(false),
	name: z.string(),
	image: z.string().optional(),
	createdAt: z.date().default(new Date()),
	updatedAt: z.date().default(new Date()),
});

export const sessionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	expiresAt: z.date(),
	ipAddress: z.string().optional(),
	userAgent: z.string().optional(),
});

export const verificationSchema = z.object({
	id: z.string(),
	value: z.string(),
	expiresAt: z.date(),
	identifier: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Verification = z.infer<typeof verificationSchema>;

// biome-ignore lint/suspicious/noExplicitAny:
export function parseOutputData<T extends Record<string, any>>(
	data: T,
	schema: {
		fields: Record<string, FieldAttribute>;
	},
) {
	const fields = schema.fields;
	// biome-ignore lint/suspicious/noExplicitAny:
	const parsedData: Record<string, any> = {};
	for (const key in data) {
		const field = fields[key];
		if (!field) {
			parsedData[key] = data[key];
			continue;
		}
		if (field.returned === false) {
			continue;
		}
		parsedData[key] = data[key];
	}
	return parsedData as T;
}

export function getAllFields(options: BetterAuthOptions, table: string) {
	let schema: Record<string, FieldAttribute> = {
		...(table === 'user' ? options.user?.additionalFields : {}),
		...(table === 'session' ? options.session?.additionalFields : {}),
	};
	for (const plugin of options.plugins || []) {
		if (plugin.schema?.[table]) {
			schema = {
				...schema,
				...plugin.schema[table].fields,
			};
		}
	}
	return schema;
}

export function parseUserOutput(options: BetterAuthOptions, user: User) {
	const schema = getAllFields(options, 'user');
	return parseOutputData(user, { fields: schema });
}

export function parseAccountOutput(
	options: BetterAuthOptions,
	account: Account,
) {
	const schema = getAllFields(options, 'account');
	return parseOutputData(account, { fields: schema });
}

export function parseSessionOutput(
	options: BetterAuthOptions,
	session: Session,
) {
	const schema = getAllFields(options, 'session');
	return parseOutputData(session, { fields: schema });
}

// biome-ignore lint/suspicious/noExplicitAny:
export function parseInputData<T extends Record<string, any>>(
	data: T,
	schema: {
		fields: Record<string, FieldAttribute>;
		action?: 'create' | 'update';
	},
) {
	const action = schema.action || 'create';
	const fields = schema.fields;
	// biome-ignore lint/suspicious/noExplicitAny:
	const parsedData: Record<string, any> = {};
	for (const key in fields) {
		if (key in data) {
			if (fields[key].input === false) {
				if (fields[key].defaultValue) {
					parsedData[key] = fields[key].defaultValue;
					continue;
				}
				continue;
			}
			parsedData[key] = data[key];
			continue;
		}
		if (fields[key].defaultValue && action === 'create') {
			parsedData[key] = fields[key].defaultValue;
		}
	}
	return parsedData as Partial<T>;
}

export function parseUserInput(
	options: BetterAuthOptions,
	// biome-ignore lint/suspicious/noExplicitAny:
	user?: Record<string, any>,
	action?: 'create' | 'update',
) {
	const schema = getAllFields(options, 'user');
	return parseInputData(user || {}, { fields: schema, action });
}

export function parseAdditionalUserInput(
	options: BetterAuthOptions,
	// biome-ignore lint/suspicious/noExplicitAny:
	user?: Record<string, any>,
) {
	const schema = getAllFields(options, 'user');
	return parseInputData(user || {}, { fields: schema });
}

export function parseAccountInput(
	options: BetterAuthOptions,
	account: Partial<Account>,
) {
	const schema = getAllFields(options, 'account');
	return parseInputData(account, { fields: schema });
}

export function parseSessionInput(
	options: BetterAuthOptions,
	session: Partial<Session>,
) {
	const schema = getAllFields(options, 'session');
	return parseInputData(session, { fields: schema });
}
