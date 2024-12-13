
create database 434WealthWizardProject;
use 434WealthWizardProject;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    income DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(500),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
ALTER TABLE transactions 
ADD category ENUM('dining', 'transportation', 'entertainment', 'utilities', 'health', 'others') NOT NULL DEFAULT 'others';
ALTER TABLE transactions 
-> MODIFY category ENUM('dining', 'transportation', 'entertainment', 'utilities', 'health', 'others', 'investment') NOT NULL DEFAULT 'others';
ALTER TABLE transactions 
ADD COLUMN payment_place VARCHAR(255) NOT NULL DEFAULT 'Unknown';
ALTER TABLE transactions MODIFY category VARCHAR(255);
UPDATE transactions
SET category = 'Other'
WHERE category NOT IN ('Food', 'Rent', 'Utilities', 'Other', 'NewCategory');
ALTER TABLE transactions MODIFY category ENUM('Food', 'Rent', 'Utilities', 'Other', 'NewCategory');
ALTER TABLE transactions 
MODIFY category ENUM('Food', 'Rent', 'Utilities', 'Other', 'Shopping');
DELETE FROM transactions 
    -> WHERE category NOT IN ('dining', 'transportation', 'entertainment', 'investment', 'utilities', 'health', 'others');
ALTER TABLE transactions 
    -> MODIFY category ENUM('dining', 'transportation', 'entertainment', 'investment', 'utilities', 'health', 'others') NOT NULL;
UPDATE transactions
SET category = 'others'
WHERE category NOT IN ('dining', 'transportation', 'entertainment', 'investment', 'utilities', 'health', 'others');

CREATE TABLE buckets (
    bucket_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bucket_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE loans (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lender_name VARCHAR(255),
    loan_amount DECIMAL(10, 2) NOT NULL,
    remaining_balance DECIMAL(10, 2) NOT NULL,
    interest_rate DECIMAL(5, 2),
    start_date DATE,
    due_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    urgency ENUM('low', 'medium', 'high'),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


