const addApplicationBtn = document.getElementById("addApplicationBtn");
const applicationModal = document.getElementById("applicationModal");
const closeApplicationModal = document.getElementById("closeApplicationModal");
const applicationForm = document.getElementById("applicationForm");


// ===============================
// OPEN APPLICATION MODAL
// ===============================

addApplicationBtn.addEventListener("click", async () => {

    applicationModal.classList.add("show");

    await loadCompanies();

    const selectedCompanyId =
        localStorage.getItem("selectedCompanyId");

    if (selectedCompanyId) {

        document.getElementById("companyId").value =
            selectedCompanyId;

        localStorage.removeItem("selectedCompanyId");
    }

});


// ===============================
// CLOSE MODAL
// ===============================

closeApplicationModal.addEventListener("click", () => {
    applicationModal.classList.remove("show");
});

applicationModal.addEventListener("click", (event) => {
    if (event.target === applicationModal) {
        applicationModal.classList.remove("show");
    }
});


// ===============================
// LOAD COMPANIES
// ===============================

async function loadCompanies() {

    try {

        const response = await fetch("/api/companies");
        const companies = await response.json();

        const companySelect =
            document.getElementById("companyId");

        companySelect.innerHTML =
            '<option value="">Select company</option>';

        companies.forEach(company => {

            const option =
                document.createElement("option");

            option.value = company.id;

            option.textContent =
                `${company.company_name} - ${company.job_role}`;

            companySelect.appendChild(option);
        });

    } catch (error) {

        console.error("Companies Error:", error);

    }
}


// ===============================
// ADD APPLICATION
// ===============================

applicationForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const companyId =
        document.getElementById("companyId").value;

    const applicationDate =
        document.getElementById("applicationDate").value;

    const status =
        document.getElementById("applicationStatus").value;

    const notes =
        document.getElementById("applicationNotes").value;


    try {

        const response = await fetch("/api/applications", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                user_id: 1,

                company_id: companyId,

                application_date: applicationDate,

                status: status,

                notes: notes

            })

        });


        const data = await response.json();

        const message =
            document.getElementById("applicationMessage");

        message.textContent = data.message;


        if (response.ok) {

            message.style.color = "#15803d";

            setTimeout(() => {

                applicationModal.classList.remove("show");

                applicationForm.reset();

                loadDashboard();

            }, 800);

        } else {

            message.style.color = "#b91c1c";

        }

    } catch (error) {

        console.error("Application Error:", error);

        document.getElementById(
            "applicationMessage"
        ).textContent =
            "Server error. Please try again.";

    }

});


// ===============================
// LOAD DASHBOARD DATA
// ===============================

async function loadDashboard() {

    try {

        const response =
            await fetch("/api/applications");

        const applications =
            await response.json();


        console.log("Applications:", applications);

        const appliedCount = applications.filter(
    application => application.status === "Applied"
).length;

const shortlistedCount = applications.filter(
    application => application.status === "Shortlisted"
).length;

const interviewCount = applications.filter(
    application => application.status === "Interview"
).length;

const selectedCount = applications.filter(
    application => application.status === "Selected"
).length;


document.getElementById("appliedCount").textContent =
    appliedCount;

document.getElementById("shortlistedCount").textContent =
    shortlistedCount;

document.getElementById("interviewCount").textContent =
    interviewCount;

document.getElementById("selectedCount").textContent =
    selectedCount;

        // ---------------------------
        // TOTAL APPLICATIONS
        // ---------------------------

        const applicationsCount =
            document.querySelector(
                ".dashboard-stats .dashboard-card:nth-child(2) h2"
            );

        applicationsCount.textContent =
            applications.length;


        // ---------------------------
        // INTERVIEWS
        // ---------------------------

        const interviews =
            applications.filter(
                application =>
                    application.status === "Interview"
            );

        document.querySelector(
            ".dashboard-stats .dashboard-card:nth-child(3) h2"
        ).textContent = interviews.length;


        // ---------------------------
        // SELECTED
        // ---------------------------

        const selected =
            applications.filter(
                application =>
                    application.status === "Selected"
            );

        document.querySelector(
            ".dashboard-stats .dashboard-card:nth-child(4) h2"
        ).textContent = selected.length;


        // ---------------------------
        // RECENT APPLICATIONS TABLE
        // ---------------------------

        const applicationTable =
    document.querySelector(".application-table");

const oldRows =
    applicationTable.querySelectorAll(
        ".table-row:not(.table-heading)"
    );

oldRows.forEach(row => row.remove());


applications.forEach(application => {

    const row =
        document.createElement("div");

    row.className = "table-row";


    let statusClass = "applied-status";

    if (application.status === "Interview") {
        statusClass = "interview-status";
    }

    if (application.status === "Selected") {
        statusClass = "selected-status";
    }

    if (application.status === "Rejected") {
        statusClass = "rejected-status";
    }

    if (application.status === "Shortlisted") {
        statusClass = "shortlisted-status";
    }


    row.innerHTML = `

        <span class="company-name">
            ${application.company_name}
        </span>

        <span>
            ${application.job_role}
        </span>

        <span>
            ${application.application_date || "-"}
        </span>

        <span class="status ${statusClass}">
            ${application.status}
        </span>

    `;


    applicationTable.appendChild(row);

});


    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}


// ===============================
// START DASHBOARD
// ===============================

// ===============================
// DYNAMIC GREETING
// ===============================

function updateGreeting() {

    const hour = new Date().getHours();

    const greeting =
        document.getElementById("greeting");

    if (hour >= 5 && hour < 12) {

        greeting.textContent =
            "Good morning! 👋";

    } else if (hour >= 12 && hour < 17) {

        greeting.textContent =
            "Good afternoon! 👋";

    } else {

        greeting.textContent =
            "Good evening! 👋";

    }

}

updateGreeting();

loadDashboard();

// ===============================
// LOAD USER NAME
// ===============================

function loadUserName() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        document.getElementById("userName").textContent = user.name;
    }

}

loadUserName();

// ===============================
// LOGOUT
// ===============================

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", (event) => {

    event.preventDefault();

    localStorage.removeItem("user");

    window.location.href = "login.html";

});