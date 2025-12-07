import { getText } from '@zos/i18n'
import {log} from '@zos/utils'
import { push } from '@zos/router'
import { Time } from '@zos/sensor'
import { DayEvents, wfNumbers} from '../utils/Globals';
import { onGesture, GESTURE_LEFT } from '@zos/interaction'
import { HOUR_MS, WEEK_DAYS } from '../utils/Constants';
import { EventsManager } from '../utils/EventsManager';
import { Event } from '../utils/Event';
import { styleColors } from '../utils/Constants'
import { createWidget, widget, prop, align, event } from '@zos/ui'

Page({
  logger: log.getLogger('index.js'),

  widgets:{
    circle: null,
    canvas: null,
    background: null,
    hourArrow: null,
    destroyArrow: null,
    minuteArrow: null,
    digitTime: null,
    date,
    wfNumbers:{
      _0: null,
      _1: null,
      _2: null,
      _3: null,
      _4: null,
      _5: null,
      _6: null,
      _7: null,
      _8: null,
      _9: null,
      _10: null,
      _11: null,
    }
  },

  registerGes(){
    onGesture({
        callback: (event) => {
          if (event === GESTURE_LEFT) {
            push({
              url: 'page/menu',
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

  initWfNumbers() {
    const centerX = 240;
    const centerY = 240;
    const radius = 195;
    wfNumbers.initWatchFace(new Date().getHours())
    const numbers = wfNumbers.getTimePointDigits()
    let angle = -90
    for (let i = 0; i < 12; i++){
      const angleInRadians = angle * Math.PI / 180;
      const x = centerX + radius * Math.cos(angleInRadians) - 20;
      const y = centerY + radius * Math.sin(angleInRadians) - 20;
      angle += 30
      this.widgets.wfNumbers[`_${i}`] = createWidget(widget.TEXT, {
        x: Math.round(x),
        y: Math.round(y),
        w: 50,
        h: 50,
        color: 0xFFFFFF,
        font: 'fonts/Digiface (Rus by MarkStarikov2014) Regular.ttf',
        text_size: 40,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: numbers[i]
      });
    }
  },

  initArrows(){
    this.destroyArrow = createWidget(widget.IMG,{
      x: 0,
      y: 0,
      h: 480,
      w: 480,
      center_x: 240,
      center_y: 240,
      pos_x: 240,
      pos_y: 0,
      angle: EventsManager.convertTimeToAngle(new Date() - HOUR_MS*2),
      src: 'arrows/minute.png'
    })
    this.hourArrow = createWidget(widget.TIME_POINTER, {
      hour_centerX: 240,
      hour_centerY: 240,
      hour_posX: 2,
      hour_posY: 220,
      hour_path: 'arrows/hour.png',
    })
  },

  iniitCentralBackground(){
    this.circle = createWidget(widget.CIRCLE, {
      center_x: 240,
      center_y: 240,
      radius: 111,
      color: styleColors.white_smoke,
    })
    this.circle = createWidget(widget.CIRCLE, {
      center_x: 240,
      center_y: 240,
      radius: 108,
      color: styleColors.black,
    })
    this.circle = createWidget(widget.CIRCLE, {
      center_x: 240,
      center_y: 240,
      radius: 100,
      color: styleColors.white_smoke,
    })
  },

  updateWfNumbers(){
    wfNumbers.updateWatchFaceDigit(new Date().getHours())
    const numbers = wfNumbers.getTimePointDigits()
    for (let i = 0; i < 12; i++){
      this.widgets.wfNumbers[`_${i}`].setProperty(prop.TEXT, numbers[i])
    }
  },

  updateWidgets(){
    this.updateWfNumbers()
    this.destroyArrow.setProperty(prop.ANGLE, EventsManager.convertTimeToAngle(new Date() - HOUR_MS * 2))
    this.digitTime.setProperty(prop.TEXT, Event.addZero(this.timeSensor.getHours().toString()) + 
                              ':' + Event.addZero(this.timeSensor.getMinutes().toString()))
      this.canvas.clear({
        x: 0,
        y: 0,
        w: 480,
        h: 480
      })
      this.renderEvents(DayEvents.getListOfCurrentDayEvents())
  },


  initDigitalTime(){
    const timeSensor = new Time()
    const digitTime = createWidget(widget.TEXT, {
      x: (480-190)/2,
      y: (480-170)/2,
      w: 180,
      h: 180,
      color: 0x0000,
      text_size: 70,
      font: 'fonts/Digiface (Rus by MarkStarikov2014) Regular.ttf',
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: Event.addZero(timeSensor.getHours().toString()) + ':' + Event.addZero(timeSensor.getMinutes().toString())
    })
    const now = new Date()
    const date = createWidget(widget.TEXT, {
      x: (480-180)/2,
      y: 105,
      w: 180,
      h: 180,
      color: 0x0000,
      text_size: 25,
      font: 'fonts/Digiface (Rus by MarkStarikov2014) Regular.ttf',
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: Event.addZero(now.getDate().toString()) + 
        '.' + Event.addZero((now.getMonth()+1).toString()) + '.' + now.getFullYear().toString()
    })

    const weekDay = createWidget(widget.TEXT, {
      x: (480-180)/2,
      y: 200,
      w: 180,
      h: 180,
      color: 0x0000,
      text_size: 21,
      font: 'fonts/Digiface (Rus by MarkStarikov2014) Regular.ttf',
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: getText(WEEK_DAYS[now.getDay()])
    })

    const self = this
    timeSensor.onPerMinute(function cb() {
      self.updateWidgets()
      date.setProperty(widget.TEXT, Event.addZero(now.getDate().toString()) + 
      '. ' + Event.addZero((now.getMonth()+1).toString()) + '. ' + now.getFullYear().toString())             
    })
  },

  initCanvas(){
    this.canvas = createWidget(widget.CANVAS, {
      x: 0,
      y: 0,
      w: 480,
      h: 480,
      alpha: 100 
    })
    this.canvas.addEventListener(event.CLICK_UP, function cb(info) {
      for (const event of DayEvents.getListOfCurrentDayEvents()){
        if (EventsManager.isThisEvent(info.x, info.y, event)){
          push({
            url: 'page/event',
            params: JSON.stringify(event),
          })
        }
      }
    })
  },

  drawEvent(event){
    const ev = new Event(event)
    this.canvas.drawArc({
      center_x: 240,
      center_y: 240,
      radius_x: 225,
      radius_y: 225,
      start_angle: event.startAngle-90,
      end_angle: event.endAngle-90,
      color: event.color
    })
  },

  renderEvents(events){
    for (const event of events) {
      this.drawEvent(event);
    }
  },

  onInit(params){
    this.initBg()
    this.registerGes()
    this.initWfNumbers()
    this.initArrows()
    this.initCanvas()
    this.renderEvents(DayEvents.getListOfCurrentDayEvents())
    this.iniitCentralBackground()
    this.initDigitalTime()
  }

})
