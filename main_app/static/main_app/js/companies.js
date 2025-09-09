/**
 * JavaScript для страницы карты компаний (Yandex Maps API v2.1)
 */

console.log('=== НАЧАЛО ЗАГРУЗКИ СКРИПТА ===');

// Глобальные переменные
let companiesData = [];
let map = null;

// Обновляем информацию о количестве компаний
function updateCompaniesInfo() {
    console.log('Обновление информации о компаниях...');
    const countElement = document.getElementById('companies-count');
    if (companiesData && companiesData.length > 0) {
        countElement.textContent = `Найдено компаний: ${companiesData.length}`;
        console.log(`Установлено количество компаний: ${companiesData.length}`);
    } else {
        countElement.textContent = 'Компании не найдены';
        console.log('Компании не найдены');
    }
}

// Добавляем метки компаний на карту
function addCompanyMarkers() {
    console.log('=== ДОБАВЛЕНИЕ МЕТОК КОМПАНИЙ ===');
    
    if (!companiesData || companiesData.length === 0) {
        console.log('Нет данных о компаниях для отображения');
        return;
    }

    const placemarks = [];
    
    // Координаты для Санкт-Петербурга (правильный порядок: долгота, широта)
    // Основаны на реальных адресах из данных компаний
    const spbCoords = [
        [30.3151, 59.9411], // Васильевский остров (Малый проспект В.О., 83)
        [30.3251, 59.9351], // Васильевский остров (улица Шевченко, 19) - немного смещено
        [30.3051, 59.9451], // Васильевский остров (12-13-я линии В.О., 22) - немного смещено
        [30.3351, 59.9311], // Центр СПб (Дворцовая площадь)
        [30.3551, 59.9211]  // Петроградская сторона (Петропавловская крепость)
    ];

    companiesData.forEach((company, index) => {
        console.log(`Обработка компании ${index + 1}:`, company.title);
        
        // Используем координаты по индексу (циклически)
        const coords = spbCoords[index % spbCoords.length];
        
        // Выбираем цвет метки в зависимости от типа компании
        const markerColor = getMarkerColor(company.company_type);
        
        // Создаем метку с подсказкой и названием
        const placemark = new ymaps.Placemark(coords, {
            hintContent: company.title,
            iconCaption: company.title,
            balloonContentHeader: company.title,
            balloonContentBody: createBalloonContent(company),
            balloonContentFooter: `ID: ${company.id}`
        }, {
            preset: markerColor,
            balloonMaxWidth: 300,
            iconCaptionMaxWidth: 200,
            iconCaptionOffset: [0, -5]
        });
        
        placemarks.push(placemark);
        map.geoObjects.add(placemark);
        
        console.log(`Метка добавлена для ${company.title} в координатах:`, coords);
    });
    
    // Подгоняем карту под все метки
    if (placemarks.length > 0) {
        map.geoObjects.getBounds().then(function (bounds) {
            map.setBounds(bounds, {
                checkZoomRange: true,
                zoomMargin: 20
            });
        });
    }
}

// Создаем содержимое для всплывающего окна
function createBalloonContent(company) {
    let content = `<div style="padding: 10px;">`;
    content += `<h3 style="margin: 0 0 10px 0; color: #333;">${company.title}</h3>`;
    
    if (company.company_type) {
        content += `<p style="margin: 5px 0;"><strong>Тип:</strong> ${company.company_type}</p>`;
    }
    
    if (company.industry) {
        content += `<p style="margin: 5px 0;"><strong>Отрасль:</strong> ${company.industry}</p>`;
    }
    
    if (company.revenue) {
        content += `<p style="margin: 5px 0;"><strong>Доход:</strong> ${company.revenue} ${company.currency_id || ''}</p>`;
    }
    
    if (company.addresses && company.addresses.length > 0) {
        content += `<p style="margin: 5px 0;"><strong>Адреса:</strong></p>`;
        content += `<ul style="margin: 5px 0; padding-left: 20px;">`;
        company.addresses.forEach(address => {
            content += `<li style="margin: 2px 0;">${address}</li>`;
        });
        content += `</ul>`;
    }
    
    content += `</div>`;
    return content;
}

// Выбираем цвет метки в зависимости от типа компании
function getMarkerColor(companyType) {
    const colorMap = {
        'CUSTOMER': 'islands#blueDotIcon',      // Клиент - синий
        'SUPPLIER': 'islands#greenDotIcon',     // Поставщик - зеленый
        'PARTNER': 'islands#orangeDotIcon',     // Партнер - оранжевый
        'COMPETITOR': 'islands#redDotIcon',     // Конкурент - красный
        'RESELLER': 'islands#violetDotIcon',    // Реселлер - фиолетовый
        'OTHER': 'islands#grayDotIcon'          // Другое - серый
    };
    
    return colorMap[companyType] || 'islands#blueDotIcon'; // По умолчанию синий
}

