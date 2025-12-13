import { FileService } from "./FileService"
import {log} from '@zos/utils'

const logger = log.getLogger('SettingsService')

export class SettingsService {
    /**
     * Путь к файлу настроек
     * @type {string}
     */
    static #settingsFilePath = 'settings'
    /**
     * Устанавливает настройки по умолчанию
     * 
     * @returns {void}
     */
    static #setDefaultSettings(){
        logger.log('Set Default Settings')
        const defaultSet = {autoDelete: 'never', colorTheme: 'standard'}
        this.saveSettings(defaultSet)
        return defaultSet
    }
    /**
     * Загружает настройки приложения из файла конфигурации
     * 
     * Метод выполняет последовательность действий:
     * 1. Пытается прочитать файл с настройками
     * 2. Валидирует полученные данные
     * 3. Парсит JSON
     * 4. Возвращает объект с настройками
     * 
     * При возникновении ошибки:
     * - Записывает ошибку в лог
     * - Устанавливает настройки по умолчанию
     * 
     * @returns {{autoDelete: string, colorTheme: string}} Объект с настройками приложения
     * @throws {Error} В случае критической ошибки при загрузке
     * 
     * @example
     * const settings = SettingsManager.loadSettings();
     * // settings = { autoDelete: 'never', colorTheme: 'light' }
     */
    static loadSettings() {
        try {
            logger.log('Load settings...');
            const settings = JSON.parse(FileService.readFile(this.#settingsFilePath));
            this.#validateSettings(settings);
            logger.log('Load settings done');
            return { autoDelete:settings.autoDelete, colorTheme: settings.colorTheme };
        } catch (Error) {
            logger.error(Error, 'Load settings failed');
            return this.#setDefaultSettings();
        }
    }

    /**
     * Сохраняет настройки в файл
     * 
     * @param {Object} settings Объект с настройками для сохранения
     * @param {string} settings.autoDelete Значение автоудаления
     * @param {string} settings.colorTheme Значение темы оформления
     * @returns {void}
     * @throws {Error} Выбрасывает ошибку при неудачной записи
     */
    static saveSettings(settings){
        try{
            this.#validateSettings(settings)
            logger.log('Saving settings...')
            FileService.writeFile(this.#settingsFilePath, settings)
            logger.log('Save settings done')
        } catch (Error){
            logger.error(Error, 'Save settings failed')
            throw new Error('Save settings failed')
        }
    }
    /**
     * Валидирует настройки перед сохранением или загрузкой
     * 
     * @param {Object} settings Объект с настройками для проверки
     * @throws {Error} Выбрасывает ошибку при несоответствии формата
     * @private
     */
    static #validateSettings(settings) {
        if (
            typeof settings !== 'object' ||
            settings == null || 
            typeof settings.autoDelete !== 'string' ||
            typeof settings.colorTheme !== 'string'||
            !settings.hasOwnProperty('autoDelete') ||
            !settings.hasOwnProperty('colorTheme')
        ) {
            throw new Error('Invalid settings');
        }
    }

}