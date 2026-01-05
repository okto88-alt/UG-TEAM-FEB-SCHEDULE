// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    generateScheduleTable();
    setupEventListeners();
});

// Update current date in header
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}



// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    
    // Search on Enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStaff();
        }
    });
    
    // Real-time search as user types
    searchInput.addEventListener('input', function() {
        if (this.value === '') {
            clearSearch();
        } else {
            searchStaff();
        }
    });
    

}

// Search functionality
function searchStaff() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // If search is empty, hide search results
        hideSearchResults();
        return;
    }
    
    // Search through schedule data and show detailed results
    const foundResults = findStaffSchedule(searchTerm);
    
    if (foundResults.length > 0) {
        showDetailedSearchResults(searchTerm);
    } else {
        showNoResultsMessage();
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    
    // Hide no results message if visible
    const noResultsMsg = document.getElementById('noResultsMessage');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
    
    hideSearchResults();
}

// Show no results message
function showNoResultsMessage() {
    // Remove existing message if any
    const existingMsg = document.getElementById('noResultsMessage');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    const message = document.createElement('div');
    message.id = 'noResultsMessage';
    message.className = 'no-results-message';
    message.innerHTML = `
        <div style="
            text-align: center;
            padding: 40px;
            color: #94a3b8;
            font-size: 1.1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            margin: 20px 0;
        ">
            <div style="font-size: 2rem; margin-bottom: 10px;">🔍</div>
            <div>No staff found matching your search criteria</div>
            <div style="font-size: 0.9rem; margin-top: 5px; color: #64748b;">
                Try searching for a different name or website
            </div>
        </div>
    `;
    
    // Insert message after search section
    const searchSection = document.querySelector('.search-section');
    searchSection.parentNode.insertBefore(message, searchSection.nextSibling);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000);
}

// Hide no results message
function hideNoResultsMessage() {
    const message = document.getElementById('noResultsMessage');
    if (message) {
        message.remove();
    }
}

