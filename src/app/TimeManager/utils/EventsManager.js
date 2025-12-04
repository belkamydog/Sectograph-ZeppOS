import { log } from "@zos/utils"
import { HOUR_MS } from "./Constants"
import { readFileSync, writeFileSync } from '@zos/fs'
import { Event } from '../utils/Event'


export class EventsManager {
    logger = log.getLogger('EventManager.js')
    listOfCurrentDayEvents = []
    autoDelete //0-never 1-day, 2-week, 3-month,

    constructor(){
      this.autoDelete = 0
      this.initSettings()
    }

    initSettings(){
      const settings = this.readSettings()
      if (settings && settings.trim()) {
        this.autoDelete = JSON.parse(settings).clear_history
      }
      else {
        const new_set = {clear_history: 0}
        this.saveSettings(new_set)
      }
    }

    getAutoDelete(){
      return this.autoDelete
    }

    setAutoDelete(value){
      this.autoDelete = value
      const set = this.readSettings()
      if (set && set.trim()){
        let updatedSettings = JSON.parse(set)
        updatedSettings.clear_history = value
        this.saveSettings(updatedSettings)
      }
      this.uploadActualEvents()
    }

    repeateRuleForMainPage(ev){
      let tmRepeat = 0
      if (ev.repeat == 1) tmRepeat = 24 * HOUR_MS
      else if ( ev.repeat == 2) tmRepeat = 7 * 24 * HOUR_MS
      else if (ev.repeat == 3) tmRepeat = EventsManager.getMsToSameDateInNextMonth(ev)
      const start = new Date(ev.start)
      const end = new Date(ev.end)
      if (ev.repeat > 0) {
        let new_start = start.getTime()
        let new_end = end.getTime()
        let new_ev = {...ev}
        new_ev.repeat = 0
        new_start += HOUR_MS * tmRepeat
        new_end += HOUR_MS * tmRepeat
        new_ev.start = new Date(new_start)
        new_ev.end = new Date(new_end)
        while (this.eventsFilter(new_ev)){
          this.listOfCurrentDayEvents.push(EventsManager.addColorAnglesToEvent({...new_ev}))
          if (ev.repeat == 3) tmRepeat = EventsManager.getMsToSameDateInNextMonth(ev)
          new_start += HOUR_MS * tmRepeat
          new_end += HOUR_MS * tmRepeat
          new_ev.start = new Date(new_start)
          new_ev.end = new Date(new_end)
        }
      }
    }

    deleteFilter(event){
      if (event.repeat && event.repeat > 0) return false
      let result = false
      const now = new Date()
      const end = new Date(event.end)
      if (this.autoDelete == 1){
        if (now > end && (now.getTime() - end.getTime()) > HOUR_MS * 24){
          result = true
        }
      }
      else if (this.autoDelete == 2){
        if (now > end && (now.getTime() - end.getTime()) > HOUR_MS * 24 * 7){
          result = true
        }
      }
      else if (this.autoDelete == 3){
        if (now > end && (now.getTime() - end.getTime()) > HOUR_MS * 24 * 31){
          result = true
        }
      }
      return result
    }

    clearAllHistory(){
      writeFileSync({
        path: 'events',
        data: '',
        options: {
            encoding: 'utf8',
        }
      })
    }

    eventsFilter(event){
      let result = false
      let now = new Date()
      let startEv = new Date(event.start)
      let endEv = new Date(event.end)
      if ((startEv.getTime() - now.getTime()) <= (10 * HOUR_MS) && startEv >= now){
        result = true
      }
      else if ((now.getTime() - endEv.getTime()) <= 2 * HOUR_MS && now >= endEv){
        result = true

      }
      else if (now >= startEv && now <= endEv){
        result = true
      }
      return result 
    }

    getListOfALlEvents(){
      const file = EventsManager.readEvents()
      const result = []
      if (file && file.trim()){
        let tmp = JSON.parse(file)
        for (const ev of tmp){
          result.push(new Event(ev))
        }
      }
      else {
        this.logger.log('0 events loaded')
      }
      return result
    }

