
export const welcomeText = `
  +---------------------------------------------+
  |       +-----------------------------+       |
  |       |  Welcome to BankCorp, Inc!  |       |
  |       +-----------------------------+       |
  |                                             |
  |        /$$$$$$  /$$$$$$$$ /$$      /$$      |
  |       /$$__  $$|__  $$__/| $$$    /$$$      |
  |      | $$  \\ $$   | $$   | $$$$  /$$$$      |
  |      | $$$$$$$$   | $$   | $$ $$/$$ $$      |
  |      | $$__  $$   | $$   | $$  $$$| $$      |
  |      | $$  | $$   | $$   | $$\\  $ | $$      |
  |      | $$  | $$   | $$   | $$ \\/  | $$      |
  |      |__/  |__/   |__/   |__/     |__/      |
  |                                             |
  +---------------------------------------------+
`

export const helpText = `
Usage:

authorize <account_id> <pin>       Authorizes the current session.
withdraw <number_of_dollars>       The amount in dollars to withdraw, must be
                                   a multiple of $20.
deposit <number_of_dollars>        The amount in dollars to deposit.
balance                            Returns your current balance.
history                            Displays a list of your transactions.
logout                             Deactivates the currently authorized session.
end                                Shuts down the server.
`
