import { createWidget, widget, prop, align, event } from '@zos/ui'
import { onGesture, GESTURE_LEFT, GESTURE_RIGHT} from '@zos/interaction'
import { push, launchApp } from '@zos/router'
import { exit } from '@zos/app-service'
import { getText } from '@zos/i18n'
import { Time } from '@zos/sensor'
import {log} from '@zos/utils'
import { eventServise, wfNumbers} from '../utils/Globals';
import { HOUR_MS, WEEK_DAYS_SHORT } from '../utils/Constants';
import { Event } from '../utils/models/Event';
import { styleColors } from '../utils/Constants'
import { EventService } from '../utils/services/EventService'

import { BasePage } from '@zeppos/zml/base-page'
import { color } from 'chart.js/helpers'


const logger = log.getLogger('Main page')

Page(
  BasePage({
    widgets:{
      canvas: null,
      background: null,
      hourArrow: null,
      destroyArrow: null,
      minuteArrow: null,
      digitTime: null,
      date: null,
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
            else if (event === GESTURE_RIGHT) {
              exit()
            }
            return true
          },
        })
    },

    initBg(){
      createWidget(widget.CIRCLE, {
        center_x: 240,
        center_y: 240,
        radius: 240,
        color: styleColors.white_smoke,
      })
      createWidget(widget.CIRCLE, {
        center_x: 240,
        center_y: 240,
        radius: 235,
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
        let value = numbers[i]
        let size = 40
        if (numbers[i] == 12) {
          size = 30
          value = '☀️'
        }
        else if (numbers[i] == 0){
          size = 30
          value = '🌙'
        } 
        angle += 30
        this.widgets.wfNumbers[`_${i}`] = createWidget(widget.TEXT, {
          x: Math.round(x),
          y: Math.round(y),
          w: 52,
          h: 52,
          color: 0xFFFFFF,
          font: 'fonts/Digiface (Rus by MarkStarikov2014) Regular.ttf',
          text_size: size,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text: value
        });
      }
    },

    initArrows(){
      this.widgets.destroyArrow = createWidget(widget.IMG,{
        x: 0,
        y: 0,
        h: 480,
        w: 480,
        center_x: 240,
        center_y: 240,
        pos_x: 240,
        pos_y: 0,
        angle: EventService.convertTimeToAngle(new Date() - HOUR_MS*2),
        src: 'arrows/deadLine.png'
      })
      this.widgets.hourArrow = createWidget(widget.TIME_POINTER, {
        hour_centerX: 240,
        hour_centerY: 240,
        hour_posX: 2,
        hour_posY: 240,
        hour_path: 'arrows/hour.png',
        minute_centerX: 240,
        minute_centerY: 240,
        minute_posX: 2,
        minute_posY: 240,
        minute_path: 'arrows/minute.png',
      })
    },

    iniitCentralBackground(){
      createWidget(widget.CIRCLE, {
        center_x: 240,
        center_y: 240,
        radius: 111,
        color: styleColors.white_smoke,
      })
      createWidget(widget.CIRCLE, {
        center_x: 240,
        center_y: 240,
        radius: 105,
        color: styleColors.black,
      })
    },

    initDigitalTime(){
      const timeSensor = new Time()
      this.widgets.digitTime = createWidget(widget.TEXT, {
        x: (480-190)/2,
        y: (480-170)/2,
        w: 180,
        h: 180,
        color: styleColors.white_smoke,
        text_size: 70,
        font: 'fonts/Digiface (Rus by MarkStarikov2014) Regular.ttf',
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: Event.addZero(timeSensor.getHours().toString()) + ':' + Event.addZero(timeSensor.getMinutes().toString())
      })
      const now = new Date()
      const date = createWidget(widget.TEXT, {
        x: (480-180)/2,
        y: 95,
        w: 180,
        h: 180,
        color: styleColors.white_smoke,
        text_size: 40,
        font: 'fonts/Digiface (Rus by MarkStarikov2014) Regular.ttf',
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: Event.addZero(now.getDate().toString()) + 
          '.' + Event.addZero((now.getMonth()+1).toString())
      })
      date.addEventListener(event.SELECT, function() {
        launchApp({
          appId: SYSTEM_APP_CALENDAR,
          native: true
        })
      })

      const weekDay = createWidget(widget.TEXT, {
        x: (480-180)/2,
        y: 210,
        w: 180,
        h: 180,
        color: styleColors.white_smoke,
        text_size: 40,
        font: 'fonts/Digiface (Rus by MarkStarikov2014) Regular.ttf',
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: getText(WEEK_DAYS_SHORT[now.getDay()])
      })

      const self = this
      timeSensor.onPerMinute(function cb() {
        self.updateWidgets()
        date.setProperty(widget.TEXT, Event.addZero(now.getDate().toString()) + 
        '. ' + Event.addZero((now.getMonth()+1).toString()) + '. ' + now.getFullYear().toString())             
      })
    },

    initCanvas(){
      this.widgets.canvas = createWidget(widget.CANVAS, {
        x: 0,
        y: 0,
        w: 480,
        h: 480,
        alpha: 100 
      })
      this.widgets.canvas.addEventListener(event.CLICK_UP, function cb(info) {
        for (const event of eventServise.getActualEvents()){
          if (EventService.isThisEvent(info.x, info.y, event)){
            push({
              url: 'page/event',
              params: JSON.stringify(event),
            })
          }
        }
      })
    },

    updateWfNumbers(){
      logger.log('Wf numbers updated')
      wfNumbers.updateWatchFaceDigit(new Date().getHours())
      const numbers = wfNumbers.getTimePointDigits()
      for (let i = 0; i < 12; i++){
        if (numbers[i] == 12) this.widgets.wfNumbers[`_${i}`].setProperty(prop.TEXT, '☀️') 
        else if (numbers[i] == 0) this.widgets.wfNumbers[`_${i}`].setProperty(prop.TEXT, '🌙')
        else this.widgets.wfNumbers[`_${i}`].setProperty(prop.TEXT, numbers[i])
      }
    },

    updateWidgets(){
      logger.log('updating main page ...')
      const now = new Date()
      this.updateWfNumbers()
      this.widgets.destroyArrow.setProperty(prop.ANGLE, EventService.convertTimeToAngle(now - HOUR_MS * 2))
      this.widgets.digitTime.setProperty(prop.TEXT, 
                                Event.addZero(now.getHours().toString()) + 
                                ':' +
                                Event.addZero(now.getMinutes().toString()))
        this.widgets.canvas.clear({
          x: 0,
          y: 0,
          w: 480,
          h: 480
        })
        this.renderEvents(eventServise.getActualEvents())
        logger.log('main page updated')
    },

    drawEvent(event){
      const ev = new Event(event)
      this.widgets.canvas.drawArc({
        center_x: 240,
        center_y: 240,
        radius_x: 235,
        radius_y: 235,
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

    onCall(req) {
      console.log(req)
    },

    getDataFromMobile() {
      return this.request({
        method: 'TEST_CONNECTION',
        params: {
          param1: 'param1',
        },
      })
        .then((result) => {
          console.log('result=>', result)
        })
        .catch((error) => {
          console.log('error=>', error)
        })
    },

    getDataFromNetwork() {
      this.httpRequest({
        method: 'get',
        url: 'https://bible-api.com/john%203:16',
      }).then((result) => {
        console.log('result.status=>', JSON.stringify(result.status))
        console.log('result.statusText=>', JSON.stringify(result.statusText))
        console.log('result.headers=>', JSON.stringify(result.headers))
        console.log('result.body=>', JSON.stringify(result.body))
      })
    },

    onInit(params){
      this.initBg()
      this.registerGes()
      this.initWfNumbers()
      this.initArrows()
      this.initCanvas()
      this.renderEvents(eventServise.getActualEvents())
      this.iniitCentralBackground()
      this.initDigitalTime()
    }
  })
)