    getListOfEventsBeforeDate(date){
      const week = EventsManager.getWeekRange(date)
      const loaded = this.getListOfALlEvents()
      let resultList = []
      for (const ev of loaded){
        let tmRepeat = 0
        if (ev.repeat == 1) tmRepeat = 24 * HOUR_MS
        else if ( ev.repeat == 2) tmRepeat = 7 * 24 * HOUR_MS
        else if (ev.repeat == 3) tmRepeat = EventsManager.getMsToSameDateInNextMonth(ev)
        console.log('RES_LIST' + ev.repeat + ev.start)
        if (ev.repeat > 0) {
          const start = new Date(ev.start)
          const end = new Date(ev.end)
          let new_start = start.getTime()
          let new_end = end.getTime()
          let new_ev = {...ev}
          new_ev.repeat = 0
          if (new_start >= week.start.getTime()) 
              resultList.push(new Event(new_ev))  
          new_start += tmRepeat
          new_end += tmRepeat
          new_ev.start = new Date(new_start)
          new_ev.end = new Date(new_end)
          while (new_start <= week.end.getTime()) {
            if (new_start >= week.start.getTime()) 
              resultList.push(new Event(new_ev))
            if (ev.repeat == 3) tmRepeat = EventsManager.getMsToSameDateInNextMonth(ev)
            new_start += tmRepeat
            new_end += tmRepeat
            new_ev.start = new Date(new_start)
            new_ev.end = new Date(new_end)
          }
        }
        else {
          const start = new Date(ev.start)
          if ( start >= week.start && start <= week.end)
            resultList.push(ev)
        }
      }
      resultList.sort((a, b) => new Date(a.start) - new Date(b.start));
      return resultList
    }

    uploadActualEvents(){
      const file = EventsManager.readEvents()
      this.listOfCurrentDayEvents = []
      let afterDeleteFilterArr = []
      if (file && file.trim()){
        const loadedEvents = JSON.parse(file)
        for (const ev of loadedEvents){
          if (!this.deleteFilter(ev)){
            afterDeleteFilterArr.push(ev)
            this.repeateRuleForMainPage(ev)
            if (this.eventsFilter(ev)){
              const updatedEvent = EventsManager.addColorAnglesToEvent(ev)
              this.listOfCurrentDayEvents.push(updatedEvent)
            }
          }
          else console.log('DELETE '+ JSON.stringify(ev))
        }
        EventsManager.writeEvents(afterDeleteFilterArr)
      }
      else this.logger.log('0 events loaded')
    }

    addEvent(event){
      const loaded_events = EventsManager.readEvents()
      let result = []
      if (loaded_events && loaded_events.trim()){
         for (const ev of JSON.parse(loaded_events)){
            const eventWithId = {
              id: !event.id ? EventsManager.generateEventId(): event.id,
              start: ev.start,
              end: ev.end, 
              description: ev.description,
              color: ev.color,
              repeat: ev.repeat
            } 
            result.push(eventWithId)
         }
         result.push(event)
      }
      else result.push(event)
      EventsManager.writeEvents(result)
      this.uploadActualEvents()
    }

    editStartDate(event){
      const loadedEvents = EventsManager.readEvents()
      let result = []
      if (loadedEvents && loadedEvents.trim()){
        const events = JSON.parse(loadedEvents)
        for (const e of events){
          if (e.id == event.id) {
            e.start = event.start
          }
          result.push(e)
        }
        EventsManager.writeEvents(result)
      }
      this.uploadActualEvents()
    }

    editEndDate(event){
      const loadedEvents = EventsManager.readEvents()
      let result = []
      if (loadedEvents && loadedEvents.trim()){
        const events = JSON.parse(loadedEvents)
        for (const e of events){
          if (e.id == event.id) {
            e.end = event.end
          }
          result.push(e)
        }
        EventsManager.writeEvents(result)
      }
      this.uploadActualEvents()
    }

    editEventDescription(event){
      const loadedEvents = EventsManager.readEvents()
      let result = []
      if (loadedEvents && loadedEvents.trim()){
        const events = JSON.parse(loadedEvents)
        for (const e of events){
          if (e.id == event.id) {
            e.description = event.description
          }
          result.push(e)
        }
        EventsManager.writeEvents(result)
      }
      this.uploadActualEvents()
    }

