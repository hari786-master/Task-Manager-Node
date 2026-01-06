loadTask();

$("#createAccBtn").click(() => {
    emptyInputField()
    $("#loginBox").css({ display: "none" });
    $("#signUpBox").css({ display: "block" });
})

$("#backToLoginBtn").click(() => {
    emptyInputField();
    $("#signUpBox").css({ display: "none" });
    $("#loginBox").css({ display: "block" });
})

let oldTitle, oldDec, oldDate, oldPriority, currendSelectedTaskBox;
// Sign Up 
$("#signUpSubmit").click(() => {
    const name = $("#accName").val().trim();
    const email = $("#email").val().trim();
    const password = $("#signUpPinNum").val().trim();
    let isValid = true;
    if (name == "") {
        $("#nameBox").css({ borderColor: "red" })
        isValid = false;
    } else {
        $("#nameBox").css({ borderColor: "#c2c4c9" })
    }
    if (email == "") {
        $("#emailBox").css({ borderColor: "red" })
        isValid = false;
    } else {
        $("#emailBox").css({ borderColor: "#c2c4c9" })
    }

    if (password == "") {
        $("#passwordBox").css({ borderColor: "red" })
        isValid = false;
    } else {
        $("#passwordBox").css({ borderColor: "#c2c4c9" })
    }
    if (isValid) {
        putData(name, email, password);
    }
})

async function putData(name, email, password) {
    let response = await fetch("/userSignUp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (data.message == "User Added Successfully") {
        $(".signUpMessage").html("Account created successfully!");
        $(".signUpMessage").css({ display: "block", background: "rgba(20, 218, 152, 0.5)" });
        setTimeout(() => {
            $(".signUpMessage").css({ display: "none" });
        }, 3000);
        emptyInputField();
    } else if (data.message == "User Already Exist") {
        $(".signUpMessage").html("Account Already Exist");
        $(".signUpMessage").css({ display: "block", background: "rgba(218, 20, 20, 0.5)", color: "black" });
        setTimeout(() => {
            $(".signUpMessage").css({ display: "none" });
        }, 3000);
    } else if (data.message == "Invalid Email") {
        console.log("Invalid Email");
        $(".signUpMessage").html("Invalid Email ID");
        $(".signUpMessage").css({ display: "block", background: "rgba(218, 20, 20, 0.5)", color: "black" });
        setTimeout(() => {
            $(".signUpMessage").css({ display: "none" });
        }, 3000);
    } else if (data.message == "Create Strong Password") {
        $(".signUpMessage").html("Create Strong Password");
        $(".signUpMessage").css({ display: "block", background: "rgba(218, 20, 20, 0.5)", color: "black" });
        setTimeout(() => {
            $(".signUpMessage").css({ display: "none" });
        }, 3000);
    }
}

// Login

$("#signInBtn").click(() => {
    let email = $("#accNum").val();
    let password = $("#signInPinNum").val();
    let isValid = true;

    if (email == "") {
        $("#loginMail").css({ borderColor: "red" })
        isValid = false;
    } else {
        $("#loginMail").css({ borderColor: "#c2c4c9" })
    }

    if (password == "") {
        $("#loginPass").css({ borderColor: "red" })
        isValid = false;
    } else {
        $("#loginPass").css({ borderColor: "#c2c4c9" })
    }
    if (isValid) {
        console.log("valid");
        getData(email, password);
    }
})

let currentUser;

