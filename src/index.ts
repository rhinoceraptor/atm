import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { Atm } from './atm'
import { DbClient } from './db-client'

const outputText = (text: string) => {
    console.log(text)
}

const endServer = () => {
    process.exit(0)
}

const run = async () => {
  const dbClient = new DbClient()
  const atm = new Atm(outputText, endServer, dbClient)

  const rl = readline.createInterface({ input, output });

  console.log('Please enter a command.')

  while (true) {
    const input = await rl.question('> ');
    await atm.handleCommand(input)
  }

  rl.close();
}

run()

