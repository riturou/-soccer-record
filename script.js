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
    },
    C: {
        name: "メニューC（パターン練習）",
        links: [
            "https://youtu.be/AijVmQn_YRc?feature=shared"
        ]
    }
};

let editIndex = null;
const GAS_URL = "https://script.google.com/macros/s/AKfycbygrrM5UpJuHpvkOY9WRXou9FX8T0_Cws3IsOL4rL6uPftNKxVLuPRWmL0QV1hRZpw/exec";

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
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            resizeImage(e.target.result, function(resizedImage) {
                const record = { date, menu, memo, photoURL: resizedImage };
                saveRecordToLocalStorage(record);
                sendToGAS(record); // GAS送信
            });
        };
        reader.readAsDataURL(file);
    } else {
        const record = { date, menu, memo, photoURL: "" };
        saveRecordToLocalStorage(record);
        sendToGAS(record); // GAS送信
    }
}

function resizeImage(dataURL, callback) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const scale = 500 / img.width;
        canvas.width = 500;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(resizedDataUrl);
    };
    img.src = dataURL;
}

function saveRecordToLocalStorage(record) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    if (editIndex !== null) {
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

// ✅ GAS に送信する関数
function sendToGAS(record) {
    fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify(record),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.text())
    .then(result => {
        console.log("スプレッドシート送信成功:", result);
    })
    .catch(error => {
        console.error("送信エラー:", error);
    });
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
