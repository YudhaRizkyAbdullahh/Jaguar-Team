const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
};

const sqlFilePath = path.join(__dirname, '..', 'db_jaguar (5).sql');

async function setupDatabase() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');

        // buat database jika belum tersedia
        await connection.query('CREATE DATABASE IF NOT EXISTS db_jaguar');
        console.log('Database db_jaguar created or already exists.');

        // pindah ke database
        await connection.changeUser({ database: 'db_jaguar' });

        // Read SQL file
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Execute SQL
        console.log('Importing SQL file...');
        await connection.query(sql);
        console.log('SQL file imported successfully.');

        await connection.end();
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

setupDatabase();
