import Database from 'better-sqlite3'
import { promises as fs } from 'fs'
import path from 'path'
import {
  Kysely,
  Migrator,
  FileMigrationProvider,
  SqliteDialect,
  Generated,
  ColumnType,
  Selectable,
  Insertable,
  Updateable,
} from 'kysely'

interface AccountTable {
  id: Generated<number>
  account_id: string
  pin: number
}

interface BalanceTable {
  id: Generated<number>
  account_id: number
  current_balance_cents: number
}

interface HistoryTable {
    id: Generated<number>
    from_account_id: number,
    to_account_id: number,
    amount_cents: number,
    unix_timestamp: number
}


interface Database {
    account: AccountTable
    balance: BalanceTable
    history: HistoryTable
}

export class DbConnection {
    db: Kysely<Database>

    constructor() {
        this.db = new Kysely<Database>({
            dialect: new SqliteDialect({ database: new Database(':memory:') })
        })
    }

    async initialize(): Promise<void> {
        const migrator = new Migrator({
            db: this.db,
            provider: new FileMigrationProvider({
                fs,
                path,
                migrationFolder: path.join(__dirname, '..', 'migrations')
            })
        });
        await migrator.migrateToLatest()

    }

    async test(): Promise<void> {
        const accounts = await this.db.selectFrom('account').selectAll().execute()
        const balances = await this.db.selectFrom('balance').selectAll().execute()

        console.log(JSON.stringify({ accounts, balances }, null, 2))
    }
}
