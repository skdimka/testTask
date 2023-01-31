const draggableList = document.getElementById('draggable-list');
let inputValue = document.querySelector('.numberOfElements');
let sortSelection = document.querySelector('.sortSelection');
let personList = [];
let displayedPersonList = [];
let listItems = [];
let dragStartIndex;

getForbesPersonList(); //запрашиваем данные с сервера
inputValue.addEventListener("change", setDisplayedPersonList);//вешаем слушатель на изменения количества отображаемых элементов списка

function getForbesPersonList() { //запрашиваем данные с сервера и преобразуем в обьект
    return fetch('https://63cbb063ea8551541513bafa.mockapi.io/products/')
        .then((response) => {
            return response.json();//преобразование из json
        }).then((data) => {
            personList = data;
            document.querySelector('.numberOfElements').max = personList.length;//задаем инпуту ввода "количества элементов" - максимальное значение, опираясь на прешедший массив
            return personList;
        }).then(() => {
            setDisplayedPersonList();
        })
}

function setDisplayedPersonList() {
    document.querySelector('.sortSelection').value = 'sortDefault';//задаем значение сортировки по умолчанию
    draggableList.innerHTML = ""; //очищаем область отрисовки списка
    inputValue = document.querySelector('.numberOfElements').value; //задаем значение из инпута, по умолчанию value="10";
    if (inputValue > 0) { //если вписано отрицательное значение, то никакой отрисовки не произойдет
        displayedPersonList = personList?.slice(0, inputValue);
        createList();
    }
}

sortSelection.addEventListener('change', () => { //вешаем слушатель на изменения выбора сортировки
    if (sortSelection.value === 'sortDefault') {
        displayedPersonList.sort((a, b) => a.id - b.id)//сортировка массива по умолчанию, массив "как пришел"
    } else {
        if (sortSelection.value === 'sortMoney') {
            displayedPersonList.sort((a, b) => b.money - a.money)//сортировка массива по количеству средств, от большего количества средств к меньшему
        } else {
            if (sortSelection.value === 'sortAge') {
                displayedPersonList.sort((a, b) => a.age - b.age)//сортировка массива по возрасту, от самого молодого к самому старому
            }
        }
    }
    draggableList.innerHTML = ""; //очищаем область отрисовки списка
    createList();
});

function createList() { //отрисовываем полученный список элементов
    listItems = [];
    displayedPersonList.forEach((value, index) => { //последовательно перебираем все элементы массива
        const listItem = document.createElement('li');
        listItem.setAttribute('data-index', index);
        listItem.innerHTML = `
        <div class="draggable" draggable="true" data-title='${value.text}'>
          <p class="person-name">${value.firstname} ${value.lastname}</p>
          <div class="card">
          <div class="cardinfo">
          <img src='${value.avatar}'>
          <h2>${value.firstname} ${value.lastname}</h2>
          </div>
          <p>Cостояние: ${value.money} (млрд, $)</p>
          <p>Возраст: ${value.age}</p>
          <p>Резиденция: ${value.country}</p>
          <p class="bio">${value.text}</p>
        </div>
        </div>`;
        listItems.push(listItem);
        draggableList.appendChild(listItem);
    });
    callDragAndDrop();//когда список элементов отрисован, можем начинать отслеживать их перемещение
}

function dragStart() { //начинаем перетаскивать элемент
    dragStartIndex = +this.closest('li').getAttribute('data-index');//closest найдет нам ближайший родительский элемент с классом 'li', а getAttribute получит значение атрибута 'data-index' 
}

function dragEnter() { //перетаскиваемый элемент входит в допустимую зону перемещения
    this.classList.add('over'); //показываем пользователю, что это допустимая зона перемещения элемента
}

function dragLeave() { //перетаскиваемый элемент выходит из допустимой зоны перемещения
    this.classList.remove('over'); //это не допустимая зона перемещения элемента, поэтому зона перемещения не 'подсвечивается'
}

function dragOver(e) { //перетаскиваемый элемент находится над допустимой зоной перемещения и функция будет срабатывать, пока он над ней
    e.preventDefault(); //для отмены стандартных событий, что бы сработал Drop
}

function dragDrop() { //перетаскиваемый элемент отпускаем в допустимой зоне перемещения
    const dragEndIndex = +this.getAttribute('data-index');//получаем значение второго индекса, элемента с которым будем менять местами
    swapPerson(dragStartIndex, dragEndIndex); //вызываем функцию и передаем значения 1. откуда взяли элемент(dragStart) 2. где отпустили элемент(dragDrop)
    this.classList.remove('over');
}

function swapPerson(fromIndex, toIndex) { // меняем местами доступные к перетаскиванию элементы списка
    const itemOne = listItems[fromIndex].querySelector('.draggable');
    const itemTwo = listItems[toIndex].querySelector('.draggable');

    listItems[fromIndex].appendChild(itemTwo);
    listItems[toIndex].appendChild(itemOne);
}

function callDragAndDrop() { //отслеживаем перемещение элементов
    const draggablesItems = document.querySelectorAll('.draggable');
    const dragListItems = document.querySelectorAll('.draggable-list li');
    draggablesItems.forEach(draggableItem => {
        draggableItem.addEventListener('dragstart', dragStart);
    });

    dragListItems.forEach(item => {
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', dragDrop);
        item.addEventListener('dragenter', dragEnter);
        item.addEventListener('dragleave', dragLeave);
    });
}
