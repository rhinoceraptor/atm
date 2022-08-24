import { welcomeText, helpText, atmPsuedoAccount } from './constants'
import { User, History, DbClient } from './db-client'

export type OutputText = {
    (text: string): void;
}

export type EndServer = {
    (): void
}

export class Atm {
    dbClient: DbClient
    outputText: OutputText
    endServer: EndServer
    currentUser?: User
    loginTimeoutMs: number
    timeoutId?: ReturnType<typeof setTimeout>

    constructor(
        outputText: OutputText,
        endServer: EndServer,
        dbClient: DbClient,
        loginTimeoutMs: number
    ) {
        this.outputText = outputText
        this.endServer = endServer
        this.dbClient = dbClient
        this.loginTimeoutMs = loginTimeoutMs

        this.outputText(welcomeText)
    }

    async handleCommand(commandStr: string): Promise<void> {
        const [command, ...args] = commandStr.trim().split(/\s+/)

        this.markActivity()

        switch (command.toLowerCase()) {
            case 'help':
                return this.help()
            case 'authorize':
                return await this.authorize(args)
            case 'withdraw':
                return await this.withdraw(args)
            case 'deposit':
                return await this.deposit(args)
            case 'balance':
                return await this.balance()
            case 'history':
                return await this.history()
            case 'logout':
                return this.logout()
            case 'end':
                return this.end()
            case '__debug__':
                return this.debug()
            default:
                return this.commandNotFound(command)
        }
    }

    help(): void {
        this.outputText(helpText)
    }

    markActivity(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
        }

        this.timeoutId = setTimeout(() => {
            this.logout(true)

        // }, 1000 * 60 * 2)
        }, this.loginTimeoutMs)
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

        if (amount % 20 !== 0) {
            return this.outputText('Invalid amount.')
        }

        if (isNaN(amount) || amount <= 0) {
            return this.outputText('Invalid amount.')
        }

        const balance = await this.dbClient.getBalance(this.currentUser)
        const atmBalance = await this.dbClient.getBalance(atmPsuedoAccount)

        // Is ATM empty?
        if (atmBalance === 0) {
            return this.outputText('Unable to process your withdrawal at this time.')
        }

        // Is user already overdrawn?
        if (balance < 0) {
            return this.outputText(
                'Your account is overdrawn! ' +
                'You may not make withdrawals at this time.'
            )
        }

        const overdrawn = balance - amount < 0
        const fees = overdrawn ? 5 : 0
        const cannotWithdrawFull = atmBalance - amount < 0
        const cashAmount = cannotWithdrawFull ? atmBalance : amount

        const newBalance = await this.dbClient.withdraw(this.currentUser, cashAmount + fees)
        const newAtmBalance = await this.dbClient.withdraw(atmPsuedoAccount, cashAmount)

        const cannotWithdrawFullMsg = cannotWithdrawFull
            ? 'Unable to dispense full amount requested at this time. '
            : ''
        this.outputText(`${cannotWithdrawFullMsg}Amount dispensed: $${cashAmount}`)

        const overdrawnMsg = overdrawn
            ? 'You have been charged an overdraft fee of $5. '
            : ''

        return this.outputText(`${overdrawnMsg}Current balance: $${newBalance}`)
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

    async history(): Promise<void> {
        if (!this.currentUser) {
            return this.outputText('Authorization required.')
        }

        const historyRows = await this.dbClient.getHistoryRecordsForUser(this.currentUser)

        if (!historyRows.length) {
            return this.outputText('No history found')
        } else {
            return this.outputText(historyRows.map(r =>
                `${r.date} ${r.time} ${r.amount} ${r.newBalance}`
            ).join('\n'))
        }

    }

    logout(automaticLogout = false): void {
        if (!this.currentUser && !automaticLogout) {
            return this.outputText('No account is currently authorized.')
        }

        this.outputText('logging out')
        this.currentUser && this.outputText(`Account ${this.currentUser.accountId} logged out.`)
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
