document.addEventListener('DOMContentLoaded', function () {
    const resetDatabaseBtn = document.getElementById('resetDatabaseBtn');
    const yearDropdown = document.getElementById('yearDropdown');
    const searchTextBtn = document.getElementById('searchingTextBtn');
    const updateMediaBtn = document.getElementById('updatemediaBtn');
    const submitFilmBtn = document.getElementById('submitFilmBtn');

    resetDatabaseBtn.addEventListener('click', resetDatabase);
    yearDropdown.addEventListener('change', handleYearDropdownChange);
    searchTextBtn.addEventListener('click', searchByText);
    updateMediaBtn.addEventListener('click', updateSpecificEntry);
    submitFilmBtn.addEventListener('click', submitNewFilmBootstrap);

    generateYearOptions(new Date().getFullYear(), 1888);
});

async function updateMediaTable() {
    try {
        const response = await fetch('https://webtech.labs.vu.nl/api24/67d2e8b7');

        if (response.ok) {
            const data = await response.json();
            displayLastItemDetails(data);
        } else {
            console.log('Server returned an error:', response.status);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


function displayLastItemDetails(data) {
    const lastItem = data[data.length - 1];
    const tableBody = document.getElementById('mediaTableBody');
    const newRow = createTableRowwithValidation(lastItem);
    tableBody.appendChild(newRow);
}

function createTableRow(item) {

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <a href="${item.poster}" class="cover of each post">
                <img src="${item.poster}" alt="${item.name}">
            </a>
        </td>
        <td class="title">
            <a href="${item.poster}">${item.name}</a>
        </td>
        <td>${item.year}</td>
        <td>${item.genre}</td>
        <td>${item.description}</td>
    `;
    return newRow;
}

// Hide your form using a modal
async function submitNewFilmBootstrap() {
    const formData = new FormData(document.getElementById('newFilmFormBootstrap'));
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('https://webtech.labs.vu.nl/api24/67d2e8b7', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('New film added:', data);
            updateMediaTable();
            $('#modalFilm').modal('hide');
        } else {
            console.log('Server returned an error:', response.status);
        }
    } catch (error) {
        console.error('Error submitting new film:', error);
        throw error;
    }
}


// Reset database and clean the table: 
async function resetDatabase() {
    const tableBody = document.getElementById('mediaTableBody');
    try {
        const response = await fetch('https://webtech.labs.vu.nl/api24/67d2e8b7/reset', { method: 'GET' });

        if (response.ok) {
            tableBody.innerHTML = '';
            console.log('Database reset successful');
        } else {
            console.log('Server returned an error:', response.status);
        }
    } catch (error) {
        console.error('Error resetting database:', error);
        throw error;
    }
}


// update button: 
async function updateSpecificEntry() {
    const specificEntryId = document.getElementById('updateSpecificEntry').value;

    if (!specificEntryId) {
        console.error('Please enter the ID of the specific entry you want to update.');
        return;
    }

    const formData = new FormData(document.getElementById('newFilmFormBootstrap'));
    const jsonData = await convertFormDataToJson(formData);

    try {
        const response = await fetch(`https://webtech.labs.vu.nl/api24/67d2e8b7/item/${specificEntryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        if (response.ok) {
            updateMediaTable();
            $('#modalFilm').modal('hide');
        } else {
            console.log('Server returned an error:', response.status);
        }
    } catch (error) {
        console.error('Error updating entry:', error);
        throw error;
    }
}


async function convertFormDataToJson(formData) {
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });
    return jsonData;
}

// form validation for inputing and updating
function formValidation(item) {
    let validFrom = false;
    let errorMsg = document.querySelector("#errorMsg");

    errorMsg.innerHTML = "";
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (item.year.length !== 4 || isNaN(parseInt(item.year))) {
        errorMsg.innerHTML = "Please enter a valid four-digit year.";
    } else if (!urlRegex.test(item.poster)) {
        errorMsg.innerHTML = "Please enter a valid poster URL.";
    }
    else {
        validFrom = true;
    }
    return validFrom;
}

function createTableRowwithValidation(item) {
    let validFrom = formValidation(item);
    if (validFrom) {
        return createTableRow(item);
    }
}

//Filterable gallery:
async function updateFormByYear() {
    const selectedYear = document.getElementById('yearDropdown').value;

    try {
        const response = await fetch('https://webtech.labs.vu.nl/api24/67d2e8b7');

        if (response.ok) {
            const data = await response.json();
            let filteredData;

            if (selectedYear !== '') {
                filteredData = data.filter(item => item.year == selectedYear);
            } else {
                filteredData = data;
            }

            populateForm(filteredData);
        } else {
            console.log('Server returned an error:', response.status);
        }
    } catch (error) {
        console.error('Error fetching and filtering data:', error);
        throw error;
    }
}

function populateForm(filteredData) {
    const tableBody = document.getElementById('mediaTableBody');

    if (filteredData.length === 0) {
        hideTable();
        displayNoResultsMessage();
    } else {
        tableBody.innerHTML = '';
        filteredData.forEach(item => {
            const newRow = createTableRow(item);
            tableBody.appendChild(newRow);
        });
        showTable();
    }
}


// the unclicking function is to choose 'Not Defined'

/**
 * Function to generate year options for a dropdown.
 * Adapted from: https://stackoverflow.com/questions/17730621/how-to-dynamically-add-options-to-an-existing-select-in-vanilla-javascript
 * and https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_select_add
 * 
 * @param {number} startYear - The starting year(the nearest year)
 * @param {number} endYear - The ending year.
 */
async function generateYearOptions(startYear, endYear) {
    const yearDropdown = document.getElementById('yearDropdown');

    const undefinedOption = document.createElement('option');
    undefinedOption.value = '';
    undefinedOption.text = 'Not Defined';
    yearDropdown.add(undefinedOption);

    for (let year = startYear; year >= endYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearDropdown.add(option);
    }
}

// [BONUS] Search field to filter images:
async function searchByText() {
    const searchText = document.getElementById('searchingTextinput').value.toLowerCase();
    const selectedYear = document.getElementById('yearDropdown').value;

    try {
        const response = await fetch('https://webtech.labs.vu.nl/api24/67d2e8b7');

        if (response.ok) {
            const data = await response.json();
            let filteredData = data;

            if (selectedYear !== '') {
                filteredData = filteredData.filter(item => item.year == selectedYear);
            }

            if (searchText.trim() !== '') {
                filteredData = filteredData.filter(item =>
                    item.name.toLowerCase().includes(searchText) ||
                    item.genre.toLowerCase().includes(searchText)
                );
            }

            populateForm(filteredData);
        } else {
            console.log('Server returned an error:', response.status);
        }
    } catch (error) {
        console.error('Error fetching and filtering data:', error);
        throw error;
    }
}


async function handleYearDropdownChange() {
    await updateFormByYear();
    searchByText();
}

// hide table and show msg to indicate that there is no result after filtering
function hideTable() {
    const mediaTable = document.getElementById('main-content');
    mediaTable.style.display = 'none';
}

function showTable() {
    const mediaTable = document.getElementById('main-content');
    const warningmsg = document.getElementById('noResultsMessage');
    mediaTable.style.display = 'table';
    warningmsg.style.display = 'none';
}

function displayNoResultsMessage() {
    const noResultsMessage = document.getElementById('noResultsMessage');
    noResultsMessage.style.display = 'block';
}
