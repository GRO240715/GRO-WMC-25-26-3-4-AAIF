const taskListItems = document.querySelectorAll('#aufgaben li');
taskListItems.forEach(task => {
    task.addEventListener('click', () => {
        task.classList.toggle('erledigt');
    });
});