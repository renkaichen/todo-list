let taskList = [];
let catList = [];
let current = "all";



function restore() {
    if(localStorage.getItem("taskList") == undefined) {
        localStorage.setItem("taskList", JSON.stringify(taskList));
    } else {
        taskList = JSON.parse(localStorage.getItem("taskList"));
    }

    if(localStorage.getItem("catList") == undefined) {
        localStorage.setItem("catList", JSON.stringify(catList));
    } else {
        catList = JSON.parse(localStorage.getItem("catList"));
        catList.forEach((cat) => generateCat(cat));
    }

    if(localStorage.getItem("current") == undefined) {
        localStorage.setItem("current", "all");
    } else {
        current = localStorage.getItem("current");
        if (current == "all") {
            document.getElementById("all").dataset.active = true;
        } else {
            Array.from(document.getElementById("buttons").children).forEach((child) => {
                if (child.textContent == current) {
                    child.dataset.active = true;
                } else {
                    child.dataset.active = false;
                }
            });
        }
    }
    if (current == "all") {
        repopulate();
    } else {
        clearShownTasks();
        catList.forEach((cat) => {
            if (cat.name == current) {
                filter(cat);
            }
        })
    }
}


function initialize() {
    const title = document.createElement("h1");
    title.textContent = "To-do List";
    title.setAttribute("id", "title");

    const buttons = document.createElement("div");
    buttons.setAttribute("id", "buttons");

    const allCategory = document.createElement("button");
    allCategory.setAttribute("id", "all");
    allCategory.textContent = "All";
    allCategory.dataset.active = true;
    allCategory.addEventListener("click", () => {
        clearShownTasks();
        repopulate();
        Array.from(buttons.children).forEach((cat) => {
            cat.dataset.active = false;
        })
        allCategory.dataset.active = true;
        current = "all";
        localStorage.setItem("current", current);
    });
    buttons.appendChild(allCategory);

    const newCategory = document.createElement("button");
    newCategory.setAttribute("id", "newCategory");
    newCategory.textContent = "New Category";
    buttons.appendChild(newCategory);
    const catDialog = setupCatDialog();
    newCategory.addEventListener("click", () => catDialog.showModal());

    const taskHolder = document.createElement("div");
    taskHolder.setAttribute("id", "taskHolder");

    const addTask = document.createElement("div");
    addTask.setAttribute("id", "addTask");
    addTask.textContent = "New Task";
    taskHolder.appendChild(addTask);
    const taskDialog = setupTaskDialog();
    addTask.addEventListener("click", () => taskDialog.showModal());


    const content = document.getElementById("content");
    content.append(title, buttons, taskHolder, catDialog, taskDialog);

    restore();
}

function generateCat(cat) {
    const newCat = document.createElement("button");
    const newCategory = document.getElementById("newCategory");
    newCat.dataset.index = catList.indexOf(cat);
    newCat.dataset.active = false;
    newCat.textContent = cat.name;
    addCatOption(cat);

    newCat.addEventListener("click", () => {
        filter(cat);
        const buttons = document.getElementById("buttons");
        Array.from(buttons.children).forEach((cat) => {
            cat.dataset.active = false;
        })
        newCat.dataset.active = true;
        current = `${cat.name}`;
        localStorage.setItem("current", current);
    })

    const buttons = document.getElementById("buttons");
    buttons.insertBefore(newCat, newCategory);
}

function addCatOption(cat) {
    const taskForm = document.getElementById("taskForm");
    const buttons = taskForm.lastChild;

    const catOption = document.createElement("input");
    catOption.type = "checkbox";
    catOption.setAttribute("name", "taskCat");
    catOption.setAttribute("id", `${cat.name}`);
    catOption.setAttribute("value", `${cat.name}`);

    const catLabel = document.createElement("label");
    catLabel.textContent = `${cat.name}`;
    catLabel.setAttribute("for",`${cat.name}`);

    const div = document.createElement("div");
    div.append(catOption, catLabel);

    taskForm.insertBefore(div, buttons);
}

function generateTask(task) {
    const newTask = document.createElement("div");
    newTask.dataset.index = taskList.indexOf(task);

    const title = document.createElement("h2");
    title.textContent = task.title;

    const desc = document.createElement("p");
    desc.textContent = task.description;

    const dueDate = document.createElement("h3");
    dueDate.textContent = task.dueDate;

    const deleteButton = document.createElement("div");
    deleteButton.classList.add("deleteButton");
    deleteButton.addEventListener("click", () => {
        deleteTask(newTask.dataset.index);
    });

    const taskHolder = document.getElementById("taskHolder");
    const addTask = taskHolder.lastChild;
    
    newTask.append(title, desc, dueDate, deleteButton);
    taskHolder.insertBefore(newTask, addTask);

}

function createCat(name) {
    return {name};
}

