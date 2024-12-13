// Initializes stock market chart with placeholder data
const stockChartCtx = document.getElementById('stock-market-chart').getContext('2d');
const stockChart = new Chart(stockChartCtx, { 
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Stock Market Index',
            data: [1000, 1050, 1025, 1100, 1080, 1150],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2
        }]
    }
});

// Initializes housing market chart with placeholder data
const houseChartCtx = document.getElementById('house-market-chart').getContext('2d');
const houseChart = new Chart(houseChartCtx, { 
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Housing Prices',
            data: [250000, 260000, 255000, 270000, 265000, 280000],
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2
        }]
    }
});

// Initializes car market chart with placeholder data
const carChartCtx = document.getElementById('car-market-chart').getContext('2d');
const carChart = new Chart(carChartCtx, { 
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Car Recall Counts',
            data: [1, 1, 1, 1, 1, 1],
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2
        }]
    }
});

// This will fetch and update housing market data based on ZIP code
async function updateHousingData() {
    const zipCode = document.getElementById('zip-code-house').value;
    if (!zipCode) {
        console.error("Please enter a valid ZIP Code.");
        return;
    }

    const accessToken = 'YOUR_BRIDGE_API_ACCESS_TOKEN'; // Replace with your actual access token
    const datasetId = 'YOUR_DATASET_ID'; // Replace with your dataset ID
    const url = `https://api.bridgedataoutput.com/api/v2/OData/${datasetId}/Property?access_token=${accessToken}&$filter=PropertyType eq 'Residential Lease' and PostalCode eq '${zipCode}' and StandardStatus eq 'Active'`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const properties = data.value;

        if (!properties || properties.length === 0) {
            console.error("No data found for the given ZIP Code.");
            return;
        }

        const prices = properties.map(p => p.ListPrice);
        const labels = properties.map((_, i) => `Property ${i + 1}`);

        houseChart.data.labels = labels;
        houseChart.data.datasets[0].data = prices;
        houseChart.update();

    } catch (error) {
        console.error("Failed to fetch data from the Bridge API:", error);
    }
}

// This will fetch and update car market data based on ZIP code
async function updateCarData() {
    const zipCode = document.getElementById('zip-code-car').value;
    const make = 'acura';
    const model = 'rdx';
    const modelYear = 2012;

    const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${make}&model=${model}&modelYear=${modelYear}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const recalls = data.results;

        if (!recalls || recalls.length === 0) {
            console.error("No recalls found for the given car.");
            return;
        }

        const labels = recalls.map(r => r.Component);
        const recallCounts = recalls.map(() => 1);

        carChart.data.labels = labels;
        carChart.data.datasets[0].data = recallCounts;
        carChart.update();

    } catch (error) {
        console.error("Failed to fetch data from the NHTSA API:", error);
    }
}

// This will fetch and update stock market data
async function fetchStockData() {
    const symbol = 'IBM'; // Replace with your desired stock symbol
    const apiKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your Alpha Vantage API key
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const timeSeries = data['Time Series (Daily)'];

        if (!timeSeries) {
            console.error("No time series data found in Alpha Vantage response.");
            return;
        }

        const dates = Object.keys(timeSeries).slice(0, 30).reverse();
        const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

        stockChart.data.labels = dates;
        stockChart.data.datasets[0].data = prices;
        stockChart.update();

    } catch (error) {
        console.error("Failed to fetch data from Alpha Vantage:", error);
    }
}

// Fetch initial stock data when page loads
	fetchStockData();