    deleteEventById(id){
      const loadedEvents = EventsManager.readEvents()
      let result = []
      if (loadedEvents && loadedEvents.trim()){
        const events = JSON.parse(loadedEvents)
        for (const e of events){
          if (e.id != id) {
            result.push(e)
          }
        }
        EventsManager.writeEvents(result)
      }
      this.uploadActualEvents()
    }

    getListOfCurrentDayEvents(){
      this.listOfCurrentDayEvents.splice(0, this.listOfCurrentDayEvents.length) 
      this.uploadActualEvents()
      return this.listOfCurrentDayEvents
    }

    static readEvents(){
      return readFileSync({
          path: 'events',
          options: {
            encoding: 'utf8',
          }
        })
    }

    static writeEvents(events){
      writeFileSync({
        path: 'events',
        data: JSON.stringify(events),
        options: {
            encoding: 'utf8',
        }
      })
    }

    readSettings(){
      return readFileSync({
          path: 'settings',
          options: {
            encoding: 'utf8',
          }
        })
    }

    saveSettings(settings){
      writeFileSync({
        path: 'settings',
        data: JSON.stringify(settings),
        options: {
            encoding: 'utf8',
        }
      })
    }

    static generateEventId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    static addColorAnglesToEvent(event){
       const angles = EventsManager.calculateAngles(event, Date.now())
       const result = {
          id: event.id,
          start: event.start,
          end: event.end, 
          description: event.description,
          startAngle: angles.startAngle,
          endAngle: angles.endAngle,
          color: event.color
        }
        return result
    }

    static calculateAngles(event, timeNow){
      let startAngle = EventsManager.convertTimeToAngle(event.start)
      let endAngle = EventsManager.convertTimeToAngle(event.end)
      const deleteTime = new Date(new Date(timeNow).getTime()- 2 * HOUR_MS)
      if (new Date(event.start) < deleteTime) {
        startAngle = EventsManager.convertTimeToAngle(deleteTime)
      }
      else if(new Date(event.end).getTime() > timeNow+ 10 * HOUR_MS){
        endAngle = EventsManager.convertTimeToAngle(timeNow + 10 * HOUR_MS)
      }
      startAngle = startAngle > endAngle ? (startAngle-360) : startAngle
      return {startAngle: startAngle, endAngle: endAngle}
    }

    static convertTimeToAngle(time){
      // 1h => 30 grad
      // 1h => 60 min => 30/60 = > 0.5 grad/min
      let date = new Date(time)
      let result = (date.getHours() * 60 + date.getMinutes()) * 0.5
      // normalization
      return result >= 360 ? result % 360 : result
    }
    
    static convertToCirCoord(coordinate) {
      let result = 0
      if (coordinate >= 240) result = coordinate - 240
      else result = 240 - coordinate
      return result
    }

    static isThisEvent(x, y, event) {
      const distance = Math.sqrt((x - 240) ** 2 + (y - 240) ** 2);
      if (distance > 200) {
        return false;
      }
      let pointAngle = 90 - Math.atan2(240 - y, x - 240) * (180 / Math.PI);
      if (pointAngle < 0) pointAngle = 360 + pointAngle
      if (event.startAngle <= event.endAngle) {
        if (event.startAngle < 0 ) pointAngle = pointAngle - 360 // ? if 12 to 13

        return pointAngle >= event.startAngle && pointAngle <= event.endAngle;
      } else {
        return pointAngle >= event.startAngle || pointAngle <= event.endAngle;
      }
    }

    static getMsToSameDateInNextMonth(ev) {
        const start = new Date(ev.start)
        const currentDay = start.getDate()
        let nextMonth = start.getMonth() + 1
        let nextYear = start.getFullYear()
        if (nextMonth > 11) {
            nextMonth = 0
            nextYear += 1
        }
        const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate()
        const nextDay = Math.min(currentDay, daysInNextMonth)
        const nextEventDate = new Date(nextYear, nextMonth, nextDay)
        const diffInMs = nextEventDate.getTime() - start.getTime()
        return diffInMs
    }

    static getWeekRange(date) {
      const currentDate = new Date(date);
      const dayOfWeek = currentDate.getDay(); // 0-воскресенье, 1-понедельник, ..., 6-суббота
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday, end: sunday };
    }
}