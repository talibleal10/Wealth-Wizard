document.addEventListener("DOMContentLoaded", () => {
    const accountSelector = document.getElementById("accountSelector");

    // Switch checking accounts dynamically
    accountSelector.addEventListener("change", () => {
        loadAccounts(accountSelector.value);
    });

    // Fetch all accounts and loans for the logged-in user
    const loadAccountsAndLoans = () => {
        fetch('/api/accounts/all')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    displayAccounts(data.accounts);
                    displayLoans(data.loans);
                } else {
                    console.error("Error loading data:", data.message);
                }
            })
            .catch(err => console.error("Error fetching data:", err));
    };

    const displayAccounts = (accounts) => {
        const accountsContainer = document.querySelector(".accounts-list");
        accountsContainer.innerHTML = accounts.map(account => `
            <div class="account-item">
                <h3>${account.bucket_name}</h3>
                <p>Target Amount: $${account.target_amount}</p>
                <p>Current Balance: $${account.current_amount}</p>
            </div>
        `).join('');
    };

    const displayLoans = (loans) => {
        const loansContainer = document.querySelector(".loans-list");
        loansContainer.innerHTML = loans.map(loan => `
            <div class="loan-item">
                <h3>${loan.lender_name || 'Loan'}</h3>
                <p>Loan Amount: $${loan.loan_amount}</p>
                <p>Remaining Balance: $${loan.remaining_balance}</p>
                <p>Interest Rate: ${loan.interest_rate}%</p>
                <p>Start Date: ${loan.start_date}</p>
                <p>Due Date: ${loan.due_date}</p>
            </div>
        `).join('');
    };

    // Add new bank account
    window.addBankAccount = () => {
        const accountType = document.getElementById("accountType").value;
        const balance = document.getElementById("accountbalance").value;

        fetch('/api/accounts/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountType, balance })
        }).then(() => loadAccountsAndLoans());
    };

    // Add new loan
    window.addLoan = () => {
        const lenderName = document.getElementById("lenderName").value;
        const loanAmount = document.getElementById("loanBalance").value;
        const monthlyPayments = document.getElementById("monthlyPayments").value;
        const startDate = document.getElementById("startDate").value;
        const dueDate = document.getElementById("dueDate").value;

        fetch('/api/loans/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lenderName, loanAmount, monthlyPayments, startDate, dueDate })
        }).then(() => loadAccountsAndLoans());
    };

    // Initial load
    loadAccountsAndLoans();
    // Redirect to the selected calculator page

    window.useCalculator = () => {
    const selectedCalculator = document.getElementById("calculator").value;

    // Define a mapping of calculator IDs to HTML file names
    const calculatorPages = {
        retirmentCalc: "retirementCalc.html",
        morgateCalc: "mortgageCalc.html",
        autoCalc: "autoCalc.html",
        savingCalc: "savingCalc.html",
        investmentCalc: "investmentCalc.html",
        taxCalc: "taxCalc.html",
        businessCalc: "businessCalc.html",
        ccDebtCalc: "ccDebtCalc.html",
        loanCalc: "loanCalc.html",
    };

    // Redirect to the corresponding calculator page
    if (calculatorPages[selectedCalculator]) {
        window.location.href = calculatorPages[selectedCalculator];
    } else {
        alert("Invalid calculator selection.");
    }
};


});
