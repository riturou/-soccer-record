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

// ランダム練習メニュー表示
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

// 記録保存（画像をBase64形式で保存）
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

// ローカルストレージ保存処理
function saveRecordToLocalStorage(record) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.push(record);
    localStorage.setItem('records', JSON.stringify(records));

    alert("保存しました！");
    displayRecords();
    renderCalendar();
    document.getElementById('recordForm').reset();
}

// 記録を一覧で表示
function displayRecords() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    const list = document.getElementById('recordList');
    list.innerHTML = "";
    records.forEach(record => {
        let li = `<li>
            <strong>${record.date}</strong> - ${menus[record.menu].name}<br>
            ${record.memo ? "メモ: " + record.memo + "<br>" : ""}
            ${record.photoURL ? `<img src="${record.photoURL}" width="100">` : ""}
        </li>`;
        list.innerHTML += li;
    });
}

// カレンダーを表示する関数
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    const records = JSON.parse(localStorage.getItem('records')) || [];

    // 既存のカレンダーを一度初期化
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

// ページ読み込み時の初期化
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('randomMenuButton').addEventListener('click', showRandomMenu);
    displayRecords();
    renderCalendar();
});
