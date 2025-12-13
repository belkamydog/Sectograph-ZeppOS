import {log} from '@zos/utils'
import { FileService } from './FileService'
import { SettingsService } from './SettingsService'
import { Event } from '../models/Event'
import { HOUR_MS } from '../Constants'

const logger = log.getLogger('EventService')

export class EventService {
    eventsFilePath = 'events'
    actualEvents = []

    constructor(){}


    getActualEvents(){
        this.#autoDeleteEvents()
        this.#uploadActualEvents()
        return this.actualEvents
    }

    /**
     * Метод для очистки истории событий
     * 
     * Удаляет все сохраненные события, перезаписывая файл с событиями пустым массивом.
     * 
     * @function clearHistoryOfEvents
     * @throws {Error} Генерирует ошибку, если очистка истории завершилась неудачно
     * 
     * @example
     * // Пример использования
     * try {
     *     clearHistoryOfEvents();
     *     console.log('История событий успешно очищена');
     * } catch (error) {
     *     console.error('Ошибка при очистке истории:', error);
     * }
     * 
     * @returns {void} Метод не возвращает значение
     * 
     * @see FileService.writeFile - метод для записи в файл
     * @see logger.log - метод логирования успешных операций
     * @see logger.error - метод логирования ошибок
     */
    clearHistoryOfEvents(){
        logger.log('Delete events history init...')
        try{
            this.#saveEvents([])
            logger.log('Clear history successfull')
        } catch(Error){
            logger.error(Error , 'Clear history failed')
            throw new Error('Clear history failed')
        }
    }

    /**
     * Создает новое событие и сохраняет его в список
     * 
     * Метод выполняет следующие действия:
     * 1. Валидирует поля нового события
     * 2. Загружает существующие события
     * 3. Генерирует уникальный ID для нового события
     * 4. Добавляет событие в список
     * 5. Сохраняет обновленный список
     * 
     * @public
     * @param {Event} event - объект нового события
     * @returns {void}
     * 
     * @description
     * Метод предназначен для добавления нового события в календарь.
     * Перед сохранением событие проходит валидацию и получает уникальный ID.
     * 
     * @throws {Error} В случае возникновения ошибок при создании события
     */
    createNewEvent(event) {
        logger.log('Creating new event...');
        try {
            this.#checkEventFields(event);
            let result = this.#loadEvents();
            this.#generateEventId(event, result);
            result.push(event);
            this.#saveEvents(result);
            this.#uploadActualEvents()
            logger.log('New event created successfully');
        } catch (error) {
            logger.error(error, 'Create new event failed');
            throw error;
        }
    }

    /**
     * Редактирует существующее событие в списке
     * 
     * Метод ищет событие по ID и заменяет его на новую версию
     * 
     * @public
     * @param {Event} event - объект события с обновленными данными
     * @returns {void}
     * 
     * @description
     * Метод выполняет следующие действия:
     * 1. Загружает текущие события из файла
     * 2. Проходит по списку событий
     * 3. Заменяет событие с совпадающим ID на новое
     * 4. Сохраняет обновленный список
     * 
     * @throws {Error} В случае возникновения ошибок при работе с файлами
     */
    editEvent(event) {
        logger.log('Edit event started...');
        try {
            const loadedEvents = this.#loadEvents();
            let result = [];
            for (const ev of loadedEvents) {
                if (this.#checkEventFields(ev) && event.id === ev.id) {
                    result.push(event);
                } else {
                    result.push(ev);
                }
            }
            this.#saveEvents(result);
            this.#uploadActualEvents()
            logger.log('Event edited successfully');
        } catch (error) {
            logger.error(error, 'Edit event failed');
            throw error;
        }
    }

    /**
     * Удаляет событие по его ID
     * 
     * Метод находит событие с указанным ID и удаляет его из списка
     * 
     * @public
     * @param {number} id - уникальный идентификатор события для удаления
     * @returns {void}
     * 
     * @description
     * Метод выполняет следующие действия:
     * 1. Загружает все события из файла
     * 2. Фильтрует события, оставляя только те, чей ID не совпадает с переданным
     * 3. Сохраняет обновленный список
     * 4. Обновляет список актуальных событий
     * 
     * @throws {Error} В случае возникновения ошибок при удалении события
     */
    deleteEvent(id) {
        try {
            logger.log(`Deleting event with ID: ${id}`);
            const loadedEvents = this.#loadEvents();
            const result = [];
            for (const ev of loadedEvents) {
                if (this.#checkEventFields(ev) && ev.id !== id) {
                    result.push(ev);
                }
            }
            this.#saveEvents(result);
            this.#uploadActualEvents();
            logger.log('Event deleted successfully');
            return result
        } catch (error) {
            logger.error(error, `Failed to delete event with ID: ${id}`);
            throw error;
        }
    }

