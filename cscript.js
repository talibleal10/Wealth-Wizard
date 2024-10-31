const monthYear = document.getElementById('month-year');
const calendarBody = document.getElementById('calendar-body');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const eventForm = document.getElementById('event-form');
const eventTitleInput = document.getElementById('event-title');
const eventDateInput = document.getElementById('event-date');
const eventUrgencyInput = document.getElementById('event-urgency'); 
const eventList = document.getElementById('event-list');

let currentDate = new Date();
let events = {}; 

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    setSeasonalBackground(month);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarBody.innerHTML = ''; 

    let row = document.createElement('tr');

    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement('td'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        cell.textContent = day;

        if (events[dateStr]) {
            const { title, urgency } = events[dateStr]; 
            cell.classList.add('event', urgency); 
            cell.title = title;
        }

        cell.addEventListener('click', () =>
            alert(`Events on ${dateStr}: ${events[dateStr]?.title || 'No events'}`)
        );

        row.appendChild(cell);

        if ((firstDay + day) % 7 === 0) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }
    }
    calendarBody.appendChild(row);
}

function setSeasonalBackground(month) {
    const body = document.body;
    let backgroundImage;

    switch (month) {
        case 11: // December
        case 0:  // January
        case 1:  // February
            backgroundImage = 'url("./winter.jpg")'; 
            break;
        case 2:  // March
        case 3:  // April
        case 4:  // May
            backgroundImage = 'url("./spring.jpg")'; 
            break;
        case 5:  // June
        case 6:  // July
        case 7:  // August
            backgroundImage = 'url("./summer.jpg")'; 
            break;
        case 8:  // September
        case 9:  // October
        case 10: // November
            backgroundImage = 'url("./fall.jpg")'; 
            break;
    }

    body.style.backgroundImage = backgroundImage;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.transition = 'background 0.5s ease-in-out';
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar(currentDate);
}

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const eventDate = eventDateInput.value;
    const eventTitle = eventTitleInput.value;
    const eventUrgency = eventUrgencyInput.value; 

    if (eventDate && eventTitle) {
        events[eventDate] = { title: eventTitle, urgency: eventUrgency }; 
        renderCalendar(currentDate); 
        eventTitleInput.value = '';
        eventDateInput.value = '';
        eventUrgencyInput.value = 'low'; 

        displayEvents();
    }
});

function displayEvents() {
    eventList.innerHTML = '<h3>Upcoming Events</h3>';
    for (const [date, { title, urgency }] of Object.entries(events)) {
        const eventItem = document.createElement('div');
        eventItem.textContent = `${date}: ${title} (Urgency: ${urgency})`;
        eventList.appendChild(eventItem);
    }
}

prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));



renderCalendar(currentDate);