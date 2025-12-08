import { createModal, MODAL_CONFIRM } from '@zos/interaction'
import { onGesture, GESTURE_RIGHT } from '@zos/interaction'
import { createWidget, widget, align } from '@zos/ui'
import { getText } from '@zos/i18n'
import { push } from '@zos/router'
import {log} from '@zos/utils'
import { styleColors } from '../../../utils/Constants'

const logger = log.getLogger('page/event/edit/menu.js')

Page({
    registerGes(){
        onGesture({
            callback: (event) => {
            if (event === GESTURE_RIGHT) {
                push({
                    url: 'page/index',
                })
            }
            return true
            },
        })
    },
    initBg(){
        this.circle = createWidget(widget.CIRCLE, {
        center_x: 240,
        center_y: 240,
        radius: 227,
        color: styleColors.white_smoke,
        })
        this.circle = createWidget(widget.CIRCLE, {
        center_x: 240,
        center_y: 240,
        radius: 225,
        color: styleColors.black,
        })
    },
    initTitle(){
        createWidget(widget.TEXT, {
            text: getText('Edit'),
            w: 480,
            h: 30,
            x: 0,
            y: 40,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_size: 30,
            color: styleColors.yellow
        })
    },
    initNewEventDialog(){
        const dialog = createModal({
            content: getText('Edit event') + '?',
            autoHide: false,
            show: false,
            onClick: (keyObj) => {
                const { type } = keyObj
                if (type === MODAL_CONFIRM) {
                push({
                    url: 'page/event/description',
                })
                    dialog.show(false)
                } else {
                    dialog.show(false)
                }
            },
        })
        dialog.show(true) 
    },
    onInit(params){
        logger.log('Init edit event menu page with params: ' + params)
        this.registerGes()
        this.initBg()
        this.initTitle()
        const menu = [
            {src:'', text: getText('Description')},
            {src:'', text: getText('Start date')},
            {src:'', text: getText('End date')},
            {src:'', text: getText('Color')},
            {src:'', text: getText('Repeat')},
        ]
        cycleList = createWidget(widget.CYCLE_IMAGE_TEXT_LIST, {
            x: (480-330)/2,
            y: (480-300)/2,
            w: 330,
            h: 300,
            data_array: menu,
            data_size: menu.length,
            item_height: 120,
            item_bg_color: styleColors.black,
            item_text_color: styleColors.white_smoke,
            item_text_x: 10,
            item_text_y: 10,
            item_text_size: 40,
            item_click_func: (cyckleList ,index) => {
                if (index == 0){
                    logger.log('Init edit description')
                    push({
                        url: 'page/event/edit/description',
                        params: params
                    })
                } else if (index == 1){
                    logger.log('Init edit start of event')
                    push({
                        url: 'page/event/edit/start_date',
                        params: params
                    })
                } else if (index == 2) {
                    logger.log('Init edit end of event')
                    push({
                        url: 'page/event/edit/end_date',
                        params: params
                    })
                } else if (index == 3) {
                    logger.log('Init edit color')
                    push({
                        url: 'page/event/edit/color',
                        params: params
                    })
                } else if (index == 4) {
                    logger.log('Init edit repeat')
                    push({
                        url: 'page/event/edit/repeat',
                        params: params
                    })  
                }
            },
            item_focus_change_func: (cycleList, index, isFocus) => {}
        })
    }
})