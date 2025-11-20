const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function testConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server successfully.');
        
        const [rows] = await connection.query('SHOW DATABASES');
        console.log('Databases found:', rows.map(row => row.Database));

        const dbName = 'db_jaguar';
        const dbExists = rows.some(row => row.Database === dbName);

        if (dbExists) {
            console.log(`Database '${dbName}' exists.`);
            await connection.changeUser({ database: dbName });
            const [tables] = await connection.query('SHOW TABLES');
            console.log(`Tables in '${dbName}':`, tables.map(row => Object.values(row)[0]));
        } else {
            console.error(`Database '${dbName}' does NOT exist.`);
        }

        await connection.end();
    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
    }
}

testConnection();
