function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const error = document.getElementById('error');

    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'tms.html';
    } else {
        error.textContent = 'Invalid username or password';
    }
}

function checkLogin() {
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('excelData');
    window.location.href = 'index.html';
}

function importExcel() {
    document.getElementById('file-input').click();
}

function handleFile(files) {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        localStorage.setItem('excelData', JSON.stringify(jsonData));
        alert('Excel file imported successfully.');
        document.getElementById('file-input').value = '';
    };
    reader.readAsBinaryString(file);
}

function populateTimes() {
    const select = document.getElementById('time-select');
    select.innerHTML = '<option>all</option>';
    for (let h = 0; h < 24; h++) {
        const hh = h.toString().padStart(2, '0');
        select.innerHTML += `<option>${hh}:00 - ${hh}:59</option>`;
    }
}

function populateCars() {
    const select = document.getElementById('car-select');
    select.innerHTML = '';
    for (let g = 1; g <= 8; g++) {
        select.innerHTML += `<option value="${g}">Car ${g}</option>`;
    }
}

function showData() {
    const data = JSON.parse(localStorage.getItem('excelData') || '[]');
    const display = document.getElementById('data-display');
    if (data.length < 5) {
        display.innerHTML = '<p>No data imported yet.</p>';
        return;
    }
    const selectedGroup = parseInt(document.getElementById('car-select').value);
    const groups = [
        [11, 16, 21, 26, 31, 36, 41, 46, 49, 52],
        [61, 66, 71, 76, 81, 86, 91, 96, 99, 102],
        [111, 116, 121, 126, 131, 136, 141, 146, 149, 152],
        [161, 166, 171, 176, 181, 186, 191, 196, 199, 202],
        [211, 216, 221, 226, 231, 236, 241, 246, 249, 252],
        [261, 266, 271, 276, 281, 286, 291, 296, 299, 302],
        [311, 316, 321, 326, 331, 336, 341, 346, 349, 352],
        [361, 366, 371, 376, 381, 386, 391, 396, 399, 402]
    ];
    const groupCols = groups[selectedGroup - 1] || [];
    const selectedColumns = [0, 1, 2].concat(groupCols);
    const selectedTime = document.getElementById('time-select').value;
    let fullHtml = '';
    if (selectedTime === 'all') {
        for (let h = 0; h < 24; h++) {
            const hh = h.toString().padStart(2, '0');
            const period = `${hh}:00 - ${hh}:59`;
            let periodHtml = '<table><thead><tr>';
            selectedColumns.forEach(col => {
                periodHtml += `<th>${data[0][col] || ''}</th>`;
            });
            periodHtml += '</tr></thead><tbody>';
            let hasData = false;
            for (let i = 4; i < data.length; i++) {
                const row = data[i];
                const hour = new Date(row[1]).getHours();
                if (hour === h) {
                    hasData = true;
                    periodHtml += '<tr>';
                    selectedColumns.forEach(col => {
                        periodHtml += `<td>${row[col] || ''}</td>`;
                    });
                    periodHtml += '</tr>';
                }
            }
            periodHtml += '</tbody></table>';
            if (hasData) {
                fullHtml += `<h3>Hour ${period}</h3>` + periodHtml;
            }
        }
        display.innerHTML = fullHtml || '<p>No data available.</p>';
    } else {
        const selectedHour = parseInt(selectedTime.substring(0, 2));
        let heading = `<h3>Hour ${selectedTime}</h3>`;
        let html = '<table><thead><tr>';
        selectedColumns.forEach(col => {
            html += `<th>${data[0][col] || ''}</th>`;
        });
        html += '</tr></thead><tbody>';
        let hasData = false;
        for (let i = 4; i < data.length; i++) {
            const row = data[i];
            const hour = new Date(row[1]).getHours();
            if (hour === selectedHour) {
                hasData = true;
                html += '<tr>';
                selectedColumns.forEach(col => {
                    html += `<td>${row[col] || ''}</td>`;
                });
                html += '</tr>';
            }
        }
        html += '</tbody></table>';
        if (!hasData) {
            html = '<p>No data for this period.</p>';
        }
        display.innerHTML = heading + html;
    }
}

