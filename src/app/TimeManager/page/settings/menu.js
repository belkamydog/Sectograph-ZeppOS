import { createWidget, widget } from '@zos/ui'
import { createModal, MODAL_CONFIRM } from '@zos/interaction'
import { push } from '@zos/router'
import { getText } from '@zos/i18n'
import { styleColors } from '../../utils/Constants'
import { eventServise } from '../../utils/Globals'

Page({

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
    
    initClearHistoryDialog(){
        const dialog = createModal({
            content: getText('Clear history') + '?',
            autoHide: false,
            show: false,
            onClick: (keyObj) => {
                const { type } = keyObj
                if (type === MODAL_CONFIRM) {
                    push({
                        url: 'page/index',
                    })
                    eventServise.clearHistoryOfEvents()
                    dialog.show(false)
                } else {
                    dialog.show(false)
                }
            },
        })
        dialog.show(true) 
    },

    onInit(){
        this.initBg()
        const menu = [
            {src:'', text: getText('Auto delete')},
            {src:'', text: getText('Clear history')}
        ]
        cycleList = createWidget(widget.CYCLE_IMAGE_TEXT_LIST, {
            x: (480-330)/2,
            y: 120,
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
                    push({
                        url: 'page/settings/history',
                    })
                } else if (index == 1){
                    this.initClearHistoryDialog()
                }

            },
            item_focus_change_func: (cycleList, index, isFocus) => {

            },
        })
    }
})