async function getData(email, password) {
    let response = await fetch("/userLogin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    let data = await response.json();
    console.log(data.message);
    if (data.message == "User Account Exist") {
        console.log("Home start");
        window.location.href = "home";
        loadTask();
    }
}

$(".close-btn").click(() => {
    $("#addTaskModal").css({ display: "none" })
    $("#createTaskBtn").text("Create Task");
})

$(".btn-cancel").click(() => {
    $("#createTaskBtn").text("Create Task");
    $("#addTaskModal").css({ display: "none" })
})

$(".addBtn").click(() => {
    emptyInputField();
    $("#addTaskModal").css({ display: "flex" })
})

$("#createTaskBtn").click(() => {
    let title = $("#newTaskTitle").val();
    let dec = $("#newTaskDescription").val();
    let date = $("#newTaskDueDate").val();
    let priority = $("#newTaskPriority").val();
    if (title.length > 25) {
        $("#notification").html(`<i class="fas fa-exclamation-circle"></i>Title Length Must be Less Than 26 Charecters`);
        $("#notification").css({ display: "flex" });
        setTimeout(() => {
            $("#notification").css({ display: "none" });
        }, 3000);
    } else if (title.trim() != "") {
        console.log($("#createTaskBtn").text());
        if ($("#createTaskBtn").text().trim() == "Create Task") {
            addTask(currentUser, title, dec, date, priority.toUpperCase());
        } else {
            updateTask(title, dec, date, priority, oldTitle);
            $("#createTaskBtn").text("Create Task");
        }
        $("#addTaskModal").css({ display: "none" })
    } else {
        $("#notification").html(`<i class="fas fa-exclamation-circle"></i><span id="notificationText">Please enter a task title</span>`)
        $("#notification").css({ display: "flex" });
        setTimeout(() => {
            $("#notification").css({ display: "none" });
        }, 3000);
    }
});


async function updateTask(title, dec, date, priority, oldTitle) {
    let response = await fetch("/updateTask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, dec, date, priority, oldTitle })
    })
    let datas = await response.json();
    if (datas.message == "Task Updated Sucessfully") {
        currendSelectedTaskBox.querySelector("#title").innerText = title;
        currendSelectedTaskBox.querySelector(".notebook-date").innerHTML = `<i class="fas fa-calendar"></i> Due: ${date || "No due date"}`;
        currendSelectedTaskBox.querySelector(".notebook-priority").innerText = priority.toUpperCase();
        currendSelectedTaskBox.querySelector(".notebook-priority").className = `notebook-priority priority-${priority}`;
        currendSelectedTaskBox.querySelector(".notebook-description").innerHTML = `${dec || "No description provided"}`;
    } else if (datas.message == "Task Already Exist") {
        $("#notification").html(`<i class="fas fa-exclamation-circle"></i>Task Already Exist`);
        $("#notification").css({ display: "flex" });
        setTimeout(() => {
            $("#notification").css({ display: "none" });
        }, 3000);
    }
}


function createTaskBox(title, dec, date, priority, isCompleted = 0, time = "Recently") {
    console.log(priority);
    const card = document.createElement("div");
    card.className = "notebook-card";

    card.innerHTML = `
    <div class="notebook-header">
        <div>
            <div class="notebook-title" id="title">
                ${title}
            </div>
            <div class="notebook-date">
                <i class="fas fa-calendar"></i> Due: ${date || "No due date"}
            </div>
        </div>
        <div class="editPlace flex">
        <span class="notebook-priority priority-${priority.toLowerCase()}">
            ${priority}
        </span>
        <i class="fa-solid fa-pen-to-square"></i>
        </div>
    </div>

    <hr class="notebook-divider">

    <div class="notebook-description" id="desc">
        ${dec || "No description provided"}
    </div>

    <hr class="notebook-divider">

    <div class="notebook-footer">
        <div class="notebook-completed-date" style="display:none">
            <i class="fas fa-check-circle"></i> Completed: ${time}
        </div>

        <div class="notebook-actions">
            <button class="notebook-btn notebook-reactivate" id="reactivate">
                <i class="fas fa-check"></i> Complete
            </button>

            <button class="notebook-btn notebook-delete" id="delete">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    </div>
`;

    if (isCompleted === 1) {
        card.querySelector(".notebook-reactivate").innerHTML = `<i class="fas fa-undo"></i> Reactivate`
        card.classList.add("completed");
        card.querySelector(".notebook-title").classList.add("strike");
        card.querySelector(".notebook-description").classList.add("strike");
        card.querySelector(".notebook-completed-date").style.display = "block";
    }
    $(".notebook-container").append(card);
}

async function addTask(email, title, dec, date, priority) {
    let response = await fetch("/addTask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, dec, date, priority })
    })
    let data = await response.json();

    if (data.message == "Task Inserted Sucessfully") {
        $(".emptyState").css({ display: "none" })
        createTaskBox(title, dec, date, priority);
    } else if (data.message == "Task Already Exist") {
        $("#notification").html(`<i class="fas fa-exclamation-circle"></i>Task Already Exist`);
        $("#notification").css({ display: "flex" });
        setTimeout(() => {
            $("#notification").css({ display: "none" });
        }, 3000);
    } else {
        console.log(data.error);
    }
}


async function loadTask() {
    let response = await fetch("/loadUserTask");
    let data = await response.json();
    setStatistic(data.result);
    if (data.result.length == 0) {
        $(".emptyState").css({ display: "block" })
    } else {
        $(".emptyState").css({ display: "none" })
    }
    for (let task of data.result) {
        createTaskBox(task.TaskName, task.Description, task.Date, task.Priority, task.IsCompleted, task.Time)
    }
    $(".name").text("Hello, " + data.name[0].UserName);
}

