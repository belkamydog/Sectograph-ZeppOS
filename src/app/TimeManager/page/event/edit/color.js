import { onGesture, GESTURE_RIGHT } from '@zos/interaction'
import { createWidget, widget, prop } from '@zos/ui'
import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import {log} from '@zos/utils'
import { eventServise } from '../../../utils/Globals';
import { COLORS } from '../../../utils/Constants'

const logger = log.getLogger('page/event/edit/color.js')

Page({

    registerGes(){
        onGesture({
            callback: (event) => {
            if (event === GESTURE_RIGHT) {
                logger.log('Edit color canceled push to edit menu')
                push({
                    url: 'page/event/edit/menu',
                })
            }
            return true
            },
        })
    },

    onInit(params){
        logger.log('Init edit color page with params: ' + params)
        this.registerGes()
        const title = createWidget(widget.TEXT, {
            x: 140,
            y: 50,
            text: getText('Event color'),
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
                        let current_event = JSON.parse(params)
                        current_event.color = currentColor
                        eventServise.editEvent(current_event)
                        logger.log('Edit color done: ' + current_event.color)
                        push({
                            url: 'page/event/edit/menu',
                            params: JSON.stringify(current_event)
                        })
                    }
                })
            }
        }
    }
})