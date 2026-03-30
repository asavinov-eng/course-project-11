const API = 'https://your-energy.b.goit.study/api';

// -------- START --------
window.addEventListener('DOMContentLoaded', () => {
  console.log('JS WORKING');
  loadQuote();
  init();
});

// -------- QUOTE --------
function loadQuote() {
  const quoteEl = document.getElementById('quote');
  const authorEl = document.getElementById('author');

  if (!quoteEl || !authorEl) return;

  fetch(`${API}/quote`)
    .then(r => r.json())
    .then(d => {
      quoteEl.textContent = d.quote;
      authorEl.textContent = d.author;
    })
    .catch(() => {
      quoteEl.textContent = 'Error loading quote';
    });
}

// -------- STATE --------
let filter = 'Muscles';
let category = '';
let page = 1;
let keyword = '';

// -------- INIT --------
function init() {
  console.log('=== ИНИЦИАЛИЗАЦИЯ ===');
  
  // Очистить упражнения при загрузке
  const exercisesBox = document.getElementById('exercises');
  if (exercisesBox) {
    exercisesBox.innerHTML = '';
    console.log('Контейнер упражнений очищен');
  }

  // Обработчики для кнопок фильтров (Muscles, Body parts, Equipment)
  const filterButtons = document.querySelectorAll('#filters button[data-filter]');
  console.log('Найдено кнопок фильтров:', filterButtons.length);
  
  filterButtons.forEach((btn, idx) => {
    console.log(`Фильтр кнопка ${idx}: ${btn.getAttribute('data-filter')}`);
    
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const filterName = this.getAttribute('data-filter');
      console.log('\n>>> НАЖАТА КНОПКА ФИЛЬТРА:', filterName);
      filter = filterName;
      category = '';
      page = 1;
      loadCategories();
    });
  });

  // Поиск
  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        keyword = e.target.value;
        console.log('Поиск:', keyword);
        loadExercises();
      }
    });
  }

  console.log('Загрузка начальных категорий...');
  loadCategories();
  console.log('=== ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ===\n');
}

// -------- CATEGORIES --------
function loadCategories() {
  console.log('\n=== loadCategories ===');
  console.log('Фильтр:', filter);
  
  const url = `${API}/filters?filter=${filter}`;
  console.log('URL:', url);
  
  fetch(url)
    .then(r => r.json())
    .then(d => {
      console.log('Ответ API категории:', d.results ? d.results.length + ' категорий' : 'ошибка');
      
      const box = document.getElementById('categories');
      if (!box) {
        console.error('ОШИБКА: #categories не найден!');
        return;
      }

      box.innerHTML = '';

      if (!d.results || d.results.length === 0) {
        console.log('Категории не найдены');
        box.innerHTML = '<p>Нет категорий</p>';
        return;
      }

      console.log('Создание ' + d.results.length + ' кнопок категорий...');
      
      d.results.forEach((item, index) => {
        const button = document.createElement('button');
        button.textContent = item.name;
        button.type = 'button';
        button.style.border = '1px solid #ccc';
        button.style.margin = '5px';
        button.style.padding = '10px 15px';
        button.style.borderRadius = '10px';
        button.style.cursor = 'pointer';
        button.style.background = '#fff';
        button.style.fontSize = '14px';

        // Правильное замыкание
        button.onclick = (function(catName) {
          return function(e) {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            
            console.log('\n>>> НАЖАТА КНОПКА КАТЕГОРИИ: ' + catName);
            console.log('Текущий фильтр: ' + filter);
            
            // Очищаем контейнер упражнений
            const exercisesBox = document.getElementById('exercises');
            if (exercisesBox) {
              exercisesBox.innerHTML = '';
            }
            
            // Устанавливаем новую категорию
            category = catName;
            page = 1;
            
            console.log('category установлена: ' + category);
            console.log('filter: ' + filter);
            console.log('Вызов loadExercises()...');
            
            // Загружаем упражнения
            loadExercises();
          };
        })(item.name);

        console.log(`  Кнопка ${index + 1}: ${item.name}`);
        box.appendChild(button);
      });
      
      console.log('Все ' + d.results.length + ' кнопок добавлены');
    })
    .catch(err => {
      console.error('ОШИБКА loadCategories:', err);
    });
}

