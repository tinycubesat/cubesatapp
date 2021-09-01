import { openDatabase as open, enablePromise } from "react-native-sqlite-storage";

const databaseName = "sensors.db";

enablePromise(true);

export const openDatabase = () => open(databaseName);

export const databaseMethods = {
    createTableIfNotExists: (database, tableName, columns) => database.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`, []),
    insertData: (database, tableName, columnNames, columnsData) => database.executeSql(`INSERT INTO ${tableName} (${columnNames.join(',')}) VALUES (${columnsData.join(',')});`, [],),
    dropTable: (database, tableName) => database.executeSql(`DROP TABLE ${tableName};`, [],),
    searchValue: async (database, tableName, columns) => {
        let result = [];

        await database.transaction(tx => {
            tx.executeSql(`SELECT ${!!columns ? columns.join(',') : '*'} FROM ${tableName}`, [], (tx, results) => {
                for (let i = 0; i < results.rows.length; ++i)
                    result.push(results.rows.item(i));
            });
        });

        return result;
    },
    createColumn: (columnName, dataType) => `${columnName} ${dataType}`,
    mergeColumns: (...columns) => columns.join(','),
};