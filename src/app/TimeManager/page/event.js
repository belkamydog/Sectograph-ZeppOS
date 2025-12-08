import { createModal, MODAL_CONFIRM } from '@zos/interaction'
import { onGesture, GESTURE_RIGHT } from '@zos/interaction'
import { createWidget, widget, align, show_level } from '@zos/ui'
import { back, push } from '@zos/router'
import { Event } from '../utils/Event'
import { DayEvents } from '../utils/Globals'
import { styleColors } from '../utils/Constants'
import { getText } from '@zos/i18n'


Page ({
    widgets :{
        eventLabel: null,
        progressArc: null,
        progressArcBackground: null,
        timePeriod: null,
        deleteBtn: null,
        deleteDialog: null,
        editBtn: null,
        eventStatus: null,
    },

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

    onInit(params){
        this.registerGes()
        const current_event = JSON.parse(params)
        const pageData = new Event(current_event)
        this.widgets.deleteDialog = createModal({
            content: getText('Delete this event') + '?' ,
            autoHide: false,
            show: false,
            onClick: (keyObj) => {
                const { type } = keyObj
                if (type === MODAL_CONFIRM) {
                    DayEvents.deleteEventById(pageData.id)
                    back()
                } else {
                    this.widgets.deleteDialog.show(false)
                }
            },
        })
        this.eventLabel = createWidget(widget.TEXT, {
            x: (480-300)/2,
            y: 200,
            w: 300,
            h: 46,
            color: styleColors.white,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_size: 40,
            text: current_event.description
        }),
        this.timePeriod = createWidget(widget.TEXT, {
            x: (480-300)/2,
            y: 270,
            w: 300,
            h: 46,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            color: styleColors.white,
            text_size: 38,
            text: pageData.getPeriod()
        }),

        createWidget(widget.TEXT, {
            x: 0,
            y: 340,
            w: 480,
            h: 46,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            color: styleColors.white,
            text_size: 40,
            text: pageData.getDuration()
        }),
        this.eventStatus = createWidget(widget.TEXT, {
            x: 0,
            y: 130,
            w: 480,
            h: 40,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            color: styleColors.white,
            text_size: 38,
            text: pageData.getStatus()
        }),        
        this.progressArcBackground = createWidget(widget.ARC_PROGRESS, {
            center_x: 240,
            center_y: 240,
            radius: 220,
            start_angle: -150,
            end_angle: 150,
            color: styleColors.gray,
            line_width: 20,
            level: 100
        }),
        this.progressArc = createWidget(widget.ARC_PROGRESS, {
            center_x: 240,
            center_y: 240,
            radius: 220,
            start_angle: -150,
            end_angle: 150,
            color: 0x22F91A,
            line_width: 20,
            level: pageData.getlevel()
        }),
        this.widgets.deleteBtn = createWidget(widget.BUTTON, {
            x: (480-70)/2,
            y: 40,
            w: 70,
            h: 70,
            normal_src: 'delete.png',
            press_src: 'delete.png',
            click_func: (button_widget) => {
                this.widgets.deleteDialog.show(true)
            }
        })
        this.widgets.editBtn = createWidget(widget.BUTTON, {
            x: (480-70)/2,
            y: 400,
            w: 70,
            h: 70,
            normal_src: 'edit.png',
            press_src: 'edit.png',
            click_func: (button_widget) => {
                push({
                    url: 'page/event/edit/menu',
                    params: JSON.stringify(pageData)
                })
            }
        })
    }
})