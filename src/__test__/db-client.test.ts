import { DbClient } from '../db-client'

describe('DbClient', () => {
    let dbClient: DbClient
    const user1 = { accountId: 'user1', pin: '1234' }

    beforeEach(async () => {
        dbClient = new DbClient()
        await dbClient.initialize()
    })

    describe('checkCredentials', () => {
        it('should return true if the  credentials are valid', async () => {
            expect(await dbClient.checkCredentials(user1))
                .toEqual(true)
        })

        it('should return false if the  credentials are valid', async () => {
            expect(await dbClient.checkCredentials({ accountId: 'user2', pin: '1234' }))
                .toEqual(false)
        })
    })

    describe('getBalance', () => {
        it('should return a user balance', async () => {
            expect(await dbClient.getBalance(user1))
                .toEqual(300.48)
        })
    })

    describe('addToBalance', () => {
        it('should add the given amount to the balance', async () => {
            await dbClient.addToBalance(user1, 10)
            expect(await dbClient.getBalance(user1))
                .toEqual(310.48)
        })

        it('should subtract the given amount, if negative, from the balance', async () => {
            await dbClient.addToBalance(user1, -10)
            expect(await dbClient.getBalance(user1))
                .toEqual(290.48)
        })
    })

    describe('deposit', () => {
        it('should deposit the given amount into the balance', async () => {
            await dbClient.deposit(user1, 10)
            expect(await dbClient.getBalance(user1))
                .toEqual(310.48)
        })

        it('should add a history record for the deposit', async () => {
        })
    })

    describe('withdraw', () => {
        it('should withdraw the given amount from the balance', async () => {
            await dbClient.withdraw(user1, 10)
            expect(await dbClient.getBalance(user1))
                .toEqual(290.48)
        })

        it('should add a history record for the withdrawal', async () => {
        })
    })
})

