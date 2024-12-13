let userId; // Global variable to hold the user ID
let categoryTotals = {
    dining: 0,
    transportation: 0,
    entertainment: 0,
    investment: 0,
    utilities: 0,
    health: 0,
    others: 0
};
let categoryChart;

// Fetch the user ID when the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                userId = data.userId;
                loadTransactionData(); // Load transaction data after user ID is fetched
            } else {
                alert("Please log in to access transactions.");
            }
        })
        .catch(err => {
            console.error("Error fetching user ID:", err);
            alert("An error occurred. Please try again.");
        });
});

// Function to fetch and update transaction data
function loadTransactionData() {
    fetch('/api/transactions/summary')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reset and accumulate category totals
                Object.keys(categoryTotals).forEach(key => categoryTotals[key] = 0);
                data.data.forEach(item => {
                    if (categoryTotals[item.category] !== undefined) {
                        categoryTotals[item.category] += parseFloat(item.total_amount);
                    }
                });

                updateChart();
            } else {
                console.error("Error fetching transaction summary:", data.message);
            }
        })
        .catch(err => {
            console.error("Error loading transaction data:", err);
        });
}


// Function to add a transaction
function addTransaction() {
    const paymentAmount = parseFloat(document.getElementById("paymentAmount").value);
    const paymentCategory = document.getElementById("paymentCategory").value;
    const paymentPlace = document.getElementById("paymentPlace").value;

    if (!userId) {
        alert("User not logged in. Please log in.");
        return;
    }

    if (paymentAmount && paymentCategory && paymentPlace) {
        fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                transaction_type: 'expense',
                amount: paymentAmount,
                category: paymentCategory,
                description: `Payment for ${paymentCategory}`,
                payment_place: paymentPlace
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Add transaction to the log
                const transactionList = document.getElementById("transactionList");
                const newTransaction = document.createElement("li");
                newTransaction.textContent = `Payment: $${paymentAmount} | Category: ${paymentCategory} | Place: ${paymentPlace}`;
                transactionList.appendChild(newTransaction);

                // Update category totals and the chart
                categoryTotals[paymentCategory] += paymentAmount;
                updateChart();

                // Clear input fields
                document.getElementById("paymentAmount").value = "";
                document.getElementById("paymentCategory").selectedIndex = 0;
                document.getElementById("paymentPlace").value = "";
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(err => {
            console.error("Error adding transaction:", err);
        });
    } else {
        alert("Please fill out all fields.");
    }
}

// Function to create or update the chart
function updateChart() {
    const ctx = document.getElementById("categoryChart").getContext("2d");

    const totalAmount = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const percentages = Object.values(categoryTotals).map(val => totalAmount ? parseFloat(((val / totalAmount) * 100).toFixed(2)) : 0);

    if (categoryChart) {
        categoryChart.data.datasets[0].data = percentages;
        categoryChart.update();
    } else {
        categoryChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: percentages,
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF"]
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || "";
                                const value = context.raw || 0;
                                return `${label}: ${value.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}