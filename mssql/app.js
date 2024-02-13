const config = {
  user: 'your_username',
  password: 'your_password',
  server: 'your_server',
  database: 'your_database',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};


const sql = require('mssql');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const pool = await sql.connect(config);
    const tables = await getTableNames(pool);

    const workbook = new ExcelJS.Workbook();
    const tableMap = new Map();

    // Export each table to a separate worksheet
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const columns = await getTableColumns(pool, table);
      const sheetName = `Table${i + 1}`;
      await exportTableToExcel(workbook, sheetName, table, columns);
      tableMap.set(sheetName, table);
    }

    // Create a master worksheet
    const masterWorksheet = workbook.addWorksheet('Master');
    masterWorksheet.addRow(['Table Name', 'Sheet']);

    // Populate the master worksheet with table names and corresponding sheet names
    for (const [sheetName, tableName] of tableMap.entries()) {
      masterWorksheet.addRow([tableName, sheetName]);
    }

    // Generate the file name
    const host = config.server; // Replace with actual host name
    const database = config.database; // Replace with actual database name
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const fileName = `${host}_${database}_${timestamp}.xlsx`;

    // Write the workbook to a file
    const filePath = path.join(__dirname, fileName);
    await workbook.xlsx.writeFile(filePath);
    console.log(`Tables exported successfully to ${fileName}.`);
    console.log('Table mapping:', Array.from(tableMap));
  } catch (err) {
    console.error('Error exporting tables:', err.message);
  } finally {
    sql.close();
  }
})();

async function getTableNames(pool) {
  const result = await pool.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
  `);
  return result.recordset.map(row => row.TABLE_NAME);
}

async function getTableColumns(pool, tableName) {
  const result = await pool.query(`
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, 
           IS_NULLABLE, COLUMN_DEFAULT, COLUMNPROPERTY(OBJECT_ID('${tableName}'), COLUMN_NAME, 'IsIdentity') AS IS_IDENTITY,
           COLUMNPROPERTY(OBJECT_ID('${tableName}'), COLUMN_NAME, 'IsComputed') AS IS_COMPUTED
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = '${tableName}'
  `);
  return result.recordset.map(row => ({
    name: row.COLUMN_NAME,
    type: row.DATA_TYPE,
    length: row.CHARACTER_MAXIMUM_LENGTH,
    nullable: row.IS_NULLABLE === 'YES',
    default: row.COLUMN_DEFAULT,
    isPrimaryKey: false, // Placeholder for primary key information
    isAutoIncrement: row.IS_IDENTITY === 1,
    isComputed: row.IS_COMPUTED === 1
  }));
}

async function exportTableToExcel(workbook, sheetName, tableName, columns) {
  const worksheet = workbook.addWorksheet(sheetName);

  // Add column headers with data type, length, nullable, default value, primary key, auto increment, and computed
  const headerRow = worksheet.addRow([
    'Column Name', 'Data Type', 'Length', 'Nullable', 'Default', 'Primary Key', 'Auto Increment', 'Computed'
  ]);
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.font = { bold: true };
  });

  // Add column definitions
  columns.forEach(column => {
    worksheet.addRow([
      column.name, column.type, column.length, column.nullable ? 'Yes' : 'No',
      column.default !== null ? column.default : '', column.isPrimaryKey ? 'Yes' : 'No',
      column.isAutoIncrement ? 'Yes' : 'No', column.isComputed ? 'Yes' : 'No'
    ]);
  });

  // Auto-size columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const length = cell.value ? cell.value.toString().length : 10;
      if (length > maxLength) {
        maxLength = length;
      }
    });
    column.width = maxLength < 30 ? 30 : maxLength;
  });
}
