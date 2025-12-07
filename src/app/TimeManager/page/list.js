import { createWidget, widget, prop, align } from '@zos/ui'
import { createModal, MODAL_CONFIRM } from '@zos/interaction'
import { DayEvents } from '../utils/Globals';
import { push } from '@zos/router'
import { getText } from '@zos/i18n'
import { HOUR_MS, styleColors } from '../utils/Constants';
import {log} from '@zos/utils'
import { EventsManager } from '../utils/EventsManager';
import { Event } from '../utils/Event';
import { onGesture, GESTURE_RIGHT } from '@zos/interaction'


const logger = log.getLogger('page/list.js')

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

  initTitle(date){
    console.log('Date' + date)
    const titleText = getText('List of events')
    createWidget(widget.TEXT, {
      text: titleText,
      x: 0,
      y: 50,
      w: 480,
      h: 50,
      text_size: 35,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      color: styleColors.white
    })
    const period = EventsManager.getWeekRange(date)
    createWidget(widget.TEXT, {
        text: Event.addZero(period.start.getDate()) + '.'+ Event.addZero((period.start.getMonth()+1)) + ' - ' + Event.addZero(period.end.getDate()-1) + '.'+ Event.addZero((period.end.getMonth()+1)),
        x: 0,
        y: 90,
        w: 480,
        h: 50,
        text_size: 35,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        color: styleColors.white
    })
  },

  addKeys(arrEv){
    let result = []
    let previous = {}
    previous.previous_week = 'previous.png'
    result.push(previous)
    for (let i of arrEv){
      i.weekDay = new Event(i).getWeekDay()
      i.del_img = 'delete.png'
      i.edit_img = 'edit.png'
      i.color_state = new Event(i).getColorState()
      result.push(i)
    } 
    let next = {}
    next.next_week = 'next.png'
    result.push(next)
    return result
  },

  ifEmptyListOfEventsLabel(){
    createWidget(widget.TEXT, {
      text: getText('There are no events'),
      x: 0,
      y: 220,
      w: 480,
      h: 50,
      text_size: 35,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      color: styleColors.white
    })
  },

  onInit(params) {
    this.registerGes()
    let period = null
    try{
      let date = JSON.parse(params)
      period = new Date(date) 
    } catch {
      period = new Date()
    }
    this.initBg()
    this.initTitle(period);
    const listOfEvents = DayEvents.getListOfEventsInCurrentWeek(period)
    for (const i of listOfEvents)
      console.log('I ' + JSON.stringify(i))
    const separatedByColorInd = DayEvents.separateListToPastCurrentFutureEvents(listOfEvents)
    console.log('sep ' + JSON.stringify(separatedByColorInd))
    const weekEvents = this.addKeys(listOfEvents)
    console.log(JSON.stringify(weekEvents))
    logger.log('Init list of events: ' + JSON.stringify(weekEvents))
    if (weekEvents.length == 2) 
        this.ifEmptyListOfEventsLabel()
  
    logger.log('Creating scrollist of events...')
    const scrollList = createWidget(widget.SCROLL_LIST, {
        x: (480-380)/2,
        y: 140,
        h: 480,
        w: 380,
        radius:10,
        item_space: 20,
        snap_to_center: true,
        item_enable_horizon_drag: true,
        item_drag_max_distance: -120,
        item_config: [
          {
            type_id: 0,
            item_bg_color: styleColors.brown,
            item_bg_radius: 75,
            image_view: [{ x: (380-50)/2, y: -70, w: 60, h: 60, key: 'previous_week', action: true }],
            image_view_count: 1,
            item_height: 0
          },
          {
            type_id: 1,
            item_bg_color: styleColors.dark_gray,
            item_bg_radius: 10,
            text_view: [
              { x: 0, y: 0, w: 380, h: 40, key: 'date_period', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 50, w: 380, h: 40, key: 'period', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 80, w: 380, h: 80, key: 'description', color: styleColors.white_smoke, text_size: 40, align_h: align.CENTER_H},
              { x: 0, y: 150, w: 380, h: 40, key: 'weekDay', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 200, w: 380, h: 40, key: 'status', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
            ],
            text_view_count: 5,
            image_view: [
              { x:410, y: 20, w: 64, h: 64, key: 'del_img', action: true },
              { x:410, y: 150, w: 64, h: 64, key: 'edit_img', action: true }
            ],
            image_view_count: 2,
            item_height: 250
          },
          {
            type_id: 2,
            item_bg_color: styleColors.dark_green,
            item_bg_radius: 10,
            text_view: [
              { x: 0, y: 0, w: 380, h: 40, key: 'date_period', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 50, w: 380, h: 40, key: 'period', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 80, w: 380, h: 80, key: 'description', color: styleColors.white_smoke, text_size: 40, align_h: align.CENTER_H},
              { x: 0, y: 150, w: 380, h: 40, key: 'weekDay', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 200, w: 380, h: 40, key: 'status', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
            ],
            text_view_count: 5,
            image_view: [
              { x:410, y: 20, w: 64, h: 64, key: 'del_img', action: true },
              { x:410, y: 150, w: 64, h: 64, key: 'edit_img', action: true }
            ],
            image_view_count: 2,
            item_height: 250
          },
          {
            type_id: 3,
            item_bg_color: styleColors.dark_blue,
            item_bg_radius: 10,
            text_view: [
              { x: 0, y: 0, w: 380, h: 40, key: 'date_period', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 50, w: 380, h: 40, key: 'period', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 80, w: 380, h: 80, key: 'description', color: styleColors.white_smoke, text_size: 40, align_h: align.CENTER_H},
              { x: 0, y: 150, w: 380, h: 40, key: 'weekDay', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
              { x: 0, y: 200, w: 380, h: 40, key: 'status', color: styleColors.white_smoke, text_size: 30, align_h: align.CENTER_H},
            ],
            text_view_count: 5,
            image_view: [
              { x:410, y: 20, w: 64, h: 64, key: 'del_img', action: true },
              { x:410, y: 150, w: 64, h: 64, key: 'edit_img', action: true }
            ],
            image_view_count: 2,
            item_height: 250
          },
          {
            type_id: 4,
            item_bg_color: styleColors.brown,
            item_bg_radius: 75,
            image_view: [{ x: (380-50)/2, y: 0, w: 80, h: 80, key: 'next_week', action: true }],
            image_view_count: 1,
            item_height: 0
          },
        ],
        item_config_count: 5,
        data_array: weekEvents,
        data_count: weekEvents.length,
        item_focus_change_func: (list, index, focus) => {},
        item_click_func: (item, index, data_key) => {
          if (data_key === 'del_img') {
                const deleteDialog = createModal({
                  content: 'Delete this event?',
                  autoHide: false,
                  show: false,
                  onClick: (keyObj) => {
                      const { type } = keyObj
                      if (type === MODAL_CONFIRM) {
                        DayEvents.deleteEventById(weekEvents[index].id)
                        scrollList.setProperty(prop.DELETE_ITEM, { index })
                        logger.log('Delete event: ' + JSON.stringify(weekEvents[index]))
                        deleteDialog.show(false)
                      } else {
                          logger.log('Delete canceled')
                          deleteDialog.show(false)
                      }
                  },
                })
                deleteDialog.show(true) 
          }
          else if (data_key === 'next_week'){
            const newWeek = new Date(period.getTime() + HOUR_MS * 24 * 7)
            console.log('new WEEk' + newWeek)
            push({
              url: 'page/list',
              params: JSON.stringify(newWeek)
            })
          }
          else if (data_key === 'previous_week'){
            const newWeek = new Date(period.getTime() - HOUR_MS * 24 * 7)
            console.log('new WEEk' + newWeek)
            push({
              url: 'page/list',
              params: JSON.stringify(newWeek)
            })
          }
          else if (data_key == 'edit_img'){
            logger.log('Calling edit menu...')
            push({
              url: 'page/event/edit/menu'
            })
          }
        },
        data_type_config: [
          {
            start: 0,
            end:  0,
            type_id: 0
          },
          {
            start: 1,
            end: separatedByColorInd.past,
            type_id: 1,
            visible: separatedByColorInd.past > 0
          },
          {
            start: separatedByColorInd.past == 0 ? 1 : separatedByColorInd.past+1,
            end: separatedByColorInd.current,
            type_id: 2,
            visible: separatedByColorInd.current > separatedByColorInd.past
          },
          {
            start: separatedByColorInd.current == 0 ? 1 : separatedByColorInd.current+1,
            end: weekEvents.length - 1,
            type_id: 3,
            visible: separatedByColorInd.future > 0
          },
          {
            start: weekEvents.length-1,
            end: weekEvents.length-1,
            type_id: 4
          }
        ],
        data_type_config_count: 5
    })
  }
})