// Show detailed search results
function showDetailedSearchResults(searchTerm) {
    hideSearchResults();
    
    const staffSchedule = findStaffSchedule(searchTerm);
    if (staffSchedule.length === 0) return;
    
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'searchResults';
    searchResultsContainer.className = 'search-results';
    
    let resultsHTML = `
        <div class="search-results-header">
            <h3>Search Results for "${searchTerm}"</h3>
            <p class="search-results-count">${staffSchedule.length} assignment${staffSchedule.length > 1 ? 's' : ''} found</p>
        </div>
        <div class="search-results-content">
    `;
    
    staffSchedule.forEach(assignment => {
        const formattedDate = new Date(assignment.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        resultsHTML += `
            <div class="search-result-item">
                <div class="result-header">
                    <span class="result-staff-name">${assignment.staffName}</span>
                    <span class="result-date">${formattedDate}</span>
                    <span class="result-shift ${assignment.shift}">${assignment.shift.toUpperCase()}</span>
                </div>
                <div class="result-websites">
                    <strong>Websites:</strong> ${assignment.websites}
                </div>
            </div>
        `;
    });
    
    resultsHTML += `
        </div>
    `;
    
    searchResultsContainer.innerHTML = resultsHTML;
    
    // Insert after search section
    const searchSection = document.querySelector('.search-section');
    searchSection.parentNode.insertBefore(searchResultsContainer, searchSection.nextSibling);
}

// Hide search results
function hideSearchResults() {
    const results = document.getElementById('searchResults');
    if (results) {
        results.remove();
    }
}

// Find staff schedule in the data
function findStaffSchedule(searchTerm) {
    const scheduleData = getScheduleData();
    const results = [];
    
    scheduleData.forEach(day => {
        // Check morning shift
        Object.keys(day.morning).forEach(website => {
            const staffName = day.morning[website];
            if (staffName && staffName !== 'OFF DAY' && staffName.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({
                    staffName: staffName,
                    date: day.date,
                    shift: 'morning',
                    websites: website
                });
            }
        });
        
        // Check evening shift
        Object.keys(day.evening).forEach(website => {
            const staffName = day.evening[website];
            if (staffName && staffName !== 'OFF DAY' && staffName.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({
                    staffName: staffName,
                    date: day.date,
                    shift: 'evening',
                    websites: website
                });
            }
        });
    });
    
    return results;
}

// Get schedule data for reuse
function getScheduleData() {
    return [
        {
            date: '2026-01-01',
            dayName: 'Thursday',
            morning: {
                'SURIA88': 'Andi',
                'HAKABET': 'Anggie',
                'VIOBET': 'Chandy',
                'TEMPO88': 'Firman',
                'FILA88': 'Angga',
                'IJOBET': 'Jerry',
                'HAHAWIN88': 'Andi, Anggie',
                'OFF DAY UG': 'Kris, Dea'
            },
            evening: {
                'SURIA88': 'Kenny',
                'HAKABET': 'Sindy',
                'VIOBET': 'Heno',
                'TEMPO88': 'Alfan',
                'FILA88': 'Kheiren',
                'IJOBET': 'Valvi',
                'HAHAWIN88': 'Alfan',
                'OFF DAY UG': '-'
            }
        },
        {
            date: '2026-01-02',
            dayName: 'Friday',
            morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Anggie',
            'VIOBET': 'Chandy',
            'TEMPO88': 'Firman',
            'FILA88': 'Angga',
            'IJOBET': 'Kris',
            'HAHAWIN88': 'Firman, Anggie',
            'OFF DAY UG': 'Sindy, Valvi'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Kenny',
            'VIOBET': 'Heno',
            'TEMPO88': 'Alfan',
            'FILA88': 'Kheiren',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': '-'
            }
        },
        {
            date: '2026-01-03',
            dayName: 'Saturday',
            morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Sindy',
            'VIOBET': 'Chandy',
            'TEMPO88': 'Egi',
            'FILA88': 'Kris',
            'IJOBET': 'Valvi',
            'HAHAWIN88': 'Dea',
            'OFF DAY UG': 'Kheiren'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Firman',
            'VIOBET': 'Heno',
            'TEMPO88': 'Alfan',
            'FILA88': 'Kenny',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': '-'
            }
        },
        {
            date: '2026-01-04',
            dayName: 'Sunday',
            morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Sindy',
            'VIOBET': 'Kris',
            'TEMPO88': 'Egi',
            'FILA88': 'Kheiren',
            'IJOBET': 'Valvi',
            'HAHAWIN88': 'Dea',
            'OFF DAY UG': '-'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Firman',
            'VIOBET': 'Anggie',
            'TEMPO88': 'Alfan',
            'FILA88': 'Angga',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': 'Vindy'
            }
        },
        {
            date: '2026-01-05',
            dayName: 'Monday',      
            morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Sindy',
            'VIOBET': 'Heno',
            'TEMPO88': 'Egi',
            'FILA88': 'Kheiren',
            'IJOBET': 'Valvi',
            'HAHAWIN88': 'Kris',
            'OFF DAY UG': '-'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Firman',
            'VIOBET': 'Anggie',
            'TEMPO88': 'Alfan',
            'FILA88': 'Angga',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': 'Kenny'
            }
        },
        {
            date: '2026-01-06',
            dayName: 'Tuesday',
            morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Sindy',
            'VIOBET': 'Heno',
            'TEMPO88': 'Egi',
            'FILA88': 'Kheiren',
            'IJOBET': 'Valvi',
            'HAHAWIN88': 'Dea',
            'OFF DAY UG': 'Chandy'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Firman',
            'VIOBET': 'Anggie',
            'TEMPO88': 'Kenny',
            'FILA88': 'Angga',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Firman, Kenny',
            'OFF DAY UG': 'Alfan'
            }
        },
        {
            date: '2026-01-07',
            dayName: 'Wednesday',
        morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Sindy',
            'VIOBET': 'Heno',
            'TEMPO88': 'Kris',
            'FILA88': 'Kheiren',
            'IJOBET': 'Valvi',
            'HAHAWIN88': 'Dea',
            'OFF DAY UG': 'Egi'
        },
        evening: {
            'SURIA88': 'Kenny',
            'HAKABET': 'Firman',
            'VIOBET': 'Vindy',
            'TEMPO88': 'Alfan',
            'FILA88': 'Angga',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': 'Andi, Anggie'
            }
        },
                {
            date: '2026-01-08',
            dayName: 'Thursday',
            morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Sindy',
            'VIOBET': 'Heno',
            'TEMPO88': 'Egi',
            'FILA88': 'Kheiren',
            'IJOBET': 'Kris',
            'HAHAWIN88': 'Dea',
            'OFF DAY UG': 'Valvi'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Kenny',
            'VIOBET': 'Anggie',
            'TEMPO88': 'Alfan',
            'FILA88': 'Angga',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': 'Firman'
            }
        },
                        {
            date: '2026-01-09',
            dayName: 'Friday',
            morning: {
            'SURIA88': 'Kris',
            'HAKABET': 'Sindy',
            'VIOBET': 'Heno',
            'TEMPO88': 'Egi',
            'FILA88': 'Kheiren',
            'IJOBET': 'Valvi',
            'HAHAWIN88': 'Heno',
            'OFF DAY UG': 'Dea'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Firman',
            'VIOBET': 'Kenny',
            'TEMPO88': 'Alfan',
            'FILA88': 'Anggie',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': 'Angga'
            }
        },
                        {
            date: '2026-01-10',
            dayName: 'Saturday',
            morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Sindy',
            'VIOBET': 'Heno',
            'TEMPO88': 'Egi',
            'FILA88': 'Kris',
            'IJOBET': 'Valvi',
            'HAHAWIN88': 'Dea',
            'OFF DAY UG': 'Kheiren'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Firman',
            'VIOBET': 'Anggie',
            'TEMPO88': 'Alfan',
            'FILA88': 'Angga',
            'IJOBET': 'Kenny',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': 'Jerry'
            }
        },
                                {
            date: '2026-01-11',
            dayName: 'Sunday',
            morning: {
            'SURIA88': 'Dea',
            'HAKABET': 'Sindy',
            'VIOBET': 'Heno',
            'TEMPO88': 'Egi',
            'FILA88': 'Kheiren',
            'IJOBET': 'Valvi',
            'HAHAWIN88': 'Dea',
            'OFF DAY UG': 'Kris'
        },
            evening: {
            'SURIA88': 'Andi',
            'HAKABET': 'Firman',
            'VIOBET': 'Anggie',
            'TEMPO88': 'Alfan',
            'FILA88': 'Angga',
            'IJOBET': 'Jerry',
            'HAHAWIN88': 'Alfan',
            'OFF DAY UG': 'Vindy'
            }
        },
        
        
    ];
}

