/**
 * JavaScript для страницы карты компаний (Yandex Maps API v2.1)
 */


// Глобальные переменные
let companiesData = [];
let map = null;

// Обновляем информацию о количестве компаний
function updateCompaniesInfo() {
    console.log('Обновление информации о компаниях...');
    const countElement = document.getElementById('companies-count');
    if (companiesData && companiesData.length > 0) {
        countElement.textContent = `Найдено компаний: ${companiesData.length}. Геокодирование адресов...`;
        console.log(`Установлено количество компаний: ${companiesData.length}`);
    } else {
        countElement.textContent = 'Компании не найдены';
        console.log('Компании не найдены');
    }
}

// Обновляем финальную информацию о компаниях
function updateCompaniesInfoFinal(placedMarkers) {
    console.log('Обновление финальной информации о компаниях...');
    const countElement = document.getElementById('companies-count');
    if (countElement) {
        countElement.textContent = `Найдено компаний: ${companiesData.length}. Отображено меток: ${placedMarkers}`;
        console.log(`Финальная информация: ${companiesData.length} компаний, ${placedMarkers} меток`);
    }
}

// Геокодирование через HTTP API
function geocodeAddress(address, company, index, placemarks, callback) {
    const apiKey = window.apiKey;
    if (!apiKey) {
        console.error('API ключ не найден');
        callback();
        return;
    }
    const encodedAddress = encodeURIComponent(address);
    const url = `https://geocode-maps.yandex.ru/v1/?apikey=${apiKey}&geocode=${encodedAddress}&format=json&results=1`;
    
    console.log(`HTTP геокодирование для ${company.title}: ${url}`);
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(`HTTP результат для ${company.title}:`, data);
            
            if (data.response && data.response.GeoObjectCollection && data.response.GeoObjectCollection.featureMember && data.response.GeoObjectCollection.featureMember.length > 0) {
                const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
                const coords = geoObject.Point.pos.split(' ').map(Number);
                // Конвертируем из долгота,широта в широта,долгота
                const coordsCorrected = [coords[1], coords[0]];
                
                console.log(`Координаты для ${company.title}:`, coordsCorrected);
                
                // Выбираем цвет метки в зависимости от типа компании
                const markerColor = getMarkerColor(company.company_type);
                
                // Создаем метку с подсказкой и названием
                const placemark = new ymaps.Placemark(coordsCorrected, {
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
                
                console.log(`Метка добавлена для ${company.title}`);
                callback();
            } else {
                console.warn(`Не удалось найти координаты для адреса: ${address} (компания: ${company.title})`);
                callback();
            }
        })
        .catch(error => {
            console.error(`Ошибка HTTP геокодирования для ${company.title}:`, error);
            callback();
        });
}


// Добавляем метки компаний на карту с геокодированием
function addCompanyMarkers() {
    console.log('=== ДОБАВЛЕНИЕ МЕТОК КОМПАНИЙ ===');
    
    if (!companiesData || companiesData.length === 0) {
        console.log('Нет данных о компаниях для отображения');
        return;
    }

    const placemarks = [];
    let geocodedCount = 0;

    companiesData.forEach((company, index) => {
        console.log(`Обработка компании ${index + 1}:`, company.title);
        
        // Добавляем задержку между запросами
        setTimeout(() => {
            // Берем первый адрес компании (если есть)
            if (company.addresses && company.addresses.length > 0) {
                const address = company.addresses[0];
                console.log(`Геокодирование адреса: ${address}`);
                
                // Геокодируем адрес через HTTP API
                geocodeAddress(address, company, index, placemarks, () => {
                    geocodedCount++;
                    console.log(`Обработано компаний: ${geocodedCount}/${companiesData.length}`);
                    if (geocodedCount === companiesData.length) {
                        fitMapToMarkers(placemarks);
                        updateCompaniesInfoFinal(placemarks.length);
                    }
                });
            } else {
                console.warn(`У компании ${company.title} нет адресов`);
                callback();
            }
        }, index * 500); // Задержка 500мс между запросами
    });
}

// Подгоняем карту под все метки
function fitMapToMarkers(placemarks) {
    console.log('Подгонка карты под метки...');
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



// Инициализация карты с использованием ymaps v2.1
function initMap() {

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
            map = new ymaps.Map("map", {
                center: [59.9311, 30.3351],
                zoom: 11
            }, {
                searchControlProvider: "yandex#search"
            });
            console.log('Карта создана:', map);

            console.log('Данные компаний для отображения:', companiesData);
            
            // Добавляем метки компаний на карту
            addCompanyMarkers();
            
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
