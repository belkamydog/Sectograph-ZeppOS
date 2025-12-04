import { createWidget, widget, prop } from '@zos/ui'
import { getText } from '@zos/i18n'
import { COLORS } from '../../utils/Constants'
import { DayEvents } from '../../utils/Globals';
import { push } from '@zos/router'



Page({
    onInit(params){
        const title = createWidget(widget.TEXT, {
            x: 140,
            y: 50,
            text: 'Event color',
            text_size: 40,
            w: 480,
            h: 50,
        })
        const scrollList = createWidget(widget.VIEW_CONTAINER, {
            x: 0,
            y: 120,
            w: 480,
            h: 280,
            pos_y: -80
        })
        for (let row = 0, color_i = 0; row < COLORS.length/4; row++){
            for (let col = 0; col < 3; col++){
                const currentColor = COLORS[color_i++]
                const btn = scrollList.createWidget(widget.BUTTON, {
                    x: 80 + 100 * col + 20,
                    y: 80 + 100 * row,
                    w: 80,
                    h: 80,
                    radius: 0,
                    normal_color: currentColor,
                    press_color: 0xfeb4a8,
                    text: '',
                    click_func: (color_i) => {
                            let result = ''
                            const current_event = JSON.parse(params)
                            result = {description: current_event.description, start: current_event.start, end: current_event.end, color: currentColor}
                            push({
                                url: 'page/event/repeat',
                                params: JSON.stringify(result)
                            })
                    }
                })
            }
        }
    }
})