// -------- EXERCISES --------
function loadExercises(p = 1) {
  console.log('\n=== loadExercises ВЫЗВАНА ===');
  console.log('Параметры: p=' + p + ', category=' + category + ', filter=' + filter);
  
  page = p;

  const box = document.getElementById('exercises');
  if (!box) {
    console.error('NO #exercises IN HTML');
    return;
  }

  if (!category) {
    console.warn('NO CATEGORY SELECTED - category пуста');
    box.innerHTML = '<p>Выберите категорию</p>';
    return;
  }

  let param = '';

  if (filter === 'Muscles') param = 'muscle';
  else if (filter === 'Body parts') param = 'bodyPart';
  else if (filter === 'Equipment') param = 'equipment';

  if (!param) {
    console.error('Неизвестный фильтр:', filter);
    return;
  }

  console.log('Определен param:', param);

  let url = `${API}/exercises?${param}=${encodeURIComponent(category)}&page=${page}&limit=10`;

  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

  console.log('=== ПОЛНЫЙ URL ===');
  console.log(url);
  console.log('===');

  box.innerHTML = '<p>Загрузка упражнений для: ' + category + '...</p>';

  fetch(url)
    .then(r => {
      console.log('Статус ответа:', r.status, r.statusText);
      if (!r.ok) {
        throw new Error('HTTP Error: ' + r.status);
      }
      return r.json();
    })
    .then(d => {
      console.log('=== ОТВЕТ API ===');
      console.log('Всего результатов:', d.results ? d.results.length : 0);
      console.log('Всего страниц:', d.totalPages);
      console.log('Данные:', d);
      console.log('===');
      
      box.innerHTML = '';

      if (!d.results || d.results.length === 0) {
        box.innerHTML = `<p>Нет упражнений для вида "<b>${category}</b>" 😢</p>`;
        console.warn('Упражнения не найдены для категории:', category);
        return;
      }

      console.log('Рендер ' + d.results.length + ' упражнений...');
      
      d.results.forEach((ex, idx) => {
        console.log(`  Упражнение ${idx+1}: ${ex.name} (Target: ${ex.target}, Equipment: ${ex.equipment})`);
        
        const el = document.createElement('div');
        el.style.border = '1px solid #ddd';
        el.style.margin = '10px 0';
        el.style.borderRadius = '8px';
        el.style.background = '#fff';
        el.style.overflow = 'hidden';

        const header = document.createElement('div');
        header.style.padding = '15px';
        header.style.cursor = 'pointer';
        header.style.backgroundColor = '#f5f5f5';
        header.style.fontWeight = 'bold';
        header.style.userSelect = 'none';
        header.innerHTML = ex.name;

        const content = document.createElement('div');
        content.style.padding = '15px';
        content.style.display = 'block';
        content.style.borderTop = '1px solid #eee';
        content.innerHTML = `
          <p><strong>Target:</strong> ${ex.target || 'N/A'}</p>
          <p><strong>Equipment:</strong> ${ex.equipment || 'N/A'}</p>
          <p><strong>Body part:</strong> ${ex.bodyPart || 'N/A'}</p>
          <button data-id="${ex._id}" style="padding: 8px 16px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;">Details</button>
        `;

        header.addEventListener('click', () => {
          content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });

        el.appendChild(header);
        el.appendChild(content);
        box.appendChild(el);
      });

      console.log('Рендер завершен, всего упражнений отрисовано:', d.results.length);
      initModal();
      pagination(d.totalPages);
    })
    .catch(err => {
      console.error('=== ОШИБКА FETCH ===');
      console.error('Ошибка:', err);
      console.error('Message:', err.message);
      box.innerHTML = '<p>Ошибка загрузки упражнений: ' + err.message + '</p>';
    });
}

// -------- MODAL --------
function initModal() {
  document.querySelectorAll('[data-id]').forEach(btn => {
    btn.onclick = () => {
      fetch(`${API}/exercises/${btn.dataset.id}`)
        .then(r => r.json())
        .then(d => {
          alert(`${d.name}\n\n${d.description}`);
        });
    };
  });
}

// -------- PAGINATION --------
function pagination(total) {
  const box = document.getElementById('pagination');
  if (!box) return;

  console.log('\n=== ПАГИНАЦИЯ ===');
  console.log('Всего страниц:', total);
  
  box.innerHTML = '';

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');

    btn.textContent = i;
    btn.style.margin = '5px';
    btn.style.padding = '5px 10px';
    btn.style.cursor = 'pointer';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '4px';
    btn.style.backgroundColor = page === i ? '#007bff' : '#fff';
    btn.style.color = page === i ? '#fff' : '#000';

    // Правильное замыкание для пагинации
    btn.onclick = (function(pageNum) {
      return function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        console.log('\n>>> НАЖАТА СТРАНИЦА:', pageNum);
        console.log('Текущая категория:', category);
        console.log('Текущий фильтр:', filter);
        
        page = pageNum;
        
        console.log('page установлена:', page);
        console.log('Вызов loadExercises(' + pageNum + ')...');
        
        loadExercises(pageNum);
      };
    })(i);

    box.appendChild(btn);
  }
  
  console.log('Создано ' + total + ' кнопок пагинации');
}
