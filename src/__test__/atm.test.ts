import Database from 'better-sqlite3'
import { Kysely } from 'kysely'
import { OutputText, EndServer, Atm } from '../atm'
import { DbClient } from '../db-client'
import { helpText, atmPsuedoAccount } from '../constants'

jest.mock('../db-client')

describe('ATM', () => {
    let outputText: OutputText
    let endServer: EndServer
    let dbClient: DbClient
    let atm: Atm
    let checkCredentialsMock: any
    let withdrawMock: any
    let getBalanceMock: any
    let depositMock: any

    beforeEach(() => {
        outputText = jest.fn()
        endServer = jest.fn()
        dbClient = new DbClient()
        atm = new Atm(outputText, endServer, dbClient)

        checkCredentialsMock = jest
            .spyOn(DbClient.prototype, 'checkCredentials')
            .mockImplementation(async () => true)

        withdrawMock = jest
            .spyOn(DbClient.prototype, 'withdraw')
            .mockImplementation(async (_, amount) => amount)

        depositMock = jest
            .spyOn(DbClient.prototype, 'deposit')
            .mockImplementation(async (_, amount) => amount)

        getBalanceMock = jest
            .spyOn(DbClient.prototype, 'getBalance')
            .mockImplementation(async () => 20)
    })

    describe('help', () => {
        it('should print the help text', async () => {
            await atm.handleCommand('help')
            expect(outputText).toHaveBeenCalledWith(helpText)
        })
    })

    describe('authorize', () => {
        it('should log in given a valid account id and pin', async () => {
            await atm.handleCommand('authorize user 1234')
            expect(outputText).toHaveBeenCalledWith('user successfully authorized.')
            expect(atm.currentUser).toEqual({ accountId: 'user', pin: '1234' })
            expect(checkCredentialsMock)
                .toHaveBeenCalledWith({ accountId: 'user', pin: '1234' })
        })

        it('should reject logging, given an invalid account id and pin', async () => {
            checkCredentialsMock = jest
                .spyOn(DbClient.prototype, 'checkCredentials')
                .mockImplementation(async () => false)

            await atm.handleCommand('authorize fhqwhgads 1234')
            expect(outputText).toHaveBeenCalledWith('Authorization failed.')
            expect(atm.currentUser).toBeFalsy()
            expect(checkCredentialsMock)
                .toHaveBeenCalledWith({ accountId: 'fhqwhgads', pin: '1234' })
        })
    })

    describe('withdraw', () => {
        beforeEach(async () => {
            await atm.handleCommand('authorize user 1234')
        })

        it('should display an error message when amount is NaN', async () => {
            await atm.handleCommand('withdraw asdf')
            expect(outputText).toHaveBeenCalledWith('Invalid amount.')
            expect(withdrawMock).not.toHaveBeenCalled()
        })

        it('should display an error message when amount is 0', async () => {
            await atm.handleCommand('withdraw 0')
            expect(outputText).toHaveBeenCalledWith('Invalid amount.')
            expect(withdrawMock).not.toHaveBeenCalled()
        })

        it('should display an error message when amount is less than 0', async () => {
            await atm.handleCommand('withdraw -10')
            expect(outputText).toHaveBeenCalledWith('Invalid amount.')
            expect(withdrawMock).not.toHaveBeenCalled()
        })

        it('should withdraw from the atm psuedo account balance', async () => {
            const newBalance = await atm.handleCommand('withdraw 20')
            expect(outputText).toHaveBeenCalledWith('Amount dispensed: $20')
            expect(outputText).toHaveBeenCalledWith(`Current balance: $20`)
            expect(withdrawMock).toHaveBeenCalledWith({ accountId: 'user', pin: '1234' }, 20)
            expect(withdrawMock).toHaveBeenCalledWith(atmPsuedoAccount, 20)
        })

        it('should not allow withdrawals if the ATM has no money', async () => {
            getBalanceMock = jest
                .spyOn(DbClient.prototype, 'getBalance')
                .mockImplementation(async () => 0)

            const newBalance = await atm.handleCommand('withdraw 20')
            expect(outputText).toHaveBeenCalledWith('Unable to process your withdrawal at this time.')
        })

        it('should withdraw what it can if the requested amount is more than the ATM balance', async () => {
            getBalanceMock = jest
                .spyOn(DbClient.prototype, 'getBalance')
                .mockImplementation(async () => 20)

            await atm.handleCommand('withdraw 30')
            expect(outputText).toHaveBeenCalledWith(
                'Unable to dispense full amount requested at this time. ' +
                'Amount dispensed: $20')
            expect(withdrawMock).toHaveBeenCalledWith({ accountId: 'user', pin: '1234' }, 20)
            expect(withdrawMock).toHaveBeenCalledWith(atmPsuedoAccount, 20)
        })

        it('should charge a $5 fee for overdraft withdrawals', async () => {
            getBalanceMock = jest
                .spyOn(DbClient.prototype, 'getBalance')
                .mockImplementation(async (user) =>
                    user.accountId === atmPsuedoAccount.accountId
                        ? 400
                        : 20
                )

            await atm.handleCommand('withdraw 40')
            expect(outputText).toHaveBeenCalledWith('Amount dispensed: $40')
            expect(outputText).toHaveBeenCalledWith(
                'You have been charged an overdraft fee of $5. ' +
                'Current balance: $45')
            expect(withdrawMock).toHaveBeenCalledWith({ accountId: 'user', pin: '1234' }, 45)
            expect(withdrawMock).toHaveBeenCalledWith(atmPsuedoAccount, 40)
        })
    })

    describe('deposit', () => {
        beforeEach(async () => {
            await atm.handleCommand('authorize user 1234')
        })

        it('should display an error message when amount is NaN', async () => {
            await atm.handleCommand('deposit asdf')
            expect(outputText).toHaveBeenCalledWith('Invalid amount.')
            expect(depositMock).not.toHaveBeenCalled()
        })

        it('should display an error message when amount is 0', async () => {
            await atm.handleCommand('deposit 0')
            expect(outputText).toHaveBeenCalledWith('Invalid amount.')
            expect(depositMock).not.toHaveBeenCalled()
        })

        it('should display an error message when amount is less than 0', async () => {
            await atm.handleCommand('deposit -10')
            expect(outputText).toHaveBeenCalledWith('Invalid amount.')
            expect(depositMock).not.toHaveBeenCalled()
        })

        it('should deposit the money in the user and ATM accounts', async () => {
            await atm.handleCommand('deposit 10')
            expect(outputText).toHaveBeenCalledWith('Current balance: $10')
            expect(depositMock).toHaveBeenCalledWith({ accountId: 'user', pin: '1234' }, 10)
            expect(depositMock).toHaveBeenCalledWith(atmPsuedoAccount, 10)
        })
    })

    describe('balance', () => {
        beforeEach(async () => {
            await atm.handleCommand('authorize user 1234')
        })

        it('should return the current balance', async () => {
            await atm.handleCommand('balance')
            expect(outputText).toHaveBeenCalledWith('Current balance: $20')
        })
    })

    describe('history', () => {
    })

    describe('logout', () => {
        beforeEach(async () => {
            await atm.handleCommand('authorize user 1234')
        })

        it('should log the user out', async () => {
            await atm.handleCommand('logout')
            expect(outputText).toHaveBeenCalledWith('Account user logged out.')

            await atm.handleCommand('logout')
            expect(outputText).toHaveBeenCalledWith('No account is currently authorized.')
        })
    })

    describe('end', () => {
        it('should call the endServer callback', async () => {
            expect(endServer).not.toHaveBeenCalled()
            await atm.handleCommand('end')
            expect(endServer).toHaveBeenCalled()
        })
    })

    describe('commandNotFound', () => {
        it('should output the command not found error', async () => {
            await atm.handleCommand('fhqwhgads 123 123')
            expect(outputText)
                .toHaveBeenCalledWith('Command "fhqwhgads" not found. Type "help" for help.')
        })
    })
})
