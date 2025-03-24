const menus = {
    A: {
        name: "メニューA（ドリブル練習）",
        links: [
            "https://youtu.be/oIkk0aIN_jM?feature=shared",
            "https://youtu.be/iJoo7pbZ5D0?feature=shared"
        ]
    },
    B: {
        name: "メニューB（リフティング10分）",
        links: [
            "https://youtu.be/MsOVrZB4wRo?feature=shared"
        ]
    }
};

let editIndex = null; // 編集中のインデックスを管理

function showRandomMenu() {
    const keys = Object.keys(menus);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const menu = menus[randomKey];
    let html = `<strong>${menu.name}</strong><ul>`;
    menu.links.forEach(link => {
        html += `<li><a href="${link}" target="_blank">${link}</a></li>`;
    });
    html += `</ul>`;
    document.getElementById('menuContent').innerHTML = html;
}

function saveRecord() {
    const date = document.getElementById('date').value;
    const menu = document.getElementById('menu').value;
    const memo = document.getElementById('memo').value;
    const photoInput = document.getElementById('photo');

    if (!date) {
        alert("日付を入力してください");
        return;
    }

    if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const photoDataURL = e.target.result;
            const record = { date, menu, memo, photoURL: photoDataURL };
            saveRecordToLocalStorage(record);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        const record = { date, menu, memo, photoURL: "" };
        saveRecordToLocalStorage(record);
    }
}

function saveRecordToLocalStorage(record) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    if (editIndex !== null) {
        // 編集モードの場合
        records[editIndex] = record;
        editIndex = null;
        alert("編集を保存しました！");
    } else {
        records.push(record);
        alert("新しい記録を保存しました！");
    }
    localStorage.setItem('records', JSON.stringify(records));
    displayRecords();
    renderCalendar();
    document.getElementById('recordForm').reset();
}

function displayRecords() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    const list = document.getElementById('recordList');
    list.innerHTML = "";
    records.forEach((record, index) => {
        let li = `<li>
            <strong>${record.date}</strong> - ${menus[record.menu].name}<br>
            ${record.memo ? "メモ: " + record.memo + "<br>" : ""}
            ${record.photoURL ? `<img src="${record.photoURL}" width="100"><br>` : ""}
            <button onclick="editRecord(${index})">編集</button>
            <button onclick="deleteRecord(${index})">削除</button>
        </li>`;
        list.innerHTML += li;
    });
}

function deleteRecord(index) {
    if (confirm("この記録を削除しますか？")) {
        let records = JSON.parse(localStorage.getItem('records')) || [];
        records.splice(index, 1);
        localStorage.setItem('records', JSON.stringify(records));
        displayRecords();
        renderCalendar();
        alert("削除しました！");
    }
}

function editRecord(index) {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const record = records[index];
    document.getElementById('date').value = record.date;
    document.getElementById('menu').value = record.menu;
    document.getElementById('memo').value = record.memo;
    editIndex = index;
    alert("編集モードになりました！内容を変更して「保存」を押してください。");
}

function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    const records = JSON.parse(localStorage.getItem('records')) || [];
    calendarEl.innerHTML = "";

    const events = records.map(record => ({
        title: menus[record.menu].name,
        start: record.date,
        description: record.memo,
        extendedProps: { photoURL: record.photoURL }
    }));

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ja',
        events: events,
        eventClick: function(info) {
            let content = `<strong>${info.event.title}</strong><br>`;
            content += `日付: ${info.event.start.toLocaleDateString()}<br>`;
            content += `メモ: ${info.event.extendedProps.description || 'なし'}<br>`;
            if (info.event.extendedProps.photoURL) {
                content += `<img src="${info.event.extendedProps.photoURL}" width="150">`;
            }
            alert(content);
        }
    });
    calendar.render();
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('randomMenuButton').addEventListener('click', showRandomMenu);
    displayRecords();
    renderCalendar();
});
