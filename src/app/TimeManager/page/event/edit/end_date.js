import { push } from '@zos/router'
import { widget, createWidget } from '@zos/ui'
import { getText } from '@zos/i18n'
import {log} from '@zos/utils'
import { onGesture, GESTURE_RIGHT } from '@zos/interaction'
import { eventServise } from '../../../utils/Globals'
import { DATE_TIME_PEACKER } from '../../../utils/Constants'


const logger = log.getLogger('page/event/edit/end_date.js')

Page({

    registerGes(){
        onGesture({
            callback: (event) => {
            if (event === GESTURE_RIGHT) {
                logger.log('Edit end event canceled push to edit menu')
                push({
                    url: 'page/event/edit/menu',
                })
            }
            return true
            },
        })
    },

    onInit(params) {
        logger.log('Init edit end of event with params: ' + params)
        this.registerGes()
        let needToEdit = JSON.parse(params)
        const end = new Date(needToEdit.end)
        let currentValues = {
            day: end.getDate(),
            month: end.getMonth(),
            year: end.getFullYear(),
            hour: end.getHours(),
            minute: end.getMinutes()
        }
        let dataArrays = {
            day: new Array(31).fill(0).map((d, index) => index + 1),
            month: new Array(12).fill(0).map((d, index) => index + 1),
            year: new Array(3).fill(0).map((d, index) => index + new Date().getFullYear()),
            hour: new Array(24).fill(0).map((d, index) => index),
            minute: new Array(60).fill(0).map((d, index) => index)
        }
        const picker_cb = (picker, event_type, column_index, select_index) => {
            if (event_type === 1) {
                switch(column_index) {
                    case 0:
                        currentValues.day = dataArrays.day[select_index]
                        break
                    case 1:
                        currentValues.month = dataArrays.month[select_index]
                        break
                    case 2:
                        currentValues.year = dataArrays.year[select_index]
                        break
                    case 3:
                        currentValues.hour = dataArrays.hour[select_index]
                        break
                    case 4:
                        currentValues.minute = dataArrays.minute[select_index]
                        break                       
                }
            } if (event_type == 2) {
                let endDate = new Date()
                endDate.setFullYear(currentValues.year)
                endDate.setMonth(currentValues.month)
                endDate.setDate(currentValues.day)
                endDate.setHours(currentValues.hour)
                endDate.setMinutes(currentValues.minute)
                needToEdit.end = endDate
                eventServise.editEvent(needToEdit)
                logger.log('Edit end date done, new end: ' +  needToEdit.end)
                push({
                    url: 'page/event',
                    params: JSON.stringify(needToEdit),
                })
            }
        }

        const picker_widget = createWidget(widget.WIDGET_PICKER, {
            title: getText('Event end'),
            subtitle: '',
            nb_of_columns: 5,
            single_wide: true,
            init_col_index: 1,
            data_config: [
                {
                    data_array: dataArrays.day,
                    init_val_index: currentValues.day-1,
                    unit: 'D',
                    support_loop: true,
                    font_size: DATE_TIME_PEACKER.font_size,
                    select_font_size: DATE_TIME_PEACKER.select_font_size,
                    connector_font_size: DATE_TIME_PEACKER.connector_font_size,
                    unit_font_size: DATE_TIME_PEACKER.unit_font_size,
                    col_width: DATE_TIME_PEACKER.col_width
                },
                {
                    data_array: dataArrays.month,
                    init_val_index: currentValues.month,
                    unit: 'M',
                    support_loop: true,
                    font_size: DATE_TIME_PEACKER.font_size,
                    select_font_size: DATE_TIME_PEACKER.select_font_size,
                    connector_font_size: DATE_TIME_PEACKER.connector_font_size,
                    unit_font_size: DATE_TIME_PEACKER.unit_font_size,
                    col_width: DATE_TIME_PEACKER.col_width
                },
                {
                    data_array: dataArrays.year,
                    init_val_index: currentValues.year-1,
                    unit: 'Y',
                    support_loop: true,
                    font_size: DATE_TIME_PEACKER.font_size,
                    select_font_size: DATE_TIME_PEACKER.select_font_size,
                    connector_font_size: DATE_TIME_PEACKER.connector_font_size,
                    unit_font_size: DATE_TIME_PEACKER.unit_font_size,
                    col_width: DATE_TIME_PEACKER.col_width
                },
                {
                    data_array: dataArrays.hour,
                    init_val_index: currentValues.hour,
                    unit: 'H',
                    support_loop: true,
                    font_size: DATE_TIME_PEACKER.font_size,
                    select_font_size: DATE_TIME_PEACKER.select_font_size,
                    connector_font_size: DATE_TIME_PEACKER.connector_font_size,
                    unit_font_size: DATE_TIME_PEACKER.unit_font_size,
                    col_width: DATE_TIME_PEACKER.col_width
                },
                {
                    data_array: dataArrays.minute,
                    init_val_index: currentValues.minute,
                    unit: 'M',
                    support_loop: true,
                    font_size: DATE_TIME_PEACKER.font_size,
                    select_font_size: DATE_TIME_PEACKER.select_font_size,
                    connector_font_size: DATE_TIME_PEACKER.connector_font_size,
                    unit_font_size: DATE_TIME_PEACKER.unit_font_size,
                    col_width: DATE_TIME_PEACKER.col_width
                }
            ],
            picker_cb
        })
    }
})