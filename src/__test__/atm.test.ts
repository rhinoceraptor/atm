import Database from 'better-sqlite3'
import { Kysely } from 'kysely'
import { OutputText, EndServer, Atm } from '../atm'
import { DbClient } from '../db-client'
import { helpText } from '../strings'

jest.mock('../db-client')


describe('ATM', () => {
    let outputText: OutputText
    let endServer: EndServer
    let dbClient: DbClient
    let atm: Atm

    beforeEach(() => {
        outputText = jest.fn()
        endServer = jest.fn()
        dbClient = new DbClient()
        atm = new Atm(outputText, endServer, dbClient)
    })

    describe('help', () => {
        it('should print the help text', async () => {
            await atm.handleCommand('help')
            expect(outputText).toHaveBeenCalledWith(helpText)
        })
    })

    describe('authorize', () => {
        it('should log in given a valid account id and pin', async () => {
            let checkCredentialsMock = jest
                .spyOn(DbClient.prototype, 'checkCredentials')
                .mockImplementation(async () => true)

            await atm.handleCommand('authorize user 1234')
            expect(outputText).toHaveBeenCalledWith('user successfully authorized.')
            expect(atm.currentUser).toEqual({ accountId: 'user', pin: '1234' })
            expect(checkCredentialsMock)
                .toHaveBeenCalledWith({ accountId: 'user', pin: '1234' })
        })

        it('should reject logging, given an invalid account id and pin', async () => {
            let checkCredentialsMock = jest
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
    })

    describe('deposit', () => {
    })

    describe('balance', () => {
    })

    describe('history', () => {
    })

    describe('logout', () => {
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
