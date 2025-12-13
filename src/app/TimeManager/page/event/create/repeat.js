import { createWidget, widget, prop, align } from '@zos/ui'
import { getText } from '@zos/i18n'
import { styleColors } from '../../../utils/Constants';
import { eventServise } from '../../../utils/Globals';
import { REPEAT } from '../../../utils/Constants';
import { push } from '@zos/router'
import {log} from '@zos/utils'


const logger = log.getLogger('colors.js')
let repeat_page_index = 0


Page({
    repeat: ['Never','Every day', 'Every week', 'Every month'],

    onInit(params){
        logger.log('Init repeat choose page with params: ' + params)

        const title = createWidget(widget.TEXT, {
            text: getText('Repeat event:'),
            w: 300,
            h: 50,
            x: (480-300)/2,
            y: 50,
            align_v: align.CENTER_V,
            align_h: align.CENTER_H,
            text_size: 35,
            color: styleColors.white_smoke
        })
        const radioGroup = createWidget(widget.RADIO_GROUP, {
            x: 0,
            y: 0,
            w: 480,
            h: 480,
            select_src: 'radio_selected.png',
            unselect_src: 'radio_unselected.png',
            check_func: (group, index, checked) => {
                if (checked){
                    repeat_page_index = index
                } 
            }
        })
        const x = 380
        const neverRepeatBtn = radioGroup.createWidget(widget.STATE_BUTTON, {
            x: x,
            y: 150,
            w: 64,
            h: 64
        })
        const everyDayRepeatBtn= radioGroup.createWidget(widget.STATE_BUTTON, {
            x: x,
            y: 250,
            w: 64,
            h: 64
        })
        const everyWeekRepeatBtn = radioGroup.createWidget(widget.STATE_BUTTON, {
            x: x,
            y: 350,
            w: 64,
            h: 64
        })
        const everyMonthRepeatBtn = radioGroup.createWidget(widget.STATE_BUTTON, {
            x: x,
            y: 450,
            w: 64,
            h: 64
        })

        const neverRepeatLabel = createWidget(widget.TEXT, {
            text: getText(this.repeat[0]),
            w: 250,
            h: 135,
            x: 70,     
            y: 140,
            align_v: align.UP,
            align_h: align.LEFT,
            text_size: 32,
            color: styleColors.white_smoke
        })
        const everyDayRepeatLabel = createWidget(widget.TEXT, {
            text: getText(this.repeat[1]),
            w: 250,
            h: 64,
            x: 70,
            y: 240,
            align_v: align.CENTER_V,
            align_h: align.LEFT,
            text_size: 32,
            color: styleColors.white_smoke
        })
        const everyWeekRepeatLabel = createWidget(widget.TEXT, {
            text: getText(this.repeat[2]),
            w: 250,
            h: 64,
            x: 70,
            y: 340,
            align_v: align.CENTER_V,
            align_h: align.LEFT,
            text_size: 32,
            color: styleColors.white_smoke
        })
        const everyMonthRepeatLabel = createWidget(widget.TEXT, {
            text: getText(this.repeat[3]),
            w: 250,
            h: 64,
            x: 70,
            y: 440,
            align_v: align.CENTER_V,
            align_h: align.LEFT,
            text_size: 32,
            color: styleColors.white_smoke
        })

        radioGroup.setProperty(prop.INIT, neverRepeatBtn)

        createWidget(widget.BUTTON, {
            x: 40,
            y: 550,
            w: 400,
            h: 60,
            radius: 30,
            normal_color: styleColors.dark_green,
            press_color: styleColors.dark_gray,
            text: getText('Create'),
            text_size: 32,
            click_func: () => {
                let result = JSON.parse(params)
                result.repeat = REPEAT[repeat_page_index]
                result.check_repeat = REPEAT[repeat_page_index]
                logger.log('Repeat add to event: ' + result.repeat)
                eventServise.createNewEvent(result)
                push({
                    url: 'page/index',
                    params: 'clear'
                })
            }
        })
        createWidget(widget.BUTTON, {
            x: 40,
            y: 550+100,
            w: 400,
            h: 60,
            radius: 30,
            normal_color: styleColors.dark_gray,
            press_color: styleColors.blue_violet,
            text: getText('Main screen'),
            text_size: 32,
            click_func: () => {
                logger.log('Push from repeat to the main page')
                push ({
                    url: 'page/index'
                })
            }
        })
    }
})