    getWeekListOfEvents(date){
        this.#autoDeleteEvents()
        const week = EventService.getWeekRange(date)
        const loadedEvents = this.#loadEvents()
        let resultList = []
        for (const ev of loadedEvents){
            ev.checkRepeat = ev.repeat
            if (ev.repeat != 'never') {
                this.#repeateRule(new Event(ev), week, resultList)
            }
            else {
                if (new Date(ev.start) >= week.start && new Date(ev.start <= week.end))
                    resultList.push(new Event(ev))
            }
        }
        resultList.sort((a, b) => new Date(a.start) - new Date(b.start));
        return resultList
    }

    /**
     * Автоматически удаляет устаревшие события из списка
     * 
     * Метод фильтрует события на основе настроек автоудаления и сохраняет только актуальные
     * 
     * @private
     * @returns {void}
     * 
     * @description
     * Метод выполняет следующие действия:
     * 1. Загружает настройки автоудаления
     * 2. Загружает все события
     * 3. Фильтрует события по условиям удаления
     * 4. Сохраняет отфильтрованный список
     * 
     * @throws {Error} В случае возникновения ошибок при обработке событий
     */
    #autoDeleteEvents() {
        try {
            logger.log('Starting auto-delete process...');
            const autoDelete = SettingsService.loadSettings().autoDelete;
            const loadedEvents = this.#loadEvents();
            const deleteFilterDone = [];
            for (const ev of loadedEvents) {
                if (this.#checkEventFields(ev) && !this.#deleteFilter(ev, autoDelete)) {
                    deleteFilterDone.push(ev);
                }
            }
            this.#saveEvents(deleteFilterDone);
            logger.log('Auto-delete process completed');
        } catch (error) {
            logger.error(error, 'Auto-delete events failed');
            throw error;
        }
    }

    /**
     * Загружает актуальные события из файла и подготавливает их к отображению
     * 
     * Метод фильтрует события по актуальности и добавляет к ним необходимые параметры отображения
     * 
     * @private
     * @returns {void}
     * 
     * @description
     * Метод выполняет следующие действия:
     * 1. Загружает все события из файла
     * 2. Фильтрует события по актуальности
     * 3. Добавляет углы отображения для каждого события
     * 4. Сохраняет актуальные события в массив actualEvents
     * 
     * @throws {Error} В случае возникновения ошибок при обработке событий
     */
    #uploadActualEvents() {
        try {
            logger.log('Loading actual events...');
            this.actualEvents = []
            const loadedEvents = this.#loadEvents();
            const start = new Date().getTime() - 2 * HOUR_MS
            const end = new Date().getTime() + 10 * HOUR_MS
            for (const ev of loadedEvents) {
                this.#repeateRule(ev, {start: new Date(start), end: new Date(end)}, this.actualEvents)
                if (this.#checkEventFields(ev) && this.#actualEventsFilter(ev)) {
                    this.#addAnglesToEvent(ev);
                    this.actualEvents.push(ev);
                }
            }
            logger.log('Actual events loaded successfully');
        } catch (error) {
            logger.error(error, 'Failed to load actual events');
            throw error;
        }
    }


    /**
     * Фильтрует события по их актуальности
     * 
     * Метод определяет, является ли событие актуальным для отображения на основе его временных границ
     * 
     * @private
     * @param {Event} event - событие для проверки
     * @returns {boolean} true - если событие актуально, false - иначе
     * 
     * @description
     * Событие считается актуальным, если выполняется одно из условий:
     * 1. Событие начинается не позже чем через 10 часов и не раньше текущего момента
     * 2. Событие закончилось не более чем 2 часа назад
     * 3. Событие происходит прямо сейчас (текущее время находится между start и end)
     */
    #actualEventsFilter(event) {
        const now = new Date();
        const startEv = new Date(event.start);
        const endEv = new Date(event.end);
        return (
            // Событие начинается в ближайшие 10 часов и не раньше текущего момента
            ((startEv.getTime() - now.getTime()) <= (10 * HOUR_MS) && startEv >= now) ||
            // Событие закончилось не более 2 часов назад
            ((now.getTime() - endEv.getTime()) <= (2 * HOUR_MS) && now >= endEv) ||
            // Событие происходит прямо сейчас
            (now >= startEv && now <= endEv)
        );
    }


    /**
     * Определяет необходимость автоматического удаления события
     * 
     * @public
     * @param {Object} event - объект события с полями repeat и end
     * @param {String} autoDelete - never, day, week, month
     * @returns {boolean} true - если событие нужно удалить, false - иначе
     * 
     * @description
     * Метод проверяет, нужно ли автоматически удалить событие на основе:
     * - наличия повтора события
     * - настроек автоудаления
     * - разницы между текущей датой и датой окончания события
     */
    #deleteFilter(event, autoDelete) {
        if (event.repeat && event.repeat != 'never') return false;
        let result = false;
        const now = new Date();
        const end = new Date(event.end);
        if (autoDelete === 'day') {
            // Удаление через 24 часа после окончания
            if (now > end && (now.getTime() - end.getTime()) > HOUR_MS * 24) {
                result = true;
            }
        } else if (autoDelete === 'week') {
            // Удаление через 7 дней после окончания
            if (now > end && (now.getTime() - end.getTime()) > HOUR_MS * 24 * 7) {
                result = true;
            }
        } else if (autoDelete === 'month') {
            // Удаление через 31 день после окончания
            if (now > end && (now.getTime() - end.getTime()) > HOUR_MS * 24 * 31) {
                result = true;
            }
        }
        if (result) {
            logger.log('Auto-delete = ' + this.autoDelete + ' Delete: ' + event);
        }
        return result;
    }

    /**
     * Метод для загрузки событий из файла
     * 
     * Загружает сохраненные события из указанного файла в формате JSON.
     * Обрабатывает возможные ошибки при чтении файла или парсинге данных.
     * 
     * @function loadEvents
     * @returns {Array|string} Массив событий в формате JSON или пустая строка при ошибке
     * 
     * @throws {Error} Внутренняя ошибка при чтении файла
     * 
     * @example
     * // Пример использования
     * try {
     *     const events = loadEvents();
     *     if (events instanceof Array) {
     *         // Обработка загруженных событий
     *     }
     * } catch (error) {
     *     console.error('Ошибка при загрузке событий:', error);
     * }
     * 
     * @see FileService.readFile - метод для чтения файла
     * @see JSON.parse - метод для парсинга JSON данных
     */
    #loadEvents(){
        try {
           const fileContent = FileService.readFile(this.eventsFilePath)
            if (!fileContent) return []
            return JSON.parse(fileContent)
        } catch (Error) {
            logger.error(Error, 'Upload events failed')
            return []
        }
    }

    /**
     * Сохраняет список событий в файл
     * 
     * Метод записывает переданный массив событий в файл в формате JSON
     * 
     * @private
     * @param {Array<Event>} listOfEvents - массив событий для сохранения
     * @returns {void}
     * 
     * @description
     * Метод выполняет запись переданного списка событий в файл.
     * Каждое событие должно соответствовать ожидаемой структуре данных.
     * 
     * @throws {Error} В случае возникновения ошибок при записи файла
     */
    #saveEvents(listOfEvents) {
        try {
            FileService.writeFile(this.eventsFilePath, listOfEvents);
            logger.log('Events successfully saved');
        } catch (error) {
            logger.error(error, 'Failed to save events');
            throw error;
        }
    }

    /**
     * Создает список повторяющихся событий на основе заданного периода
     * 
     * Метод генерирует копии события согласно правилу повторения до указанной конечной даты
     * 
     * @private
     * @param {Event} event - исходное событие с правилом повторения
     * @param {Object} period - объект с полями start и end, определяющий период повторения
     * @returns {Event[]} массив повторяющихся событий
     * 
     * @description
     * Метод поддерживает следующие типы повторения:
     * - 'never' - не повторяется
     * - 'day' - ежедневное повторение
     * - 'week' - еженедельное повторение
     * - 'month' - ежемесячное повторение
     * 
     * Для каждого типа повторения используется свой интервал времени
     */
    #repeateRule(event, period, listToAdd) {
        let repeatMs = this.#getRepeatTimeMs(event);
        if (event.repeat !== 'never') {
            let repeatedEvent = { ...event };
            repeatedEvent.checkRepeat = event.repeat;
            repeatedEvent.repeat = 'never';
            repeatedEvent.start = new Date(event.start) + repeatMs;
            repeatedEvent.end = new Date(event.end) + repeatMs;
            while (repeatedEvent.start <= new Date(period.end)) {
                listToAdd.push(new Event(repeatedEvent));
                repeatMs = event.repeat === 'month' 
                    ? this.#getMsToSameDateInNextMonth(repeatedEvent) 
                    : repeatMs;
                repeatedEvent.start = new Date(repeatedEvent.start) + repeatMs;
                repeatedEvent.end = new Date(repeatedEvent.end) + repeatMs;
            }
        }
    }

    /**
     * Метод для проверки корректности полей события
     * 
     * Проверяет, соответствуют ли предоставленные данные формату события
     * 
     * @function checkEventFields
     * @param {Object} event - объект события для проверки
     * @returns {boolean} true если все поля корректны, иначе false
     * 
     * @example
     * const event = {
     *     description: 'Встреча с клиентом',
     *     startDate: new Date(),
     *     endDate: new Date(),
     *     color: '0x000000',
     *     repeat: '0123'
     * };
     * 
     * const isValid = checkEventFields(event); // true
     * 
     * @throws {Error} Генерирует ошибку, если какое-либо поле не соответствует требованиям
     * 
     * @see Event format requirements:
     *      - description: string
     *      - startDate: Date object
     *      - endDate: Date object
     *      - color: string in hex format (e.g. '0x000000')
     *      - repeat: string containing digits 0-3 (e.g. '0123')
     */
    #checkEventFields(event) {
        if (!event || typeof event !== 'object') {
            throw new Error('Event must be a valid object');
        }
        if (typeof event.description !== 'string' || event.description.trim() === '') {
            throw new Error('Invalid description: must be a non-empty string');
        }
        if (!(new Date(event.start) instanceof Date)) {
            throw new Error('Invalid startDate: must be a valid Date object');
        }
        if (!(new Date(event.end) instanceof Date)) {
            throw new Error('Invalid endDate: must be a valid Date object');
        }
        if (typeof event.repeat !== 'string' ||
            !['never', 'day', 'week', 'month'].includes(event.repeat)
        ) {
            throw new Error('Invalid repeat: must be one of \'never\', \'day\', \'week\', \'month\'');
        }

        return true;
    }

    /**
     * Метод для генерации уникального ID события
     * 
     * Генерирует уникальный идентификатор события, комбинируя текущее время
     * в формате base-36 и случайную строку. Такой подход обеспечивает высокую
     * вероятность уникальности сгенерированного ID.
     * 
     * @function generateEventId
     * @returns {string} Уникальный идентификатор события
     * 
     * @description
     * Метод создает ID, состоящий из двух частей:
     * 1. Текущее время в миллисекундах, преобразованное в base-36
     * 2. Случайная строка из 9 символов в base-36
     * 
     * Пример возвращаемого значения: 'r3m123456789'
     * 
     * @see toString(36) - преобразование числа в строку в системе счисления base-36
     *      (использует цифры 0-9 и буквы a-z)
     * 
     * @example
     * const eventId = generateEventId(); // например 'r3m123456789'
     */
    #generatorId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Метод для автоматической проверки и генерации уникального ID события
     * 
     * Проверяет наличие дубликатов ID в списке событий и, если дубликат найден,
     * автоматически генерирует новый уникальный ID для события.
     * 
     * @function checkDuplicateId
     * @param {Object} event - объект события, для которого проверяется ID
     * @param {Array} allEvents - массив всех существующих событий для проверки
     * 
     * @returns {void} Метод модифицирует оригинальный объект event
     * 
     * @throws {Error} Генерирует ошибку, если:
     *   - event не является объектом
     *   - allEvents не является массивом
     *   - метод generateEventId() недоступен
     * 
     * @example
     * // Пример использования
     * const event = {
     *     id: 'possible-duplicate',
     *     description: 'Новое событие'
     * };
     * 
     * const allEvents = [
     *     { id: 'existing-id-1' },
     *     { id: 'possible-duplicate' },
     *     { id: 'existing-id-2' }
     * ];
     * 
     * checkDuplicateId(event, allEvents);
     * // После выполнения event.id будет содержать уникальный ID
     * 
     * @see generateEventId - метод для генерации нового ID
     * @see Array.prototype.some - метод для проверки наличия дубликатов
     * 
     * @note Метод модифицирует оригинальный объект event,
     *       изменяя его свойство id при необходимости
     */
    #generateEventId(event, allEvents) {
        if (!event || typeof event !== 'object') {
            throw new Error('Event must be a valid object');
        }
        if (!Array.isArray(allEvents)) {
            throw new Error('All events must be provided as an array');
        }
        while (allEvents.some(existingEvent => existingEvent.id === event.id)) {
            event.id = this.#generatorId();
        }
    }

    /**
     * Добавляет углы к событию на основе его временных границ
     * 
     * @private
     * @param {Object} event - объект события с полями start и end
     * @description
     * Метод вычисляет начальный и конечный углы для визуального представления события
     * на циферблате и добавляет их в объект события.
     */
    #addAnglesToEvent(event) {
        // Вычисляем углы для события
        const angles = this.#calculateEventAngles(event, Date.now());
        // Добавляем углы в объект события
        event.startAngle = angles.startAngle;
        event.endAngle = angles.endAngle;
    }

    /**
     * Вычисляет углы для визуального представления события
     * 
     * @private
     * @param {Object} event - объект события с полями start и end
     * @param {number} timeNow - текущее время в миллисекундах
     * @returns {Object} объект с полями startAngle и endAngle
     * 
     * @description
     * Метод рассчитывает углы на основе временных границ события,
     * учитывая ограничения по времени отображения.
     * 
     * Ограничения:
     * - События старше 2 часов от текущего времени начинаются с угла 2-часовой давности
     * - События, заканчивающиеся позже чем через 10 часов, обрезаются до 10-часового предела
     */
    #calculateEventAngles(event, timeNow) {
        // Вычисляем базовые углы для начала и конца события
        let startAngle = EventService.convertTimeToAngle(event.start);
        let endAngle = EventService.convertTimeToAngle(event.end);
        
        // Вычисляем время отсечения (2 часа назад)
        const deleteTime = new Date(new Date(timeNow).getTime() - 2 * HOUR_MS);
        
        // Корректируем углы с учетом временных ограничений
        if (new Date(event.start) < deleteTime) {
            // Если начало события раньше 2 часов назад, начинаем от 2-часовой отметки
            startAngle = EventService.convertTimeToAngle(deleteTime);
        } else if (new Date(event.end).getTime() > timeNow + 10 * HOUR_MS) {
            // Если конец события позже чем через 10 часов, обрезаем до 10-часовой отметки
            endAngle = EventsManager.convertTimeToAngle(timeNow + 10 * HOUR_MS);
        }
        
        // Корректируем угол начала, если он больше угла конца
        startAngle = startAngle > endAngle ? (startAngle - 360) : startAngle;
        
        return {
            startAngle: startAngle,
            endAngle: endAngle
        };
    }

    #getRepeatTimeMs(event){
        let repeatTimeMs = 0
        if (event.repeat == 'day') repeatTimeMs = 24 * HOUR_MS
        else if ( event.repeat == 'week') repeatTimeMs = 7 * 24 * HOUR_MS
        else if (event.repeat == 'month') repeatTimeMs = this.#getMsToSameDateInNextMonth(event)
        return repeatTimeMs
    }

    /**
     * Вычисляет количество миллисекунд до того же числа в следующем месяце
     * 
     * Метод рассчитывает разницу во времени между датой события и тем же числом в следующем месяце,
     * учитывая количество дней в следующем месяце
     * 
     * @private
     * @param {Event} event - событие, для которого производится расчет
     * @returns {number} количество миллисекунд до той же даты в следующем месяце
     * 
     * @description
     * Метод учитывает:
     * - переход между месяцами
     * - переход между годами
     * - разное количество дней в месяцах
     * - корректную обработку последнего дня месяца
     */
    #getMsToSameDateInNextMonth(event) {
        const start = new Date(event.start);
        const currentDay = start.getDate();
        let nextMonth = start.getMonth() + 1;
        let nextYear = start.getFullYear();
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear += 1;
        }
        const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
        const nextDay = Math.min(currentDay, daysInNextMonth);
        const nextEventDate = new Date(nextYear, nextMonth, nextDay);
        const diffInMs = nextEventDate.getTime() - start.getTime();
        return diffInMs;
    }

    /**
     * Определяет границы недели для заданной даты
     * 
     * Метод вычисляет понедельник и воскресенье текущей недели для указанной даты
     * 
     * @private
     * @param {Date|string} date - дата, для которой определяется неделя
     * @returns {{start: Date, end: Date}} объект с датами начала (понедельник) и конца (воскресенье) недели
     * 
     * @description
     * Неделя считается с понедельника по воскресенье.
     * Метод корректно обрабатывает переход между месяцами и годами.
     */
    static getWeekRange(date) {
      const currentDate = new Date(date);
      const dayOfWeek = currentDate.getDay(); // 0-воскресенье, 1-понедельник, ...6-суббота
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + diffToMonday);
      const sunday = new Date(monday);
      monday.setHours(0)
      monday.setMinutes(0)
      monday.setSeconds(0)
      monday.setMilliseconds(0)
      sunday.setHours(0)
      sunday.setMinutes(0)
      sunday.setSeconds(0)
      sunday.setMilliseconds(0)
      sunday.setDate(monday.getDate() + 7);
      return { start: monday, end: sunday };
    }

    /**
     * Преобразует время в градусы для отображения на циферблате
     * 
     * Функция конвертирует часы и минуты в градусы поворота стрелки часов.
     * Используется для корректного отображения положения часовой и минутной стрелок
     * на аналоговом циферблате.
     * 
     * @static
     * @param {string|Date} time - время в формате строки или объект Date
     * @returns {number} угол в градусах [0, 360)
     * 
     * @description
     * Алгоритм конвертации:
     * - 1 час соответствует 30 градусам (полный круг 360° / 12 часов)
     * - 1 минута соответствует 0.5 градусам (30° / 60 минут)
     * 
     * Пример:
     * - 12:00 -> 0 градусов
     * - 3:00 -> 90 градусов
     * - 6:00 -> 180 градусов
     * - 9:00 -> 270 градусов
     * - 12:30 -> 180 градусов (30 минут * 0.5°/мин)
     */
    static convertTimeToAngle(time) {
        // Создаем объект даты из переданного времени
        let date = new Date(time);
        
        // Вычисляем общее количество минут
        // (часы * 60 + минуты) * 0.5°/минуту
        let result = (date.getHours() * 60 + date.getMinutes()) * 0.5;
        
        // Нормализация результата: при превышении 360° берем остаток от деления
        return result >= 360 ? result % 360 : result;
    }

    static convertToCirCoord(coordinate) {
        let result = 0
        if (coordinate >= 240) result = coordinate - 240
        else result = 240 - coordinate
            return result
    }

    static isThisEvent(x, y, event) {
        const distance = Math.sqrt((x - 240) ** 2 + (y - 240) ** 2);
        if (distance > 200) {
            return false;
        }
        let pointAngle = 90 - Math.atan2(240 - y, x - 240) * (180 / Math.PI);
        if (pointAngle < 0) pointAngle = 360 + pointAngle
        if (event.startAngle <= event.endAngle) {
            if (event.startAngle < 0 && pointAngle > 270) {
            pointAngle = pointAngle -360
            }
            return pointAngle >= event.startAngle && pointAngle <= event.endAngle;
        } else {
            return pointAngle >= event.startAngle || pointAngle <= event.endAngle;
        }
    }

    static separateListToPastCurrentFutureEvents(eventsList){
      let past = 0, current = 0, future = 0
      const now = new Date()
      for (const ev of eventsList){
        const start = new Date(ev.start)
        const end = new Date(ev.end)
        if (now > end) past++
        else if (start > now) future++
        else current++
      }
      return {past: past, current: past + current, future: past+ current + future}
    }
}