import { Kysely } from 'kysely'
import { bankCorpAtmAccountId, bankCorpAtmPin } from '../src/constants'

export async function up(db: Kysely<any>): Promise<void> {
    await db
        .insertInto('account')
        .values([{
            account_id: bankCorpAtmAccountId,
            pin: bankCorpAtmPin
        }, {
            account_id: 'user1',
            pin: '1234'
        }, {
            account_id: 'cooluser',
            pin: '8923'
        }, {
            account_id: 'brokeuser',
            pin: '1230'
        }, {
            account_id: '2859459814',
            pin: '7386'
        }, {
            account_id: '1434597300',
            pin: '4557'
        }, {
            account_id: '7089382418',
            pin: '0075'
        }, {
            account_id: '2001377812',
            pin: '5950'
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
            current_balance: 10000
        }, {
            account_id: accountIdFor('user1'),
            current_balance: 300.48
        }, {
            account_id: accountIdFor('cooluser'),
            current_balance: 578.23
        }, {
            account_id: accountIdFor('brokeuser'),
            current_balance: -30.24
        }, {
            account_id: accountIdFor('2859459814'),
            current_balance: 10.24
        }, {
            account_id: accountIdFor('1434597300'),
            current_balance: 90000.55
        }, {
            account_id: accountIdFor('7089382418'),
            current_balance: 0.00
        }, {
            account_id: accountIdFor('2001377812'),
            current_balance: 60.00
        }])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.deleteFrom('balance').execute()
    await db.deleteFrom('account').execute()
}

