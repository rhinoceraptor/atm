
export type User = {
    accountId: string,
    pin: string,
}

export type History = Array<{
  dateTime: Date,
  amount: number,
  balanceAfterTxn: number
}>

export class BalanceOverdrawnError extends Error {
    constructor(msg: string) {
        super(msg);
        // https://stackoverflow.com/a/41429145
        Object.setPrototypeOf(this, BalanceOverdrawnError.prototype);
    }
}

export class DbClient {
    constructor() {
    }

    async checkCredentials(user: User): Promise<boolean> {
        if (user.accountId === 'user' && user.pin === '1234') {
          return true
        } else {
          return false
        }
    }

    async deposit(amount: number): Promise<number> {
        return 20
    }

    async withdraw(amount: number): Promise<number | BalanceOverdrawnError> {
        return 20
    }


}
