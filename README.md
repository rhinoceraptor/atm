# ATM

An ATM simulator as an interactive program, written in Typescript, and backed by
an in-memory Sqlite3 database. When the simulator starts, I have it run through
a set of migrations, using the [Kysely](https://github.com/koskimas/kysely) library.
The SQL queries are also constructed using it.


## Tests
The tests are written with Jest, and I have a
[unit test suite](https://github.com/rhinoceraptor/atm/blob/main/src/__test__/atm.test.ts)
for the [main ATM logic](https://github.com/rhinoceraptor/atm/blob/main/src/atm.ts).

Then, I have a small [integration suite](https://github.com/rhinoceraptor/atm/blob/main/src/__test__/db-client.test.ts)
for the [database wrapper code](https://github.com/rhinoceraptor/atm/blob/main/src/db-client.ts)

## Running the application
You'll need to run `npm ci`, `npm run build`, then `npm run start`.

To run the test suite, run `npm run test`
