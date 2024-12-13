//import the express code
let express=require("express")

//create express object
let app=express()

//serve up static pages from 'public'
app.use(express.static("www/WealthWizard"))

const mysql = require("mysql2");
const bcrypt = require("bcrypt"); // For hashing passwords

app.use(express.json());
const db = mysql.createConnection({
    host: '127.0.0.1', // Use 'localhost' if the database is on the same machine
    user: 'wew',       // Your MySQL username
    password: '$11311WEw', // Replace with your actual password
    database: '434WealthWizardProject'
});

db.connect( function( err) {
    if( err) {

    log("Error connecting: ", err);
    }
    else {
        console.log("Connection established");
    }});

const session = require('express-session');

// Add session middleware
app.use(
    session({
        secret: 'wealthwizard', // Replace with a strong secret
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // Set to `true` if using HTTPS
    })
);
    
// Endpoint for user signup
app.post('/api/signup', async (req, res) => {
    const { fullName, email, password, income } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into the database
        const query = `
            INSERT INTO users (full_name, email, password_hash, income)
            VALUES (?, ?, ?, ?)
        `;
        const values = [fullName, email, hashedPassword, income || 0];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, message: 'Email already exists.' });
                }
                return res.status(500).json({ success: false, message: 'Database error.' });
            }
            res.json({ success: true, message: 'User created successfully.', userId: result.insertId });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Endpoint for user signin
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            req.session.userId = user.user_id; // Store user ID in session
            console.log("User logged in:", user.user_id); // Debug log
            res.json({ success: true, message: 'Login successful', userId: user.user_id });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
    });
});

//endpoint for userid
app.get('/api/user', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    res.json({ success: true, userId });
});


// Endpoint to add a new transaction
app.post('/api/transactions', (req, res) => {
    const { user_id, transaction_type, amount, category, payment_place } = req.body;
    const description = req.body.description || null; // Provide a default value for description

    // Validate the input
    if (!user_id || !transaction_type || !amount || !category || !payment_place) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Insert the transaction into the database
    const query = `
        INSERT INTO transactions (user_id, transaction_type, amount, category, description, payment_place)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [user_id, transaction_type, amount, category, description, payment_place],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error.' });
            }
            res.json({ success: true, message: 'Transaction added successfully.', transactionId: results.insertId });
        }
    );
});


// Endpoint to fetch transaction data by category for a user
app.get('/api/transactions/summary', (req, res) => {
    const userId = req.session.userId;

    // Log userId for debugging
    console.log("Fetching transaction summary for userId:", userId);

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const query = `
        SELECT category, SUM(amount) AS total_amount
        FROM transactions
        WHERE user_id = ? AND transaction_type = 'expense'
        GROUP BY category
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        res.json({ success: true, data: results });
    });
});

app.get('/api/transactions/recent', (req, res) => {
    const userId = req.session.userId;
    
    console.log("Fetching transactions for userId:", userId);

    const query = `
        SELECT payment_place, amount, DATE_FORMAT(transaction_date, '%Y-%m-%d') AS transaction_date 
        FROM transactions 
        WHERE user_id = ? AND transaction_type = 'expense' 
        ORDER BY transaction_date DESC 
        LIMIT 5
    `;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        console.log("Query results:", results); // Log query results

        res.json({ success: true, data: results });
    });
});


app.get('/api/transactions/top-categories', (req, res) => {
    const userId = req.session.userId;
    console.log("User ID in session:", req.session.userId); // Log session user ID

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const query = `
        SELECT category, SUM(amount) AS total_amount 
        FROM transactions 
        WHERE user_id = ? AND transaction_type = 'expense' 
        GROUP BY category 
        ORDER BY total_amount DESC 
        LIMIT 5
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        res.json({ success: true, data: results });
    });
});

app.get('/api/user/income', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const query = 'SELECT income FROM users WHERE user_id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        res.json({ success: true, income: results[0].income });
    });
});

app.post('/api/user/update-income', (req, res) => {
    const userId = req.session.userId;
    const { income } = req.body;

    if (!userId || !income) {
        return res.status(400).json({ success: false, message: 'Missing user or income.' });
    }

    const query = 'UPDATE users SET income = ? WHERE user_id = ?';
    db.query(query, [income, userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        res.json({ success: true, message: 'Income updated successfully.' });
    });
});



app.get('/api/transactions/top-spenders', (req, res) => {
    const userId = req.session.userId;
    console.log("User ID in session:", req.session.userId); // Log session user ID

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const query = `
        SELECT payment_place, amount 
        FROM transactions 
        WHERE user_id = ? AND transaction_type = 'expense' 
        ORDER BY amount DESC 
        LIMIT 5
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        res.json({ success: true, data: results });
    });
});