// Добавляем легенду карты
function addMapLegend() {
    console.log('Добавление легенды карты...');
    
    const legendContent = `
        <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); font-family: Arial, sans-serif; font-size: 12px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Типы компаний:</h4>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #0066cc; border-radius: 50%;"></div>
                    <span>Клиент</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #00cc66; border-radius: 50%;"></div>
                    <span>Поставщик</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #ff9900; border-radius: 50%;"></div>
                    <span>Партнер</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #cc0000; border-radius: 50%;"></div>
                    <span>Конкурент</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #9900cc; border-radius: 50%;"></div>
                    <span>Реселлер</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #666666; border-radius: 50%;"></div>
                    <span>Другое</span>
                </div>
            </div>
        </div>
    `;
    
    // Создаем легенду как балун в левом верхнем углу
    const legendBalloon = new ymaps.Balloon(map, {
        layout: 'default#imageWithContent',
        imageLayout: 'default#image',
        imageOffset: [0, 0],
        imageShape: {
            type: 'Rectangle',
            coordinates: [[0, 0], [0, 0]]
        }
    });
    
    // Добавляем легенду в левый верхний угол карты
    map.balloon.open([55.8, 37.4], legendContent, {
        closeButton: false,
        autoPan: false
    });
}


// Инициализация карты с использованием ymaps v2.1
function initMap() {
    console.log('=== НАЧАЛО ИНИЦИАЛИЗАЦИИ КАРТЫ ===');
    
    try {
        console.log('Проверка доступности ymaps...');
        console.log('typeof ymaps:', typeof ymaps);
        
        if (typeof ymaps === 'undefined') {
            throw new Error('Yandex Maps API не загружен. Проверьте API ключ и подключение к интернету.');
        }

        console.log('Ожидание готовности ymaps...');
        ymaps.ready(function() {
            console.log('ymaps готов!');

            console.log('Поиск контейнера карты...');
            const mapContainer = document.getElementById('map');
            console.log('Контейнер карты:', mapContainer);
            
            if (!mapContainer) {
                throw new Error('Контейнер карты не найден');
            }

            console.log('Создание карты...');
            // Создаем карту точно как в примере из документации
            map = new ymaps.Map("map", {
                center: [30.3351, 59.9311], // Санкт-Петербург (Дворцовая площадь)
                zoom: 11
            }, {
                searchControlProvider: "yandex#search"
            });
            console.log('Карта создана:', map);

            console.log('=== КАРТА УСПЕШНО ИНИЦИАЛИЗИРОВАНА ===');
            console.log('Данные компаний для отображения:', companiesData);
            
            // Добавляем метки компаний на карту
            addCompanyMarkers();
            
            // Добавляем легенду карты
            addMapLegend();
            
            // Обновляем информацию о компаниях
            updateCompaniesInfo();
        });
        
    } catch (error) {
        console.error('=== ОШИБКА ИНИЦИАЛИЗАЦИИ КАРТЫ ===');
        console.error('Тип ошибки:', error.constructor.name);
        console.error('Сообщение ошибки:', error.message);
        console.error('Стек ошибки:', error.stack);
        console.error('Полный объект ошибки:', error);
        
        const countElement = document.getElementById('companies-count');
        if (countElement) {
            countElement.textContent = `Ошибка загрузки карты: ${error.message}`;
        }
        
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: red; background: #ffe6e6; border: 1px solid #ff9999; border-radius: 5px;">
                    <h3>Ошибка загрузки карты</h3>
                    <p>${error.message}</p>
                    <p>Проверьте:</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>API ключ Яндекс.Карт</li>
                        <li>Подключение к интернету</li>
                        <li>Консоль браузера для подробностей</li>
                    </ul>
                </div>
            `;
        }
    }
}

// Инициализация при загрузке страницы
function initializePage() {
    console.log('Инициализация страницы...');
    
    // Ждем готовности DOM и даем время API загрузиться
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM загружен, ждем 1 секунду перед инициализацией карты...');
            setTimeout(initMap, 1000);
        });
    } else {
        console.log('DOM уже готов, ждем 1 секунду перед инициализацией карты...');
        setTimeout(initMap, 1000);
    }
}

// Экспортируем функции для использования в шаблоне
window.CompaniesMap = {
    init: initializePage,
    setCompaniesData: function(data) {
        companiesData = data;
        console.log('Данные компаний установлены:', companiesData);
    }
};

console.log('=== КОНЕЦ ЗАГРУЗКИ СКРИПТА ===');