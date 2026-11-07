
const form = document.getElementById("applicationForm");

const applicationList =
    document.getElementById("applicationList");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const submitBtn =
    document.getElementById("submitBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

let applications =
    JSON.parse(localStorage.getItem("jobApplications")) || [];

let editingId = null;


// Save applications in Local Storage
function saveApplications() {
    localStorage.setItem(
        "jobApplications",
        JSON.stringify(applications)
    );
}


// Update dashboard statistics
function updateStats() {

    document.getElementById("totalCount").textContent =
        applications.length;

    document.getElementById("appliedCount").textContent =
        applications.filter(app =>
            app.status === "Applied"
        ).length;

    document.getElementById("interviewCount").textContent =
        applications.filter(app =>
            app.status === "Interview"
        ).length;

    document.getElementById("selectedCount").textContent =
        applications.filter(app =>
            app.status === "Selected"
        ).length;
}


// Reset the form
function resetForm() {

    form.reset();

    editingId = null;

    document.getElementById("applicationDate").value =
        new Date().toISOString().slice(0, 10);

    document.getElementById("formTitle").textContent =
        "Add Job Application";

    submitBtn.textContent = "Add Application";

    cancelEditBtn.hidden = true;
}


// Add or update an application
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const company =
        document.getElementById("company").value.trim();

    const role =
        document.getElementById("role").value.trim();

    const applicationDate =
        document.getElementById("applicationDate").value;

    const interviewDate =
        document.getElementById("interviewDate").value;

    const status =
        document.getElementById("status").value;

    const link =
        document.getElementById("link").value.trim();

    if (!company || !role || !applicationDate) {
        alert("Please complete the required fields.");
        return;
    }

    if (interviewDate && interviewDate < applicationDate) {
        alert("Interview date cannot be earlier than application date.");
        return;
    }

    const applicationData = {
        id: editingId || Date.now(),
        company: company,
        role: role,
        applicationDate: applicationDate,
        interviewDate: interviewDate,
        status: status,
        link: link
    };

    if (editingId !== null) {

        applications = applications.map(app =>
            app.id === editingId ? applicationData : app
        );

    } else {

        applications.push(applicationData);

    }

    saveApplications();

    resetForm();

    renderApp();
});


// Display applications
function renderApplications() {

    applicationList.innerHTML = "";

    const searchTerm =
        searchInput.value.trim().toLowerCase();

    const selectedStatus = statusFilter.value;

    const filtered = applications.filter(app => {

        const matchesSearch =
            app.company.toLowerCase().includes(searchTerm) ||
            app.role.toLowerCase().includes(searchTerm);

        const matchesStatus =
            selectedStatus === "All" ||
            app.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {

        applicationList.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    No matching applications found.
                </td>
            </tr>
        `;

        return;
    }

    filtered.sort((a, b) =>
        b.applicationDate.localeCompare(a.applicationDate)
    );

    filtered.forEach(app => {

        const row = document.createElement("tr");

        const companyCell = document.createElement("td");
        companyCell.textContent = app.company;

        const roleCell = document.createElement("td");
        roleCell.textContent = app.role;

        const appliedCell = document.createElement("td");
        appliedCell.textContent = app.applicationDate;

        const interviewCell = document.createElement("td");
        interviewCell.textContent =
            app.interviewDate || "Not scheduled";

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.textContent = app.status;

        statusBadge.className =
            "status status-" + app.status.toLowerCase();

        statusCell.appendChild(statusBadge);

        const linkCell = document.createElement("td");

        if (app.link) {

            const link = document.createElement("a");

            link.href = app.link;
            link.textContent = "View Job";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "job-link";

            linkCell.appendChild(link);

        } else {

            linkCell.textContent = "—";

        }

        const actionsCell = document.createElement("td");

        const actions = document.createElement("div");

        actions.className = "action-buttons";

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", function() {
            editApplication(app.id);
        });

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            deleteApplication(app.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        actionsCell.appendChild(actions);

        row.appendChild(companyCell);
        row.appendChild(roleCell);
        row.appendChild(appliedCell);
        row.appendChild(interviewCell);
        row.appendChild(statusCell);
        row.appendChild(linkCell);
        row.appendChild(actionsCell);

        applicationList.appendChild(row);
    });
}


// Edit an application
function editApplication(id) {

    const app = applications.find(item => item.id === id);

    if (!app) return;

    editingId = id;

    document.getElementById("company").value = app.company;
    document.getElementById("role").value = app.role;

    document.getElementById("applicationDate").value =
        app.applicationDate;

    document.getElementById("interviewDate").value =
        app.interviewDate;

    document.getElementById("status").value =
        app.status;

    document.getElementById("link").value =
        app.link;

    document.getElementById("formTitle").textContent =
        "Edit Job Application";

    submitBtn.textContent = "Update Application";

    cancelEditBtn.hidden = false;

    document.getElementById("formTitle").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// Delete an application
function deleteApplication(id) {

    if (!confirm("Are you sure you want to delete this application?")) {
        return;
    }

    applications = applications.filter(
        app => app.id !== id
    );

    if (editingId === id) {
        resetForm();
    }

    saveApplications();

    renderApp();
}


// Cancel editing
cancelEditBtn.addEventListener("click", resetForm);


// Search applications
searchInput.addEventListener("input", renderApplications);


// Filter applications
statusFilter.addEventListener("change", renderApplications);


// Refresh the application
function renderApp() {

    updateStats();

    renderApplications();
}


// Load saved applications when the page opens
renderApp();
