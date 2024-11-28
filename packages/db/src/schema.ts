import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('emailVerified', {
		mode: 'boolean',
	}).notNull(),
	image: text('image'),
	createdAt: integer('createdAt', {
		mode: 'timestamp',
	}).notNull(),
	updatedAt: integer('updatedAt', {
		mode: 'timestamp',
	}).notNull(),
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	token: text('token').notNull(),
	expiresAt: integer('expiresAt', {
		mode: 'timestamp',
	}).notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	createdAt: integer('expiresAt', {
		mode: 'timestamp',
	}).notNull(),
	updatedAt: integer('expiresAt', {
		mode: 'timestamp',
	}).notNull(),
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	accessTokenExpiresAt: integer('expiresAt', {
		mode: 'timestamp',
	}),
	refreshTokenExpiresAt: integer('expiresAt', {
		mode: 'timestamp',
	}),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('expiresAt', {
		mode: 'timestamp',
	}).notNull(),
	updatedAt: integer('expiresAt', {
		mode: 'timestamp',
	}).notNull(),
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expiresAt', {
		mode: 'timestamp',
	}).notNull(),
	createdAt: integer('expiresAt', {
		mode: 'timestamp',
	}).notNull(),
	updatedAt: integer('expiresAt', {
		mode: 'timestamp',
	}).notNull(),
});

export const plbsData = sqliteTable('plbsData', {
	id: text('id').primaryKey(),
	year_month: integer('year_month', {
		mode: 'timestamp',
	}).notNull(),
	user_id: text('user_id')
		.references(() => user.id)
		.notNull(),
	sales_amount_without_tax: integer('sales_amount_without_tax').notNull(), // 税抜売上げ
	sales_amount_with_tax: integer('sales_amount_with_tax').notNull(), // 税込売上げ
	product_price: integer('product_price').notNull(), // 商品価格
	product_price_tax: integer('product_price_tax').notNull(), // 商品価格税
	shipping_fee: integer('shipping_fee').notNull(), // 送料
	shipping_fee_tax: integer('shipping_fee_tax').notNull(), // 送料税
	other_taxes: integer('other_taxes').notNull(), // その他税
	return_amount: integer('return_amount').notNull(), // 返品額
	net_sales: integer('net_sales').notNull(), // 純売上げ
	cost_price: integer('cost_price').notNull(), // 原価
	gross_profit: integer('gross_profit').notNull(), // 粗利益
	createdAt: integer('createdAt', {
		mode: 'timestamp',
	}).notNull(),
	updatedAt: integer('updatedAt', {
		mode: 'timestamp',
	}).notNull(),
});

export type User = InferSelectModel<typeof user>;
export type InsertUser = InferInsertModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type InsertSession = InferInsertModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type InsertAccount = InferInsertModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;
export type InsertVerification = InferInsertModel<typeof verification>;
export type PlbsData = InferSelectModel<typeof plbsData>;