app.get('/api/transactions/total-expenses', (req, res) => {
    const userId = req.session.userId; // Assuming session management is in place

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const query = `
        SELECT SUM(amount) AS total_expenses 
        FROM transactions 
        WHERE user_id = ? 
        AND MONTH(transaction_date) = MONTH(CURRENT_DATE())
        AND YEAR(transaction_date) = YEAR(CURRENT_DATE());
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching total expenses:', err);
            return res.status(500).json({ success: false, message: 'Error fetching total expenses' });
        }

        const totalExpenses = results[0].total_expenses || 0; // Default to 0 if null
        res.json({ success: true, total_expenses: totalExpenses });
    });
});

app.post('/api/accounts/add', (req, res) => {
    const { accountType, balance } = req.body;
    const userId = req.session.userId;
    const bucketName = accountType;

    const query = `
        INSERT INTO buckets (user_id, bucket_name, target_amount, current_amount)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [userId, bucketName, balance, balance], (err) => {
        if (err) {
            return res.json({ success: false, message: 'Error adding account.' });
        }
        res.json({ success: true });
    });
});

app.post('/api/loans/add', (req, res) => {
    const { loanAmount, monthlyPayments, loanPurpose } = req.body;
    const userId = req.session.userId;

    const query = `
        INSERT INTO loans (user_id, lender_name, loan_amount, remaining_balance, interest_rate)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [userId, loanPurpose, loanAmount, loanAmount, 0], (err) => {
        if (err) {
            return res.json({ success: false, message: 'Error adding loan.' });
        }
        res.json({ success: true });
    });
});

// Endpoint to fetch all accounts and loans for the user
app.get('/api/accounts/all', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const accountsQuery = `
        SELECT bucket_name, target_amount, current_amount 
        FROM buckets WHERE user_id = ?
    `;
    const loansQuery = `
        SELECT lender_name, loan_amount, remaining_balance, interest_rate, start_date, due_date 
        FROM loans WHERE user_id = ?
    `;

    db.query(accountsQuery, [userId], (err, accounts) => {
        if (err) {
            console.error('Error fetching accounts:', err);
            return res.status(500).json({ success: false, message: 'Error fetching accounts.' });
        }

        db.query(loansQuery, [userId], (err, loans) => {
            if (err) {
                console.error('Error fetching loans:', err);
                return res.status(500).json({ success: false, message: 'Error fetching loans.' });
            }

            res.json({ success: true, accounts, loans });
        });
    });
});

// Fetch single loan by loan_id
app.get('/api/loans/:loan_id', (req, res) => {
    const userId = req.session.userId;
    const loanId = req.params.loan_id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const query = `
        SELECT lender_name, loan_amount, remaining_balance, interest_rate, start_date, due_date 
        FROM loans WHERE user_id = ? AND loan_id = ?
    `;

    db.query(query, [userId, loanId], (err, results) => {
        if (err) {
            console.error('Error fetching loan details:', err);
            return res.status(500).json({ success: false, message: 'Error fetching loan details.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Loan not found.' });
        }

        res.json({ success: true, loan: results[0] });
    });
});

// Fetch single account by bucket_name
app.get('/api/accounts/:bucket_name', (req, res) => {
    const userId = req.session.userId;
    const bucketName = req.params.bucket_name;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const query = `
        SELECT bucket_name, target_amount, current_amount 
        FROM buckets WHERE user_id = ? AND bucket_name = ?
    `;

    db.query(query, [userId, bucketName], (err, results) => {
        if (err) {
            console.error('Error fetching account details:', err);
            return res.status(500).json({ success: false, message: 'Error fetching account details.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Account not found.' });
        }

        res.json({ success: true, account: results[0] });
    });
});

// Endpoint to fetch events for a specific user
app.get('/api/events/:userId', (req, res) => {
    const userId = req.pa56rams.userId;

    const query = 'SELECT * FROM events WHERE user_id = ? ORDER BY event_date';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        res.json({ success: true, events: results });
    });
});


// Endpoint to add a new event
app.post('/api/events/add', (req, res) => {
    const { userId, eventDate, eventTitle, eventUrgency } = req.body;

    if (!userId || !eventDate || !eventTitle || !eventUrgency) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const query = `
        INSERT INTO events (user_id, event_date, event_title, event_urgency)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [userId, eventDate, eventTitle, eventUrgency], (err) => {
        if (err) {
            console.error('Error adding event:', err);
            return res.status(500).json({ success: false, message: 'Error adding event.' });
        }
        res.json({ success: true, message: 'Event added successfully.' });
    });
});


// Start the server
app.listen(3812, () => {
    console.log("Server is running on port 3812");
});