function populateAbnormalTimes() {
    const select = document.getElementById('abnormal-time-select');
    select.innerHTML = '<option>all</option>';
    for (let h = 0; h < 24; h++) {
        const hh = h.toString().padStart(2, '0');
        select.innerHTML += `<option>${hh}:00 - ${hh}:59</option>`;
    }
}

function showAbnormal() {
    const data = JSON.parse(localStorage.getItem('excelData') || '[]');
    if (data.length < 5) {
        alert('No data imported yet.');
        return;
    }
    populateAbnormalTimes();
    document.getElementById('abnormal-time-select').value = document.getElementById('time-select').value;
    updateAbnormalDisplay();
    document.getElementById('abnormalModal').style.display = "block";
}

function updateAbnormalDisplay() {
    const data = JSON.parse(localStorage.getItem('excelData') || '[]');
    const selectedColumns = [0, 1, 2, 49, 52, 99, 102, 149, 152, 199, 202, 249, 252, 299, 302, 349, 352, 399, 402];
    const tempColumns = [49, 52, 99, 102, 149, 152, 199, 202, 249, 252, 299, 302, 349, 352, 399, 402];
    const selectedTime = document.getElementById('abnormal-time-select').value;
    let html = '<table><thead><tr>';
    selectedColumns.forEach(col => {
        html += `<th>${data[0][col] || ''}</th>`;
    });
    html += '</tr></thead><tbody>';
    let hasAbnormal = false;
    for (let i = 4; i < data.length; i++) {
        const row = data[i];
        let include = false;
        let rowHour = new Date(row[1]).getHours();
        if (selectedTime !== 'all') {
            const selectedHour = parseInt(selectedTime.substring(0, 2));
            if (rowHour !== selectedHour) continue;
        }
        for (let tempCol of tempColumns) {
            const value = parseFloat(row[tempCol]);
            if (!isNaN(value) && value > 40) {
                include = true;
                break;
            }
        }
        if (include) {
            hasAbnormal = true;
            html += '<tr>';
            selectedColumns.forEach(col => {
                let cellValue = row[col] || '';
                let style = '';
                if (tempColumns.includes(col)) {
                    const value = parseFloat(cellValue);
                    if (!isNaN(value) && value > 40) {
                        style = 'style="color: red;"';
                    }
                }
                html += `<td ${style}>${cellValue}</td>`;
            });
            html += '</tr>';
        }
    }
    html += '</tbody></table>';
    if (!hasAbnormal) {
        html = '<p>No abnormal data.</p>';
    }
    document.getElementById('abnormal-display').innerHTML = html;
}

function closeModal() {
    document.getElementById('abnormalModal').style.display = "none";
}

function showTempAnalysis() {
    const data = JSON.parse(localStorage.getItem('excelData') || '[]');
    if (data.length < 5) {
        alert('No data imported yet.');
        return;
    }
    updateTempAnalysisDisplay();
    document.getElementById('tempAnalysisModal').style.display = "block";
}

function updateTempAnalysisDisplay() {
    let html = '<table><thead><tr><th>Temp. Diff.</th><th>Delta Temp</th><th>offset value</th><th>Level</th><th>Method</th></tr></thead><tbody>';
    // Placeholder: no rows yet, as logic to be added later
    html += '</tbody></table>';
    document.getElementById('temp-analysis-display').innerHTML = html;
}

function closeTempModal() {
    document.getElementById('tempAnalysisModal').style.display = "none";
}

function clearData() {
    localStorage.removeItem('excelData');
    const select = document.getElementById('time-select');
    select.innerHTML = '<option>all</option>';
    document.getElementById('data-display').innerHTML = '';
    document.getElementById('file-input').value = '';
    alert('Data cleared.');
    populateTimes(); 
}

function resetTime() {
    document.getElementById('time-select').value = 'all';
    showData();
}