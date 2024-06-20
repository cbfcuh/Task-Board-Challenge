// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;
const taskNameElement = $('input[name="task-name"]');
const formElement = $('#taskForm');
const taskDueElement = $('input[name="task-due-date"]');
const taskDescriptionElement = $('input[name="task-description"]');

// Saving tasks and nextId to array of projects, stringifys them and saves them to local storage
function saveToLocalStorage(){
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Todo: create a function to generate a unique task id
function generateTaskId() {

return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
const taskCard = $('<div>').addClass('card task-card draggable my-3').attr('data-task-id', task.id);
const cardHeader = $('<div>').addClass('card-header h3').text(task.title);
const cardBody = $('<div>').addClass('card-body');
const cardDescription = $('<p>').addClass('card-text').text(task.description);
const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);

cardDeleteBtn.on('click', handleDeleteTask);

if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }
  taskCard.append(cardHeader, cardBody);
  cardBody.append(cardDeleteBtn, cardDueDate, cardDescription);
  
  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {

    if (!Array.isArray(taskList)) {
        taskList = [taskList];
        };

    const toDoList = $('#to-do-cards');
    toDoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

    for (let task of taskList) {
        if (task.status === 'to-do') {
        toDoList.append(createTaskCard(task));
         } else if (task.status === 'in-progress') {
        inProgressList.append(createTaskCard(task));
        } else if (task.status === 'done') {
        doneList.append(createTaskCard(task));
        }
    }

    $('.draggable').draggable({
     opacity: 0.7,
     zIndex: 100,
     // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
         // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
        const original = $(e.target).hasClass('ui-draggable')
         ? $(e.target)
         : $(e.target).closest('.ui-draggable');
        // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
         return original.clone().css({
          width: original.outerWidth(),
         });
     },
    });
}


// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const taskName = taskNameElement.val().trim();
    const dueDate = taskDueElement.val();
    const description = taskDescriptionElement.val();

    const newTask = {
        id: generateTaskId(),
        title: taskName,
        dueDate: dueDate,
        description: description,
        status: 'to-do'
    };

    taskList.push(newTask);

    saveToLocalStorage();

    renderTaskList();

    // Clear the form inputs
    $('input[type="text"]').val('');

}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
event.preventDefault();

const taskId = Number($(this).attr('data-task-id'));
taskList = taskList.filter(task => task.id !== taskId);
saveToLocalStorage();

renderTaskList();

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
const taskId = ui.draggable[0].dataset.taskId;
const newStatus = event.target.id;

if (newStatus === 'to-do-cards') {
    newStatus = 'to-do';
} else if (newStatus === 'in-progress-cards') {
    newStatus = 'in-progress';
} else if (newStatus === 'done-cards') {
    newStatus = 'done';
}
for (let task of taskList) {
    if (task.id == taskId){
        task.status = newStatus;
    }
}

  saveToLocalStorage();

  renderTaskList();

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    formElement.on('submit', handleAddTask);

    $('.lane').droppable({
      accept: '.draggable',
      drop: handleDrop,
    });
  
    taskDueElement.datepicker({
      changeMonth: true,
      changeYear: true,
    });
});

