import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable('balance')
      .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
      .addColumn('account_id', 'integer', col => col.references('account.id'))
      .addColumn('current_balance', 'integer', col => col.notNull())
      .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('balance').execute()
}

