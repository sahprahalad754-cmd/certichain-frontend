// =====================================================
// CertiChain - shared JavaScript (app.js)
// Used by admin pages, student pages and verify page
// =====================================================

// ---------- 1. Simple browser database (replaces MySQL for the prototype) ----------
const DB = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem("certichain_" + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    localStorage.setItem("certichain_" + key, JSON.stringify(value));
  }
};

// First time: create starting data
function seedData() {
  if (!DB.get("students", null)) {
    DB.set("students", [
      { id: "S101", name: "Prahalad Sah", roll: "2K24CSUN01189", course: "B.Tech", branch: "CSE", university: "Manav Rachna University", year: 2026, email: "prahalad@manav.edu" },
      { id: "S102", name: "Ananya Verma", roll: "2K24CSUN01201", course: "B.Tech", branch: "CSE", university: "Manav Rachna University", year: 2026, email: "ananya@manav.edu" }
    ]);
  }
  if (!DB.get("certificates", null)) DB.set("certificates", []);
  if (!DB.get("logs", null)) DB.set("logs", []);
}
seedData();

// ---------- 2. Login helpers ----------
function getUser() {
  try { return JSON.parse(sessionStorage.getItem("certichainUser")); }
  catch (e) { return null; }
}

// Used by pages inside the admin/ and student/ folders
function requireRole(role) {
  const user = getUser();
  if (!user || user.role !== role) {
    window.location.href = "../login.html";
    return null;
  }
  return user;
}

function logout() {
  sessionStorage.removeItem("certichainUser");
  window.location.href = "../index.html";
}

// ---------- 3. Admin navbar (same on every admin page) ----------
function renderAdminNav(active) {
  const user = getUser();
  const links = [
    ["dashboard.html", "Dashboard"],
    ["add-student.html", "Add Student"],
    ["issue.html", "Issue Certificate"],
    ["certificates.html", "Certificates"],
    ["../history.html", "Verification History"]
  ];
  let items = "";
  links.forEach(function (l) {
    items += '<li class="nav-item"><a class="nav-link' + (l[0] === active ? " active" : "") +
             '" href="' + l[0] + '">' + l[1] + "</a></li>";
  });
  document.getElementById("navbar").innerHTML =
    '<nav class="navbar navbar-expand-lg navbar-dark certi-nav"><div class="container">' +
    '<a class="navbar-brand fw-bold" href="dashboard.html">CertiChain</a>' +
    '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">' +
    '<span class="navbar-toggler-icon"></span></button>' +
    '<div class="collapse navbar-collapse" id="menu">' +
    '<ul class="navbar-nav me-auto">' + items + "</ul>" +
    '<span class="text-light small me-3">' + user.name + " (" + user.role + ")</span>" +
    '<button class="btn btn-outline-light btn-sm" onclick="logout()">Logout</button>' +
    "</div></div></nav>";
}

// ---------- 4. Helpers for hashing and files ----------
const ISSUER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// Real SHA-256 hash of a file (64 hex characters)
async function sha256Hex(buffer) {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash)).map(function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
}

// Creates a small sample PDF when no file is uploaded (for the demo)
function makeSamplePdf(text) {
  text = text.replace(/[()\\]/g, "");
  const pdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 300]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n" +
    "4 0 obj<</Length 200>>stream\nBT /F1 18 Tf 40 220 Td (" + text + ") Tj ET\nendstream endobj\n" +
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
  return new TextEncoder().encode(pdf).buffer;
}

// Convert file bytes to text (to save in browser) and back
function bufferToBase64(buffer) {
  let bin = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function base64ToBuffer(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// Fake blockchain transaction hash (prototype only)
function randomTxHash() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return "0x" + Array.from(a).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

function findStudent(id) {
  return DB.get("students", []).find(function (s) { return s.id === id; });
}

// ---------- 5. Student navbar (same on every student page) ----------
function renderStudentNav(active) {
  const user = getUser();
  const links = [
    ["dashboard.html", "Dashboard"],
    ["my-certificates.html", "My Certificates"],
    ["../verify.html", "Verify"]
  ];
  let items = "";
  links.forEach(function (l) {
    items += '<li class="nav-item"><a class="nav-link' + (l[0] === active ? " active" : "") +
             '" href="' + l[0] + '">' + l[1] + "</a></li>";
  });
  document.getElementById("navbar").innerHTML =
    '<nav class="navbar navbar-expand-lg navbar-dark certi-nav"><div class="container">' +
    '<a class="navbar-brand fw-bold" href="dashboard.html">CertiChain</a>' +
    '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">' +
    '<span class="navbar-toggler-icon"></span></button>' +
    '<div class="collapse navbar-collapse" id="menu">' +
    '<ul class="navbar-nav me-auto">' + items + "</ul>" +
    '<span class="text-light small me-3">' + user.name + " (" + user.role + ")</span>" +
    '<button class="btn btn-outline-light btn-sm" onclick="logout()">Logout</button>' +
    "</div></div></nav>";
}

// Finds the student record that matches the logged-in user's email
function currentStudent() {
  const user = getUser();
  return DB.get("students", []).find(function (s) { return s.email === user.email; });
}

// Certificates issued to the logged-in student
function myCertificates() {
  const st = currentStudent();
  if (!st) return [];
  return DB.get("certificates", []).filter(function (c) { return c.studentId === st.id; });
}