import { welcomeText, helpText, atmPsuedoAccount } from './constants'
import { User, History, DbClient } from './db-client'

export type AtmState =
      'READY'
    | 'LOGGED_IN'

export type OutputText = {
    (text: string): void;
}

export type EndServer = {
    (): void
}

export class Atm {
    state: AtmState
    dbClient: DbClient
    outputText: OutputText
    endServer: EndServer
    currentUser?: User

    constructor(outputText: OutputText, endServer: EndServer, dbClient: DbClient) {
        this.state = 'READY'
        this.outputText = outputText
        this.endServer = endServer
        this.dbClient = dbClient

        this.outputText(welcomeText)
    }

    async handleCommand(commandStr: string): Promise<void> {
        const [command, ...args] = commandStr.trim().split(/\s+/)

        switch (command.toLowerCase()) {
            case 'help':
                return this.help(command)
            case 'authorize':
                return await this.authorize(args)
            case 'withdraw':
                return await this.withdraw(args)
            case 'deposit':
                return await this.deposit(args)
            case 'balance':
                return await this.balance()
            case 'history':
                return await this.history(args)
            case 'logout':
                return this.logout(args)
            case 'end':
                return this.end()
            case '__debug__':
                return this.debug()
            default:
                return this.commandNotFound(command)
        }
    }

    help(command: string): void {
        this.outputText(helpText)
    }

    async authorize(args: Array<string>): Promise<void> {
        const [accountId, pin] = args
        if (!accountId || !pin) {
            return this.outputText('Authorization failed.')
        }

        const user = { accountId, pin }

        if (await this.dbClient.checkCredentials(user)) {
            this.currentUser = user

            return this.outputText(`${accountId} successfully authorized.`)
        } else {
            return this.outputText('Authorization failed.')
        }
    }

    async withdraw(args: Array<string>): Promise<void> {
        if (!this.currentUser) {
            return this.outputText('Authorization required.')
        }

        if (!args.length) {
            return this.outputText('Invalid amount.')
        }

        const amount = parseFloat(args[0])

        if (isNaN(amount) || amount <= 0) {
            return this.outputText('Invalid amount.')
        }

        const balance = await this.dbClient.getBalance(this.currentUser)
        const atmBalance = await this.dbClient.getBalance(atmPsuedoAccount)

        // Is ATM empty?
        if (atmBalance === 0) {
            return this.outputText('Unable to process your withdrawal at this time.')
        }

        const overdrafted = balance - amount < 0
        const fees = overdrafted ? 5 : 0
        const cannotWithdrawFull = atmBalance - amount < 0
        const cashAmount = cannotWithdrawFull ? atmBalance : amount

        const newBalance = await this.dbClient.withdraw(this.currentUser, cashAmount + fees)
        const newAtmBalance = await this.dbClient.withdraw(atmPsuedoAccount, cashAmount)

        const cannotWithdrawFullMsg = cannotWithdrawFull
            ? 'Unable to dispense full amount requested at this time. '
            : ''
        this.outputText(`${cannotWithdrawFullMsg}Amount dispensed: $${cashAmount}`)

        const overdraftedMsg = overdrafted
            ? 'You have been charged an overdraft fee of $5. '
            : ''

        return this.outputText(`${overdraftedMsg}Current balance: $${newBalance}`)
    }

    async deposit(args: Array<string>): Promise<void> {
        if (!this.currentUser) {
            return this.outputText('Authorization required.')
        }

        if (!args.length) {
            return this.outputText('Invalid amount.')
        }

        const amount = parseFloat(args[0])

        if (isNaN(amount) || amount <= 0) {
            return this.outputText('Invalid amount.')
        }

        const newBalance = await this.dbClient.deposit(this.currentUser, amount)
        await this.dbClient.deposit(atmPsuedoAccount, amount)

        return this.outputText(`Current balance: $${newBalance}`)

    }

    async balance(): Promise<void> {
        if (!this.currentUser) {
            return this.outputText('Authorization required.')
        }

        const balance = await this.dbClient.getBalance(this.currentUser)

        return this.outputText(`Current balance: $${balance}`)
    }

    async history(args: Array<string>): Promise<void> {
        if (!this.currentUser) {
            return this.outputText('Authorization required.')
        }

    }

    logout(args: Array<string>): void {
        if (!this.currentUser) {
            return this.outputText('No account is currently authorized.')
        }

        this.outputText(`Account ${this.currentUser.accountId} logged out.`)
        delete this.currentUser
    }

    end(): void {
        this.endServer()
    }

    async debug(): Promise<void> {
        await this.dbClient.debug()
    }

    commandNotFound(command: string): void {
        this.outputText(`Command "${command}" not found. Type "help" for help.`)
    }
}