// Continue with findStaffSchedule function
function findStaffSchedule(searchTerm) {
    const scheduleData = getScheduleData();
    const results = [];
    const websites = ['SURIA88', 'HAKABET', 'VIOBET', 'TEMPO88', 'FILA88', 'IJOBET', 'HAHAWIN88'];
    
    scheduleData.forEach(day => {
        // Check morning shift
        websites.forEach(website => {
            const staff = day.morning[website];
            if (staff && staff.toLowerCase().includes(searchTerm) && staff !== 'OFF DAY') {
                results.push({
                    staffName: staff,
                    date: day.date,
                    dayName: day.dayName,
                    shift: 'morning',
                    websites: website
                });
            }
        });
        
        // Check evening shift
        websites.forEach(website => {
            const staff = day.evening[website];
            if (staff && staff.toLowerCase().includes(searchTerm) && staff !== 'OFF DAY') {
                results.push({
                    staffName: staff,
                    date: day.date,
                    dayName: day.dayName,
                    shift: 'evening',
                    websites: website
                });
            }
        });
    });
    
    return results;
}

// Show staff details
function showStaffDetails(staffName, websites, isOffDay) {
    const staffDetailsSection = document.getElementById('staffDetails');
    const staffDetailsContent = document.getElementById('staffDetailsContent');
    
    let detailsHTML = `
        <div class="detail-item">
            <div class="detail-label">Staff Name</div>
            <div class="detail-value">${staffName}</div>
        </div>
    `;
    
    if (isOffDay) {
        detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value" style="color: #ef4444;">Off Day</div>
            </div>
        `;
    } else {
        detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value" style="color: #22c55e;">Active</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Assigned Websites</div>
                <div class="detail-value">${websites}</div>
            </div>
        `;
    }
    
    // Determine shift based on current time (for demo purposes)
    const currentHour = new Date().getHours();
    const shift = currentHour < 12 ? 'Morning' : 'Evening';
    
    detailsHTML += `
        <div class="detail-item">
            <div class="detail-label">Current Shift</div>
            <div class="detail-value">${shift}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Last Updated</div>
            <div class="detail-value">${new Date().toLocaleString()}</div>
        </div>
    `;
    
    staffDetailsContent.innerHTML = detailsHTML;
    staffDetailsSection.style.display = 'block';
    
    // Scroll to details section
    staffDetailsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        staffDetailsSection.style.display = 'none';
    }, 10000);
}



// Update time every minute
setInterval(() => {
    updateCurrentDate();
}, 60000);



// Export functions for potential external use
window.scheduleFunctions = {
    searchStaff,
    clearSearch,
    showStaffDetails,
    generateScheduleTable,
    updateCurrentDate,
    getScheduleData
};

// Generate schedule table with dummy data
function generateScheduleTable() {
    const tableBody = document.getElementById('scheduleTableBody');
    
    // Get schedule data
    const scheduleData = getScheduleData();

    let tableHTML = '';

    scheduleData.forEach(day => {
        const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const websites = ['SURIA88', 'HAKABET', 'VIOBET', 'TEMPO88', 'FILA88', 'IJOBET', 'HAHAWIN88', 'OFF DAY UG'];

        // Day shift row
        tableHTML += `
            <tr class="day-row">
                <td class="date-cell" rowspan="2">${day.dayName}<br>${formattedDate}</td>
                ${websites.map(website => {
                    const assignment = day.morning[website];
                    const cellClass = assignment === 'OFF DAY' ? 'off-day' : 'staff-assignment';
                    return `<td class="${cellClass}">${assignment || '-'}</td>`;
                }).join('')}
            </tr>
        `;

        // Night shift row
        tableHTML += `
            <tr class="night-row">
                ${websites.map(website => {
                    const assignment = day.evening[website];
                    const cellClass = assignment === 'OFF DAY' ? 'off-day' : 'staff-assignment';
                    return `<td class="${cellClass}">${assignment || '-'}</td>`;
                }).join('')}
            </tr>
        `;
    });

    tableBody.innerHTML = tableHTML;
}




