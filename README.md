# ATM

An ATM simulator as an interactive program, written in Typescript, and backed by
an in-memory Sqlite3 database. When the simulator starts, I have it run through
a set of migrations, using the [Kysely](https://github.com/koskimas/kysely) library.


## Tests
The tests are written with Jest, and I have a
[unit test suite](https://github.com/rhinoceraptor/atm/blob/main/src/__test__/atm.test.ts)
for the [main ATM logic](https://github.com/rhinoceraptor/atm/blob/main/src/atm.ts).

Then, I have a small [integration suite](https://github.com/rhinoceraptor/atm/blob/main/src/__test__/db-client.test.ts)
for the [database wrapper code](https://github.com/rhinoceraptor/atm/blob/main/src/db-client.ts)
