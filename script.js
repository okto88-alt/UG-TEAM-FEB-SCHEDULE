/* ======================================
   SHIFT STAFF LIST
====================================== */
const shiftPagi = [
  "Chandy", "Kenny", "Anggie", "Andi",
  "Firman", "Nibras", "Angga", "Jerry"
];

const shiftMalam = [
  "Vindy", "Kris", "Heno", "Dea",
  "Alfan", "Valvi", "Kheiren", "Sindy"
];

/* ======================================
   RENDER SHIFT LIST (SIDEBAR)
====================================== */
const shiftPagiEl = document.getElementById("shiftPagi");
const shiftMalamEl = document.getElementById("shiftMalam");

function renderShiftList() {
  shiftPagiEl.innerHTML = "";
  shiftMalamEl.innerHTML = "";

  shiftPagi.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    shiftPagiEl.appendChild(li);
  });

  shiftMalam.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    shiftMalamEl.appendChild(li);
  });
}


/* ======================================
   SCHEDULE DATA
   index 0 = pagi
   index 1 = malam
====================================== */
const scheduleData = [
  {
    date: "21-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Heno"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Valvi"],
    HAHAWIN88: ["Andi, Anggie", "Heno, Alfan"],
    OFFDAY: ["Chandy", "Vindy"]
  },
  {
    date: "22-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Heno"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Valvi"],
    HAHAWIN88: ["Andi, Anggie", "Heno, Alfan"],
    OFFDAY: ["Kenny", "Kris"]
  },
  {
    date: "23-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Valvi"],
    VIOBET: ["Anggie", "Vindy"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Kris"],
    HAHAWIN88: ["Kenny", "Valvi, Alfan"],
    OFFDAY: ["Heno", "Sindy"]
  },
  {
    date: "24-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Heno"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Kenny", "Valvi"],
    IJOBET: ["Jerry", "Kris"],
    HAHAWIN88: ["Andi, Anggie", "Heno, Alfan"],
    OFFDAY: ["Angga", "Kheiren"]
  },
  {
    date: "25-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Kenny", "Sindy"],
    VIOBET: ["Chandy", "Heno"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Kris"],
    HAHAWIN88: ["Kenny, Firman", "Heno, Alfan"],
    OFFDAY: ["Anggie", "Valvi"]
  },
  {
    date: "26-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Heno"],
    TEMPO88: ["Kenny", "Valvi"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Kris"],
    HAHAWIN88: ["Andi, Anggie", "Heno, Valvi"],
    OFFDAY: ["Firman", "Alfan"]
  },
  {
    date: "27-Dec-2025",
    SURIA88: ["Kenny", "Valvi"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Heno"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Kris"],
    HAHAWIN88: ["Andi, Anggie", "Heno, Alfan"],
    OFFDAY: ["Nibras", "Dea"]
  },
  {
    date: "28-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Heno"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Valvi"],
    HAHAWIN88: ["Kenny", "Heno, Alfan"],
    OFFDAY: ["Vindy"]
  },
  {
    date: "29-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Vindy"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Valvi"],
    HAHAWIN88: ["Kenny", "Heno, Alfan"],
    OFFDAY: ["Kris", "Sindy"]
  },
  {
    date: "30-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Vindy"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Kris"],
    HAHAWIN88: ["Andi, Anggie", "Alfan, Kheiren"],
    OFFDAY: ["Chandy", "Heno", "Valvi"]
  },
  {
    date: "31-Dec-2025",
    SURIA88: ["Nibras", "Dea"],
    HAKABET: ["Andi", "Sindy"],
    VIOBET: ["Anggie", "Heno"],
    TEMPO88: ["Firman", "Alfan"],
    FILA88: ["Angga", "Kheiren"],
    IJOBET: ["Jerry", "Kris"],
    HAHAWIN88: ["Kenny", "Valvi"],
    OFFDAY: []
  }
];


/* ======================================
   RENDER TABLE
====================================== */
const tbody = document.getElementById("scheduleBody");
const searchInput = document.getElementById("searchInput");

function renderTable(data) {
  tbody.innerHTML = "";

  data.forEach(day => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${day.date}</td>
      <td>${day.SURIA88.join("<br><br>")}</td>
      <td>${day.HAKABET.join("<br><br>")}</td>
      <td>${day.VIOBET.join("<br><br>")}</td>
      <td>${day.TEMPO88.join("<br><br>")}</td>
      <td>${day.FILA88.join("<br><br>")}</td>
      <td>${day.IJOBET.join("<br><br>")}</td>
      <td>${day.HAHAWIN88.join("<br><br>")}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* ======================================
   SEARCH STAFF NAME
====================================== */
function searchStaff(keyword) {
  if (!keyword) {
    renderTable(scheduleData);
    return;
  }

  const result = [];

  scheduleData.forEach(day => {
    Object.keys(day).forEach(key => {
      if (key === "date") return;

      day[key].forEach(name => {
        if (name.toLowerCase().includes(keyword.toLowerCase())) {
          result.push({
            date: day.date,
            web: key,
            name: name
          });
        }
      });
    });
  });

  tbody.innerHTML = "";

  result.forEach(item => {
    const tr = document.createElement("tr");
tr.innerHTML = `
  <td>${day.date}</td>
  <td>${formatShift(day.SURIA88)}</td>
  <td>${formatShift(day.HAKABET)}</td>
  <td>${formatShift(day.VIOBET)}</td>
  <td>${formatShift(day.TEMPO88)}</td>
  <td>${formatShift(day.FILA88)}</td>
  <td>${formatShift(day.IJOBET)}</td>
  <td>${formatShift(day.HAHAWIN88)}</td>
  <td>${day.OFFDAY.length ? formatShift(day.OFFDAY) : "-"}</td>
`;

    tbody.appendChild(tr);
  });
}

/* ======================================
   EVENT LISTENER
====================================== */
searchInput.addEventListener("input", e => {
  searchStaff(e.target.value.trim());
});

/* ======================================
   INIT
====================================== */
renderShiftList();
renderTable(scheduleData);

