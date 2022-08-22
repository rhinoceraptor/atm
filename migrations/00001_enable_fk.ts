import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await sql<string>`PRAGMA foreign_keys = ON`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql<string>`PRAGMA foreign_keys = OFF`.execute(db)
}
