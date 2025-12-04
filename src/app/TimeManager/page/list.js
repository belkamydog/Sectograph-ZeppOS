import { createWidget, widget, prop, align } from '@zos/ui'
import { createModal, MODAL_CONFIRM } from '@zos/interaction'
import { DayEvents } from '../utils/Globals';
import { push } from '@zos/router'
import { getText } from '@zos/i18n'
import { styleColors } from '../utils/Constants';
import {log} from '@zos/utils'
import { EventsManager } from '../utils/EventsManager';


Page({
  logger: log.getLogger('list.js'),

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
      const period = EventsManager.getWeekRange(new Date())
      createWidget(widget.TEXT, {
        text: period.start.getDate() + '.'+ period.start.getMonth() + ' - ' + period.end.getDate() + '.'+ period.end.getMonth(),
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

  addLinkToDeleteAddBtn(arrEv){
    const weekDays = [
      'Sunday' ,   // Воскресенье
      'Monday',    // Понедельник
      'Tuesday',   // Вторник
      'Wednesday', // Среда
      'Thursday',  // Четверг
      'Friday',    // Пятница
      'Saturday',  // Суббота
    ];
    let result = []
    for (let i of arrEv){
      const wd = new Date(i.start).getDay()
      i.weekDay = getText(weekDays[wd])
      i.del_img = 'delete.png'
      result.push(i)
    } 
    const add = {
      add_btn: 'add_btn.png', 
      add_btn_text: 'New event',
      description: ' ',
      date_period: ' ',
      period: ' ',
      status: ' '
    }
    result.push(add)
    return result
  },

  ifEmptyListOfEventsLabel(){
    createWidget(widget.TEXT, {
      text: getText('Create event'),
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

  onInit() {
    this.initBg()
    this.initTitle();
    EventsManager.getWeekRange(date)
    const allEvents = this.addLinkToDeleteAddBtn(DayEvents.getListOfEventsBeforeDate(new Date()))
    if (allEvents.length == 1) 
        this.ifEmptyListOfEventsLabel()
    if (allEvents){
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
              type_id: 1,
              item_bg_color: styleColors.dark_gray,
              item_bg_radius: 10,
              text_view: [
                { x: 20, y: 0, w: 340, h: 80, key: 'description', color: 0xffffff, text_size: 35, align_h: align.CENTER_H },
                { x: 20, y: 60, w: 380/2, h: 40, key: 'date_period', color: 0xffffff, text_size: 30, align_h: align.LEFT},
                { x: 380/2, y: 60, w: 380/2, h: 40, key: 'period', color: 0xffffff, text_size: 30, align_h: align.LEFT},
                { x: 0, y: 100, w: 380, h: 40, key: 'weekDay', color: 0xffffff, text_size: 30, align_h: align.CENTER_H},
                { x: 0, y: 150, w: 380, h: 40, key: 'status', color: 0xffffff, text_size: 30, align_h: align.CENTER_H},
              ],
              text_view_count: 5,
              image_view: [{ x:410, y: 65, w: 64, h: 64, key: 'del_img', action: true }],
              image_view_count: 1,
              item_height: 200
            },
            {
              type_id: 2,
              item_bg_color: styleColors.brown,
              item_bg_radius: 75,
              image_view: [{ x: (380-80)/2, y: 0, w: 80, h: 80, key: 'add_btn', action: true }],
              image_view_count: 1,
              item_height: 0
            },
          ],
          item_config_count: 2,
          data_array: allEvents,
          data_count: allEvents.length,
          item_focus_change_func: (list, index, focus) => {
          },
          item_click_func: (item, index, data_key) => {
            if (data_key === 'del_img') {
                  const deleteDialog = createModal({
                    content: 'Delete this event?',
                    autoHide: false,
                    show: false,
                    onClick: (keyObj) => {
                        const { type } = keyObj
                        if (type === MODAL_CONFIRM) {
                            DayEvents.deleteEventById(allEvents[index].id)
                            scrollList.setProperty(prop.DELETE_ITEM, { index })
                            deleteDialog.show(false)
                            // this.onInit()
                        } else {
                            deleteDialog.show(false)
                        }
                    },
                  })
                  deleteDialog.show(true) 
            } else if (data_key === 'add_btn'){
                const newEventDialog = createModal({
                    content: 'Create new event?',
                    autoHide: false,
                    show: false,
                    onClick: (keyObj) => {
                        const { type } = keyObj
                        if (type === MODAL_CONFIRM) {
                          push ({
                            url: 'page/event/description'
                          })
                          this.onInit()
                        } else {
                            newEventDialog.show(false)
                        }
                    },
                  })
                  newEventDialog.show(true) 
            }
          },
          data_type_config: [
            {
              start: 0,
              end: allEvents.length-2,
              type_id: 1
            },
            {
              start: allEvents.length-1,
              end: allEvents.length-1,
              type_id: 2
            }
          ],
          data_type_config_count: 2
      })
    }
  }
})