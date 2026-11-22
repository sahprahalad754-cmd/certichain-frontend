// Demo users (later this will come from the Spring Boot backend)
const USERS = [
  { email: "admin@manav.edu",     password: "admin123",   role: "ADMIN",    name: "University Admin" },
  { email: "prahalad@manav.edu",  password: "student123", role: "STUDENT",  name: "Prahalad Sah" },
  { email: "recruiter@corp.com",  password: "verify123",  role: "VERIFIER", name: "Recruiter HR" }
];

// Where each role goes after login (these pages we will build in next steps)
const HOME_PAGE = {
  ADMIN: "admin/dashboard.html",
  STUDENT: "student/dashboard.html",
  VERIFIER: "verify.html"
};

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const alertBox = document.getElementById("alertBox");

// Fill demo account when a demo button is clicked
document.querySelectorAll(".demo-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    emailInput.value = btn.dataset.email;
    passInput.value = btn.dataset.pass;
  });
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  alertBox.innerHTML = "";

  // 1. Validation
  const emailOk = /^\S+@\S+\.\S+$/.test(emailInput.value.trim());
  const passOk = passInput.value.length >= 6;
  emailInput.classList.toggle("is-invalid", !emailOk);
  passInput.classList.toggle("is-invalid", !passOk);
  if (!emailOk || !passOk) return;

  // 2. Check user
  const user = USERS.find(function (u) {
    return u.email === emailInput.value.trim().toLowerCase() && u.password === passInput.value;
  });

  if (!user) {
    alertBox.innerHTML = '<div class="alert alert-danger">Wrong email or password.</div>';
    return;
  }

  // 3. Save logged-in user in the browser and go to the right page
  sessionStorage.setItem("certichainUser", JSON.stringify(user));
  alertBox.innerHTML = '<div class="alert alert-success">Login successful as ' + user.role + '. Redirecting...</div>';
  setTimeout(function () { window.location.href = HOME_PAGE[user.role]; }, 1200);
});