document.addEventListener("click", function(e) {
    const completeBtn = e.target.closest(".notebook-reactivate");
    if (completeBtn) {
        let time = new Date(Date.now()).toLocaleString();
        const card = e.target.closest(".notebook-card");
        let title = card.querySelector(".notebook-title")
        title.classList.toggle("strike");
        card.querySelector(".notebook-description").classList.toggle("strike");
        if (completeBtn.innerText == "Complete") {
            completeBtn.innerHTML = `<i class="fas fa-undo"></i> Reactivate`
            card.querySelector(".notebook-completed-date").innerHTML = `<i class="fas fa-check-circle"></i> Completed: ${time}`
            card.querySelector(".notebook-completed-date").style.display = "block";
            completeTask(title.innerText.trim(), time);
        } else {
            reActiveTask(title.innerText.trim());
            completeBtn.innerHTML = `<i class="fas fa-check" aria-hidden="true"></i> Complete`
            card.querySelector(".notebook-completed-date").style.display = "none";
        }
    }
    const deleteBtn = e.target.closest(".notebook-delete");
    if (deleteBtn) {
        let card = e.target.closest(".notebook-card")
        card.remove();
        if ($(".notebook-container")[0].children.length == 4) {
            $(".emptyState").css({ display: "block" })
        };
        deleteTask(card.querySelector(".notebook-title").innerText.trim());
    }
    let pop = document.querySelector(".pop-up-box");
    if (e.target.className != "user" && e.target.className != "fas fa-user" && e.target.className != "pop-up-box" && e.target.className != "name" && window.location.href != "http://localhost:3000/") {
        pop.style.display = "none";
    }

    const editBtn = e.target.closest(".editPlace");
    if (editBtn) {
        emptyInputField();
        let card = e.target.closest(".notebook-card");
        $("#addTaskModal").css({ display: "flex" });
        $("#createTaskBtn").text("Save");
        currendSelectedTaskBox = card;
        oldTitle = card.querySelector("#title").innerText.trim();
        oldDec = card.querySelector("#desc").innerText.trim();
        oldDate = card.querySelector(".notebook-date").innerText.slice(5, ).trim();
        oldPriority = card.querySelector(".notebook-priority").innerText.trim().toLowerCase();
        $("#newTaskTitle").val(oldTitle);
        if (oldDec != "No description provided")
            $("#newTaskDescription").val(oldDec);
        $("#newTaskPriority").val(oldPriority);
        if (oldDate != "No due date")
            $("#newTaskDueDate").val(oldDate);
    }
})

async function completeTask(title, time) {
    let response = await fetch("/completeTask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, time })
    });
    let data = response.json();
}


async function reActiveTask(title) {
    let response = await fetch("/reActiveTask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
    });
    let data = response.json();
}



async function deleteTask(title) {
    let response = await fetch("/deleteTask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
    });
    let data = await response.json();
    console.log(data);
}


$("#userMenuToggle").click(() => {
    $(".pop-up-box").css({ display: "block" })
})

$(".logout").click(async() => {
    let response = await fetch("/logout");
    let data = await response.json();
    console.log(data.message);
    if (data.message == "Account Logouted Sucessfully") {
        location.href = "/"
    }
})

function emptyInputField() {
    $("input").val("");
    $("textArea").val("");
}


function setStatistic(result) {
    let pending = 0;
    let completed = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    console.log(result);
    result.forEach(e => {
        e.IsCompleted == 0 ? pending++ : completed++;
        if (e.Priority == "HIGH") high++
            else if (e.Priority == "MEDIUM") medium++
                else if (e.Priority == "LOW") low++
    });
    const completedPercentage = (completed / result.length) * 100;
    const pendingPercentage = (pending / result.length) * 100;
    const highPercentage = (high / result.length) * 100;
    const mediumPercentage = (medium / result.length) * 100;
    const lowPercentage = (low / result.length) * 100;
    $(".completedProgressBar").css({ width: `${completedPercentage}%` })
    $(".pendingProgressBar").css({ width: `${pendingPercentage}%` })
    $(".highPriorityCount").css({ width: `${highPercentage}%` })
    $(".mediumPriorityCount").css({ width: `${mediumPercentage}%` })
    $(".lowPriorityCount").css({ width: `${lowPercentage}%` })
    $(".totalTaskCount").text(result.length);
    $(".completedTaskCount").text(completed);
    $(".pendingTaskCount").text(pending);
    $(".highTaskCount").text(high);
    $(".mediumTaskCount").text(medium);
    $(".lowTaskCount").text(low);
    if (window.location.href == "http://localhost:3000/statistics") {

        const bars = $(".barChartDiagram");
        new Chart(bars, {
            type: 'bar',
            data: {
                labels: ['All Tasks', 'Completed', 'Pending'],
                datasets: [{
                    data: [result.length, completed, pending],
                    backgroundColor: ['#4a6bdf', '#2ecc71', '#f39c12'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });


        const don = $('.priorityChart');

        new Chart(don, {
            type: 'doughnut',
            data: {
                labels: ['High Priority', 'Medium Priority', 'Low Priority'],
                datasets: [{
                    data: [high, medium, low],
                    backgroundColor: [
                        '#e74c3c',
                        '#f39c12',
                        '#2ecc71'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });



    }
}