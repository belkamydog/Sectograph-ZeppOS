import { getText } from '@zos/i18n'
import * as Styles from 'zosLoader:./index.[pf].layout.js'
import { calculateAngles, isPointInSector } from '../utils/calculate';
import hmUI from '@zos/ui'

const MOCK_EVENTS = [
  { start: {h: 0, m: 0}, end: {h:1, m:0}, description: 'Do nothing' , date: '18.11.2025'},
  { start: {h: 3, m: 0}, end: {h:6, m:0}, description: 'Do work' , date: '18.11.2025'},
  { start: {h: 11, m: 0}, end: {h:0, m:0}, description: 'Time of tea' , date: '18.11.2025'}
];

const EVENT_COLORS = [
  0x2E8B57, // Зеленый - работа
  0x1E90FF, // Синий - встречи
  0xFF6347, // Красный - важное
  0xFFD700, // Желтый - личное
  0x9932CC, // Фиолетовый - здоровье
  0xFF69B4, // Розовый - развлечения
  0xFF8C00, // Оранжевый - спорт
  0x00CED1  // Бирюзовый - обучение
];


const WIDGETS = {
  canvas: null,
  background: null,
  arrows: {
    hour: null,
    minute: null
  }
}
let color = 0;

Page({
  
  initBackground(){
    WIDGETS.background = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      src: 'background.png'
    })
  },
  initArrows(){
    WIDGETS.arrows.hour = hmUI.createWidget(hmUI.widget.TIME_POINTER, {
      hour_centerX: 240,
      hour_centerY: 240,
      hour_posX: 2,
      hour_posY: 220,
      hour_path: 'arrows/hour.png',
    }),
    WIDGETS.arrows.minute = hmUI.createWidget(hmUI.widget.TIME_POINTER, {
      minute_centerX: 240,
      minute_centerY: 240,
      minute_posX: 2,
      minute_posY: 220,
      minute_path: 'arrows/minute.png',
    })
  },
  initCanvas(){
    WIDGETS.canvas = hmUI.createWidget(hmUI.widget.CANVAS, {
      x: 0,
      y: 0,
      w: 480,
      h: 480,
      alpha: 60 
    })
    WIDGETS.canvas.addEventListener(hmUI.event.CLICK_UP, function cb(info) {
      // console.log(info.x)
      // console.log(info.y)
      MOCK_EVENTS.forEach(event => {
        let {startAngle, endAngle } = calculateAngles(event)
        // console.log("start: " + startAngle + " end " + endAngle )
        if (isPointInSector(info.x, info.y, 240, 240, 240, startAngle, endAngle)){
          console.log(event.description)
        }
      })
    })

  },
  drawEvent(event){
    let {startAngle, endAngle} = calculateAngles(event)
    // console.log ("S " + startAngle + " " +  "E " + endAngle)
    WIDGETS.canvas.drawArc({
      center_x: 240,
      center_y: 240,
      radius_x: 225,
      radius_y: 225,
      start_angle: startAngle-90,
      end_angle: endAngle-90,
      color:  EVENT_COLORS[color],
    })
    color++
  },
  getEvents(){
    return MOCK_EVENTS
  },
  iterateEvents(events){
    events.forEach(event => 
        this.drawEvent(event)
    )
  },
  build() {
    this.initBackground()
    this.initCanvas()
    this.initArrows()
    this.iterateEvents(this.getEvents())
  }
})
