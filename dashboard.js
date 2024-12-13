document.addEventListener("DOMContentLoaded", () => {
    const fetchAndPopulate = (url, selector, mapper, emptyMessage = 'No data found.') => {
        fetch(url)
            .then(response => {
                console.log(`Response from ${url}:`, response); // Log response
                return response.json();
            })
            .then(data => {
                console.log(`Data from ${url}:`, data); // Log fetched data

                const element = document.querySelector(selector);
                console.log(`Selector ${selector} found:`, element); // Check if selector exists

                if (data.success && data.data.length > 0) {
                    element.innerHTML = data.data.map(mapper).join('');
                } else {
                    element.innerHTML = `<li>${emptyMessage}</li>`;
                }
            })
            .catch(err => console.error(`Fetch error: ${err}`));
    };

    // Fetch recent transactions
    fetchAndPopulate('/api/transactions/recent', '.money-out ul', item =>
        `<li>${item.transaction_date} - ${item.payment_place} - $${parseFloat(item.amount).toFixed(2)}</li>`,
        'No recent transactions found.'
    );

    // Fetch top categories
    fetchAndPopulate('/api/transactions/top-categories', '.top-categories ul', item =>
        `<li>${item.category} - $${parseFloat(item.total_amount).toFixed(2)}</li>`,
        'No categories found.'
    );

    // Fetch top spenders
    fetchAndPopulate('/api/transactions/top-spenders', '.top-spenders ul', item =>
        `<li>${item.payment_place} - $${parseFloat(item.amount).toFixed(2)}</li>`,
        'No top spenders found.'
    );

    // Fetch income and populate income fields
    fetch('/api/user/income')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.income !== null) {
                document.getElementById('income').value = data.income;
                document.getElementById('monthlyIncome').textContent = `Monthly Income: $${parseFloat(data.income).toFixed(2)}`;
                createPieChart(data.income); // Call chart creation after fetching income
            } else {
                console.warn("No income found or user not authenticated.");
            }
        })
        .catch(err => console.error("Error fetching income:", err));

    // Fetch total expenses and create pie chart
    function createPieChart(monthlyIncome) {
        fetch('/api/transactions/total-expenses')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const totalExpenses = data.total_expenses || 0;
                    const remainingBudget = Math.max(0, monthlyIncome - totalExpenses);
                    const ctx = document.getElementById('piechart').getContext('2d');

                    new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: ['Expenses', 'Remaining Budget'],
                            datasets: [{
                                data: [totalExpenses, remainingBudget],
                                backgroundColor: ['#FF6384', '#36A2EB']
                            }]
                        }
                    });

                    if ((totalExpenses / monthlyIncome) >= 0.8) {
                        alert("Warning: You are nearing your budget!");
                    }
                } else {
                    console.warn('Error fetching total expenses.');
                }
            })
            .catch(err => console.error("Error fetching total expenses:", err));
    }
});

function changeMonthlyIncome() {
    const incomeInput = document.getElementById("income").value;
    const income = parseFloat(incomeInput);

    if (isNaN(income) || income <= 0) {
        alert("Please enter a valid income.");
        return;
    }

    fetch('/api/user/update-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('monthlyIncome').textContent = `Monthly Income: $${income.toFixed(2)}`;
            alert("Income updated successfully.");
        } else {
            alert(`Error updating income: ${data.message}`);
        }
    })
    .catch(err => console.error("Error updating income:", err));
}