function createTask(title, dueDate, description, catList = []) {
    return {title, dueDate, description, catList};
}

function createDialog() {
    const dialog = document.createElement("dialog");

    const form = document.createElement("form");

    dialog.appendChild(form);

    const closeButton = document.createElement("button");
    closeButton.classList.add("closeButton");
    closeButton.textContent = "Cancel";
    closeButton.addEventListener("click", (event) => {
        event.preventDefault();
        form.reset();
        dialog.close()});
    const submitButton = document.createElement("button");
    submitButton.classList.add("submitButton");
    submitButton.setAttribute("type", "submit");
    submitButton.textContent = "Create";

    const formButtons = document.createElement("div");
    formButtons.setAttribute("id", "formButtons");
    formButtons.appendChild(closeButton);
    formButtons.appendChild(submitButton);

    form.appendChild(formButtons);
  
    return dialog;
}

function setupTaskDialog() {
    const taskDialog = createDialog();
    const form = taskDialog.firstChild;
    form.setAttribute("id", "taskForm");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        var newTask = null;
        var formData = new FormData(form);
        var formProps = Object.fromEntries(formData);
        if (catList.length != 0) {
            const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
            var values = [];
            checkboxes.forEach((checkbox) => {
                values.push(checkbox.value);
            });
            newTask = createTask(formProps.taskTitle, formProps.taskDate, formProps.taskDesc, values);
            console.log(newTask);
        } else {
            newTask = createTask(formProps.taskTitle, formProps.taskDate, formProps.taskDesc);
        }
        taskList.push(newTask);
        localStorage.setItem("taskList", JSON.stringify(taskList));
        generateTask(newTask);
        if (!newTask.catList.includes(current)) {
            document.getElementById("all").click();
        }
        form.reset();
        taskDialog.close();
    });

    const taskTitle = document.createElement("input");
    taskTitle.type = "text";
    taskTitle.name = "taskTitle";
    taskTitle.setAttribute("id", "taskTitle");
    taskTitle.setAttribute("required", "true");

    const taskDate = document.createElement("input");
    taskDate.type = "date";
    taskDate.name = "taskDate";
    taskDate.setAttribute("id", "taskDate");

    const taskDesc = document.createElement("textarea");
    taskDesc.name = "taskDesc";
    taskDesc.setAttribute("id", "taskDesc");

    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Task Title";
    titleLabel.setAttribute("for", "taskTitle");

    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Due Date";
    dateLabel.setAttribute("for", "taskDate");

    const descLabel = document.createElement("label");
    descLabel.textContent = "Description";
    descLabel.setAttribute("for", "taskDesc");

    form.prepend(titleLabel, taskTitle, dateLabel, taskDate, descLabel, taskDesc);
    return taskDialog;
}

function setupCatDialog() {
    const catDialog = createDialog();
    const form = catDialog.firstChild;

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        var formData = new FormData(form);
        var formProps = Object.fromEntries(formData);
        const newCat = createCat(formProps.catName);
        catList.push(newCat);
        localStorage.setItem("catList", JSON.stringify(catList));
        console.log(localStorage.getItem("catList"));
        generateCat(newCat);
        form.reset();
        catDialog.close();
    });

    const catName = document.createElement("input");
    catName.type = "text";
    catName.name = "catName";
    catName.setAttribute("id", "catName");
    catName.setAttribute("required", "true");

    const label = document.createElement("label");
    label.textContent = "Category Name";
    label.setAttribute("for", "catName");
    form.prepend(label, catName);

    return catDialog;
}

function clearShownTasks() {
    const taskHolder = document.getElementById("taskHolder");
    const addTask = document.getElementById("addTask");
    taskHolder.innerHTML = "";
    taskHolder.appendChild(addTask);
}

function repopulate() {
    const taskHolder = document.getElementById("taskHolder");
    const addTask = document.getElementById("addTask");
    taskList.forEach((task) => {
        if (task != null) {
            generateTask(task);
        }
    })

    taskHolder.appendChild(addTask);
}

function filter(cat) {
    clearShownTasks();
    const filteredTasks = taskList.filter(function(e) {
        return e.catList.includes(cat.name);
    });
    filteredTasks.forEach((task) => {
        generateTask(task);
    });
}

function deleteTask(index) {
    taskList.splice(index, 1);
    reassignIndexes(index);
    localStorage.setItem("taskList", JSON.stringify(taskList));
    clearShownTasks();
    if (current != "all") {
        catList.forEach((cat) => {
            if (cat.name == current) {
                filter(cat);
            }
        })
    } else {
        repopulate();
    }
    
}

function reassignIndexes(index) {
    const taskHolder = document.getElementById("taskHolder");
    Array.from(taskHolder.children).forEach((child) => {
        if (child.dataset.index > index) {
            child.dataset.index--;
        }
    });
}

export default initialize;