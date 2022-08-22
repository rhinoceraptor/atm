import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable('account')
      .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
      .addColumn('account_id', 'text', col => col.notNull().unique())
      .addColumn('pin', 'text', col => col.notNull())
      .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('account').execute()
}
