import Database from 'better-sqlite3'
import { promises as fs } from 'fs'
import path from 'path'
import {
  Kysely,
  sql,
  Migrator,
  FileMigrationProvider,
  SqliteDialect,
  Generated,
  ColumnType,
  Selectable,
  Insertable,
  Updateable,
} from 'kysely'
import { atmPsuedoAccount } from './constants'

interface AccountTable {
  id: Generated<number>
  account_id: string
  pin: string
}

interface BalanceTable {
  id: Generated<number>
  account_id: number
  current_balance: number
}

interface HistoryTable {
    id: Generated<number>
    account_id: number,
    amount: number,
    new_balance: number,
    datetime: string
}


export interface Database {
    account: AccountTable
    balance: BalanceTable
    history: HistoryTable
}

export type User = {
    accountId: string,
    pin: string,
}

export type History = Array<{
    date: string,
    time: string,
    amount: number,
    newBalance: number
}>

export class DbClient {
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

    async debug(): Promise<void> {
        const accounts = await this.db.selectFrom('account').selectAll().execute()
        const balances = await this.db.selectFrom('balance').selectAll().execute()
        const history = await this.db.selectFrom('balance').selectAll().execute()

        console.log({ accounts, balances, history })
    }

    async checkCredentials(user: User): Promise<boolean> {
        const accounts = await this.db
            .selectFrom('account')
            .selectAll()
            .where('account_id', '=', user.accountId)
            .where('pin', '=', user.pin)
            .execute()

        return accounts.length === 1
    }

    async getBalance(user: User): Promise<number> {
        const balances = await this.db
            .selectFrom('balance')
            .select('current_balance')
            .leftJoin('account', 'balance.account_id', 'account.id')
            .where('account.account_id', '=', user.accountId)
            .where('account.pin', '=', user.pin)
            .execute()

        if (!balances.length) {
            throw new Error(`User ${user.accountId} not found!`)
        }

        return balances[0].current_balance
    }

    async addToBalance(user: User, amount: number): Promise<void> {
        await this.db
            .updateTable('balance')
            // This looks like a SQL injection, but it isn't:
            // https://koskimas.github.io/kysely/interfaces/Sql.html
            .set({ current_balance: sql`current_balance + ${amount}` })
            .whereExists(qb => qb
                .selectFrom('account')
                .select('id')
                .where('account_id', '=', user.accountId)
                .whereRef('balance.account_id', '=', 'account.id'))
            .execute()
    }

    async deposit(user: User, amount: number): Promise<number> {
        await this.addToBalance(user, amount)

        const newBalance = await this.getBalance(user)

        await this.addHistoryRecord(user, amount, newBalance)

        return newBalance
    }

    async withdraw(user: User, amount: number): Promise<number> {
        await this.addToBalance(user, amount * -1)

        const newBalance = await this.getBalance(user)

        await this.addHistoryRecord(user, amount, newBalance)

        return newBalance
    }

    async addHistoryRecord(user: User, amount: number, newBalance: number): Promise<void> {
        const now = new Date().toISOString()

        await this.db
            .insertInto('history')
            .values({
                account_id: this.db
                    .selectFrom('account')
                    .select('id')
                    .where('account_id', '=', user.accountId),
                amount: amount,
                new_balance: newBalance,
                datetime: now
            })
            .execute()
    }

    async getHistoryRecordsForUser(user: User): Promise<History> {
        const records = await this.db
            .selectFrom('history')
            .select(['datetime', 'amount', 'new_balance'])
            .leftJoin('account', 'history.account_id', 'account.id')
            .where('account.account_id', '=', user.accountId)
            .execute()

        return records.map(r => ({
            date: new Date(r.datetime).toLocaleDateString(),
            time: new Date(r.datetime).toLocaleTimeString('en-US', { hour12: false }),
            amount: r.amount,
            newBalance: r.new_balance
        }))
    }
}
