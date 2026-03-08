import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import db from './Database/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import validator from 'validator';


dotenv.config();

const __fileName = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__fileName);

const app = express();
app.use(express.json());
app.use(cookieParser())


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.render("login");
})

app.get("/home", verify, (req, res) => {
    res.render("index");
})

app.get("/allTasks", verify, (req, res) => {
    res.render("allTask");
})


app.get("/statistics", verify, (req, res) => {
    res.render("statistics");
})

function verify(req, res, next) {
    const jwtToken = req.cookies.JWTTocken;
    if (!jwtToken) {
        return res.redirect("/");
    }
    try {
        const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        return res.redirect("/");
    }
}

app.post("/userSignUp", (req, res) => {
    const { name, email, password } = req.body;

    if (!validator.isEmail(email)) {
        console.log("invalid Email");
        return res.json({ message: "Invalid Email" })
    } else {
        db.query("SELECT * FROM Users WHERE Email = ?", [email], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }

            if (result.length > 0) {
                return res.json({ message: "User Already Exist" });
            } else if (!validator.isStrongPassword(password)) {
                return res.json({ message: "Create Strong Password" })
            }

            const insertQuery = "INSERT INTO Users (UserName, Email, Password) VALUES (?, ?, ?)";
            let newPassword = bcrypt.hashSync(password, 10);
            db.query(insertQuery, [name, email, newPassword], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: "Insert Error" });
                }

                return res.json({ message: "User Added Successfully" });
            });
        });
        // String[] loginUserNames = {}

    }
});
let emailID = "hari@gmail.com";

app.post("/userLogin", (req, res) => {
    const { email, password } = req.body;
    db.query("select * from Users where Email =?", [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length > 0) {
            emailID = email;
            if (bcrypt.compareSync(password, result[0].Password)) {
                let data = result[0];
                const jwtTocken = jwt.sign({
                    name: data.UserName,
                    email: data.Email
                }, process.env.JWT_SECRET, { expiresIn: "1d" });
                res.cookie("JWTTocken", jwtTocken, { httpOnly: true });
                return res.json({ message: "User Account Exist" });
            }
        }
        return res.json({ message: "Invalid User Or Password" });
    })
})

app.post("/addTask", (req, res) => {
    const { title, dec, date, priority } = req.body;

    db.query("select * from Tasks where Email =? and TaskName =?", [emailID, title], (err, result) => {
        console.log(result);
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length > 0) {
            return res.json({ message: "Task Already Exist" });
        } else {
            db.query(
                "INSERT INTO Tasks (Email, TaskName, Description, Priority, `Date`) VALUES (?,?,?,?,?)", [emailID, title, dec, priority, date],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error" });
                    }
                    return res.json({ message: "Task Inserted Sucessfully" }, { title, dec, date, priority });
                }
            );
        }
    })


});

app.get("/loadUserTask", (req, res) => {

    db.query("select * from Tasks where Email = ?", [emailID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        let name = null;
        db.query("select UserName from Users where Email=?", [emailID], (err, rese) => {
            name = rese;
            return res.json({ result, name });
        })
    })
})

app.post("/completeTask", (req, res) => {
    const { title, time } = req.body;
    db.query(
        "UPDATE Tasks SET IsCompleted = 1 , Time = ? WHERE TaskName = ? AND Email = ?", [time, title, emailID], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            return res.json({ message: "Task Updated Sucessfully" });
        }
    );
})

app.post("/reActiveTask", (req, res) => {
    const { title } = req.body;
    db.query(
        "UPDATE Tasks SET IsCompleted = 0 WHERE TaskName = ? AND Email = ?", [title, emailID], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            return res.json({ message: "Task Updated Sucessfully" });
        }
    );
})


app.post("/deleteTask", (req, res) => {
    const { title } = req.body;
    db.query(
        "DELETE FROM Tasks WHERE TaskName = ? AND Email = ?", [title, emailID], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            if (result.affectedRows === 0) {
                return res.json({ message: "No matching task found" });
            }
            return res.json({ message: "Task deleted Sucessfully" });
        }
    );
})


app.post("/updateTask", (req, res) => {
    const { title, dec, date, priority, oldTitle } = req.body;

    db.query("select * from Tasks where Email =? and TaskName =?", [emailID, title], (err, result) => {
        console.log(result);
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length > 0) {
            return res.json({ message: "Task Already Exist" });
        } else {
            db.query("UPDATE Tasks SET TaskName = ?,Description = ?,Priority = ?,Date = ? WHERE Email = ? AND TaskName LIKE ? ", [title, dec, priority, date, emailID, `${oldTitle}`], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Database error" });
                }
                return res.json({ message: "Task Updated Sucessfully" });
            })
        }
    })
})


app.get("/logout", (req, res) => {
    emailID = "hari@gmail.com";
    res.cookie("JWTTocken", "", { httpOnly: true });
    return res.json({ message: "Account Logouted Sucessfully" })
})


// app.get("/getStatistic", (req, res) => {
//     db.query("select Priority,IsCompleted from Tasks where Email = ?", [emailID], (err, result) => {
//         if (err) {
//             return res.status(500).json({ message: "Database error" });
//         }
//         return res.json(result);
//     })
// })

const port = 3000;
app.listen(port, () => {
    console.log(port);
})