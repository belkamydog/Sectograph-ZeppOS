import { push } from '@zos/router'
import { Time } from '@zos/sensor'
import { widget, createWidget } from '@zos/ui'
import { DayEvents } from '../../utils/Globals'
import { getText } from '@zos/i18n'


Page({
    onInit(params) {
        const time = new Time()
        let currentValues = {
            day: time.getDate(),
            month: time.getMonth()-1,
            year: time.getFullYear(),
            hour: time.getHours(),
            minute: time.getMinutes()
        }
        
        let dataArrays = {
            month: new Array(12).fill(0).map((d, index) => index + 1), 
            day: new Array(31).fill(0).map((d, index) => index + 1),
            year: new Array(100).fill(0).map((d, index) => index + 1970),
            hour: new Array(24).fill(0).map((d, index) => index),
            minute: new Array(60).fill(0).map((d, index) => index)
        }
        
        const font_size = 30
        const select_font_size = 30
        const connector_font_size = 1
        const unit_font_size = 5
        const col_width = 45
        
        const picker_cb = (picker, event_type, column_index, select_index) => {
            if (event_type === 1) {
                switch(column_index) {
                    case 0:
                        currentValues.month = dataArrays.month[select_index]
                        break
                    case 1:
                        currentValues.day = dataArrays.day[select_index]
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
            }
            if (event_type == 2){
                let endDate = new Date()
                endDate.setFullYear(currentValues.year)
                endDate.setMonth(currentValues.month)
                endDate.setDate(currentValues.day)
                endDate.setHours(currentValues.hour)
                endDate.setMinutes(currentValues.minute)

                let result = ''
                if (params && params !== 'undefined' && typeof params === 'string' && params.trim().length > 0 
                    && JSON.parse(params).id) {
                    result = JSON.parse(params)
                    result.end = endDate
                    DayEvents.editEndDate(result)
                    push({
                        url: 'page/event',
                        params: JSON.stringify(result),
                    })
                }
                else {
                    const current_event = JSON.parse(params)
                    result = {description: current_event.description, start: current_event.start, end: endDate.toISOString()}
                     push({
                        url: 'page/event/color',
                        params: JSON.stringify(result)
                    })
                }
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
                    data_array: dataArrays.month,
                    init_val_index: time.getMonth() - 1,
                    unit: 'M',
                    support_loop: true,
                    font_size: font_size,
                    select_font_size: select_font_size,
                    connector_font_size: connector_font_size,
                    unit_font_size: unit_font_size,
                    col_width: col_width
                },
                {
                    data_array: dataArrays.day,
                    init_val_index: time.getDate() - 1,
                    unit: 'D',
                    support_loop: true,
                    font_size: font_size,
                    select_font_size: select_font_size,
                    connector_font_size: connector_font_size,
                    unit_font_size: unit_font_size,
                    col_width: col_width
                },
                {
                    data_array: dataArrays.year,
                    init_val_index: time.getFullYear() - 1970,
                    unit: 'Y',
                    support_loop: true,
                    font_size: font_size,
                    select_font_size: select_font_size,
                    connector_font_size: connector_font_size,
                    unit_font_size: unit_font_size,
                    col_width: col_width
                },
                {
                    data_array: dataArrays.hour,
                    init_val_index: time.getHours(),
                    unit: 'H',
                    support_loop: true,
                    font_size: font_size,
                    select_font_size: select_font_size,
                    connector_font_size: connector_font_size,
                    unit_font_size: unit_font_size,
                    col_width: col_width
                },
                {
                    data_array: dataArrays.minute,
                    init_val_index: time.getMinutes(),
                    unit: 'M',
                    support_loop: true,
                    font_size: font_size,
                    select_font_size: select_font_size,
                    connector_font_size: connector_font_size,
                    unit_font_size: unit_font_size,
                    col_width: col_width
                }
            ],
            picker_cb
        })
    }
})