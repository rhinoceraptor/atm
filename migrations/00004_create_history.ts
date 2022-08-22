import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable('history')
      .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
      .addColumn('from_account_id', 'integer', col => col.references('account.id'))
      .addColumn('to_account_id', 'integer', col => col.references('account.id'))
      .addColumn('amount_cents', 'integer', col => col.notNull())
      .addColumn('unix_timestamp', 'integer', col => col.notNull())
      .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('history').execute()
}

