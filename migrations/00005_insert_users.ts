import { Kysely } from 'kysely'
import { bankCorpAtmAccountId } from '../src/strings'

export async function up(db: Kysely<any>): Promise<void> {
    await db
        .insertInto('account')
        .values([{
            account_id: bankCorpAtmAccountId,
            pin: '2345'
        }, {
            account_id: 'user1',
            pin: '1234'
        }, {
            account_id: 'cooluser',
            pin: '8923'
        }, {
            account_id: 'brokeuser',
            pin: '1230'
        }])
        .execute()

    const accountIdFor = (accountId: string) => db
        .selectFrom('account')
        .select('id')
        .where('account.account_id', '=', accountId)

    await db
        .insertInto('balance')
        .values([{
            account_id: accountIdFor(bankCorpAtmAccountId),
            current_balance_cents: 10000 * 100
        }, {
            account_id: accountIdFor('user1'),
            current_balance_cents: 300.48 * 100
        }, {
            account_id: accountIdFor('cooluser'),
            current_balance_cents: 578.23 * 100
        }, {
            account_id: accountIdFor('brokeuser'),
            current_balance_cents: -30.24 * 100
        }])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.deleteFrom('balance').execute()
    await db.deleteFrom('account').execute()
}

