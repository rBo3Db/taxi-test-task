import './css/main.scss';


var userAddressString = document.getElementById('userAddressString');
var alertOfAdressString = document.getElementById('message');
var crews;
var orderData;
var closestTaxi;
var timeoutId = 0;
var orderButton = document.getElementById('orderTaxi');

ymaps.ready(init);

function init() {
    var userLocationOnMap,
        myMap = new ymaps.Map('map', {
            center: [56.852593, 53.204843],
            zoom: 9,
            controls: []
        });

    myMap.events.add('click', function (e) {
    var coords = e.get('coords');

        getAddress(coords);
    });

    // Создание метки.
    function createPlacemark(coords, color) {
        var presetColor = 'islands#' + color + 'DotIconWithCaption';
        return (new ymaps.Placemark(coords, {}, {
            preset: presetColor
        }));
    }
    function createGeoObject(placeMark) {
        myMap.geoObjects.add(placeMark);
    }

    // Определяем адрес по координатам (обратное геокодирование).
    function getAddress(coords) {

        ymaps.geocode(coords).then(function (res) {
            myMap.geoObjects.removeAll();
            var firstGeoObject = res.geoObjects.get(0);
            var thoroughfare = firstGeoObject.getThoroughfare();
            var premiseNumber = firstGeoObject.getPremiseNumber(); 
            if (thoroughfare && premiseNumber) {                      
                var address = thoroughfare + ', ' + premiseNumber;
                userAddressString.value = address;  
                createGeoObject(createPlacemark(coords, 'yellow'));
                getCars(coords, address);
                alertOfAdressString.classList.add('form-of-order-taxi__alert-text--hidden');
                
            } else {
                createGeoObject(createPlacemark(coords, 'red'));
                userAddressString.value = '';
                addAlertTextUnderAddressString();
                console.log('адрес не найден');
            }
        });
    }
    
    function searchByAddress(address) {
        if (address) {
            ymaps.geocode('Ижевск ' + address, {
                results: 1
            }).then(function (res) {
                // Выбираем первый результат геокодирования.
                var firstGeoObject = res.geoObjects.get(0),
                    bounds = firstGeoObject.properties.get('boundedBy'),
                    coords = firstGeoObject.geometry.getCoordinates();

                // Получаем строку с адресом и выводим в иконке геообъекта.
                getAddress(coords);

                // Масштабируем карту на область видимости геообъекта.
                myMap.setBounds(bounds, {
                    // Проверяем наличие тайлов на данном масштабе.
                    checkZoomRange: true
                });
            });
        }
    }

    userAddressString.onkeyup = userAddressStringHandler;
    orderButton.onclick = orderTaxiHandler;

    function userAddressStringHandler() {
        if (event.keyCode !== 13) {
            if(timeoutId != 0) {
                clearTimeout(timeoutId);
                
            }
            timeoutId = setTimeout(doIt, 1000);
        } else {
            doIt();
        }
        
    }

    function doIt() {
        searchByAddress(userAddressString.value);
    }

    function getCars(coords, address) {
        var query = {
            // формат времени ГГГГММДДччммсс 
            "source_time":  getFormatedDate(new Date()),
            "addresses":
            [
                {
                "address":address,
                "lat":coords[0],
                "lon":coords[1]
                }
            ]
        }
        orderData = query;
        crews = askServer(query);
        closestTaxi = findClosestTaxi(crews);
        //ВЫВЕСТИ ВЁДРА
        crews.data.crews_info.forEach((element, index) => {
            createGeoObject(createPlacemark([crews.data.crews_info[index].lat, crews.data.crews_info[index].lon], 'green'));
        });

    }
}

function addAlertTextUnderAddressString() {
    alertOfAdressString.classList.remove('form-of-order-taxi__alert-text--hidden');
}

function isUserAddressStringValid() {
    return userAddressString.value !== "";
}

function orderTaxiHandler() {
    if (isFormValid()) {
        orderTaxi();
    } else {
        orderButton.setAttribute("disabled", "disabled");
        addAlertTextUnderAddressString();
    }
}

function isFormValid() {
    return isUserAddressStringValid();
}

function findClosestTaxi(cars) {
    cars.data.crews_info.sort(function (a, b) {
        if (a.distance > b.distance) {
            return 1;
        }
        if (a.distance < b.distance) {
            return -1;
        }
        return 0;
    })
    return cars.data.crews_info[0];
}

function orderTaxi() {
    var fullOrderData = {
        ...orderData,
        crew_id: closestTaxi.crew_id
    };
    console.log(fullOrderData);
    sendOrderToServer(fullOrderData);
    if (sendOrderToServer(fullOrderData).descr === "OK") {
        showSuccesMessage();
    }
}

function sendOrderToServer(data) {
    return {
        "code":0,
        "descr":"OK",
        "data":{
            "order_id":12345
        }
    }
}

function getFormatedDate(date) {
    return  '' + date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds()) 
}

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}
function askServer(query) {
    return {
    // прикладной код ошибки
    "code":0,
    // описание
    "descr":"OK",
    "data":{
        "crews_info":[
            {
                "crew_id":123,
                "car_mark":"Chevrolet",
                "car_model":"Lacetti",
                "car_color":"синий",
                "car_number":"Е234КУ",
                "driver_name":"Деточкин",
                "driver_phone":"7788",
                "lat":56.855532,
                "lon":53.217462,
                "distance":300
            },{
                "crew_id":125,
                "car_mark":"Hyundai",
                "car_model":"Solaris",
                "car_color":"белый",
                "car_number":"Ф567АС",
                "driver_name":"Петров",
                "driver_phone":"8899",
                "lat":56.860581,
                "lon":53.209223,
                "distance":600
            }
        ]
    }
}
}

function showAllCars(cars) {

}