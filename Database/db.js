import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.Password,
    database: process.env.DatabaseName
})

db.connect(err => {
    if (err) {
        console.log("not connected");
    } else {
        console.log("connected");
    }
})

export default db;