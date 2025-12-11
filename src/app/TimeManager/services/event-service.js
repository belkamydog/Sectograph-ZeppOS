import {log} from '@zos/utils'
import { FileService } from './file-service'

const logger = log.getLogger('EventService')

export class EventService {
    eventsFilePath = 'events'
    ActualEvents = []

    /**
     * Метод для очистки истории событий
     * 
     * Удаляет все сохраненные события, перезаписывая файл с событиями пустой строкой.
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
            FileService.writeFile(this.eventsFilePath ,'')
            logger.log('Clear history successfull')
        } catch(Error){
            logger.error(Error , 'Clear history failed')
            throw new Error('Clear history failed')
        }
    }

    createNewEvent(event){
        logger.log('Creating new event...')
        try{
            this.#checkEventFields(event)
            let result = this.#loadEvents()
            this.#generateEventId(event, result)
            result.push(event)
        } catch(Error){
            logger.error('Create new event failed')
            throw new Error('Create new event failed')
        }
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
        if (!(event.startDate instanceof Date) || isNaN(event.startDate)) {
            throw new Error('Invalid startDate: must be a valid Date object');
        }
        if (!(event.endDate instanceof Date) || isNaN(event.endDate)) {
            throw new Error('Invalid endDate: must be a valid Date object');
        }
        const colorRegex = /^0x[0-9A-Fa-f]{6}$/;
        if (typeof event.color !== 'string' || !colorRegex.test(event.color)) {
            throw new Error('Invalid color: must be a valid hex color string');
        }
        if (typeof event.repeat !== 'string' || 
            ![...event.repeat].every(digit => /^[0-3]$/.test(digit))) {
            throw new Error('Invalid repeat: must contain only digits 0-3');
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
        event.id = this.#generatorId()
        if (!event || typeof event !== 'object') {
            throw new Error('Event must be a valid object');
        }
        if (!Array.isArray(allEvents)) {
            throw new Error('All events must be provided as an array');
        }
        while (allEvents.some(existingEvent => existingEvent.id === event.id)) {
            event.id = this.#generateEventId();
        }
    }

}