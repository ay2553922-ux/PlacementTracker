const express = require("express");
const mysql = require("mysql2");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const app = express();

const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
});

// Connect MySQL
db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:");
        console.log(err.message);
        return;
    }

    console.log("MySQL Connected Successfully!");
});

// Register API
app.post("/api/register", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, password],
        (err, result) => {

            if (err) {

                console.log("Registration Error:");
                console.log(err.message);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        message: "Email already registered"
                    });
                }

                return res.status(500).json({
                    message: "Registration failed"
                });
            }

            res.status(201).json({
                message: "Registration successful!"
            });
        }
    );
});

// Home page
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/index.html")
    );
});
// Login API
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT id, name, email
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.query(sql, [email, password], (err, results) => {

        if (err) {
            console.log("Login Error:");
            console.log(err.message);

            return res.status(500).json({
                message: "Login failed"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful!",
            user: results[0]
        });
    });
});
// Get Applications
app.get("/api/applications", (req, res) => {
    const sql = `
        SELECT
            applications.id,
            companies.company_name,
            companies.job_role,
            companies.package,
            companies.location,
            applications.application_date,
            applications.status,
            applications.notes
        FROM applications
        INNER JOIN companies
            ON applications.company_id = companies.id
        ORDER BY applications.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.log("Applications Error:");
            console.log(err.message);

            return res.status(500).json({
                message: "Failed to load applications"
            });
        }

        res.json(results);
    });
});
// Add Application
app.post("/api/applications", (req, res) => {
    const {
        user_id,
        company_id,
        application_date,
        status,
        notes
    } = req.body;

    if (!user_id || !company_id) {
        return res.status(400).json({
            message: "User and company are required"
        });
    }

    const sql = `
        INSERT INTO applications
        (user_id, company_id, application_date, status, notes)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            company_id,
            application_date || null,
            status || "Applied",
            notes || null
        ],
        (err, result) => {

            if (err) {
                console.log("Add Application Error:");
                console.log(err.message);

                return res.status(500).json({
                    message: "Failed to add application"
                });
            }

            res.status(201).json({
                message: "Application added successfully!",
                id: result.insertId
            });
        }
    );
});
// Get Companies
app.get("/api/companies", (req, res) => {

    const sql = `
        SELECT *
        FROM companies
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Companies Error:");
            console.log(err.message);

            return res.status(500).json({
                message: "Failed to load companies"
            });
        }

        res.json(results);
    });
});
// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});