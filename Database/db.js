import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();
const db = mysql.createConnection({
    host: "mysql-1ac7e40f-hariharasuthan411-8aa0.e.aivencloud.com",
    port: "18162",
    user: "avnadmin",
    password: process.env.Password,
    database: process.env.DatabaseName,
    ssl: {
        rejectUnauthorized: false
    }
});


db.connect(err => {
    if (err) {
        console.log("not connected");
    } else {
        console.log("connected");
    }
})

export default db;