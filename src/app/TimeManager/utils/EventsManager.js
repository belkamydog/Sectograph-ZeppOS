import { log } from "@zos/utils"
import { HOUR_MS } from "./Constants"
import { readFileSync, writeFileSync } from '@zos/fs'
import { Event } from '../utils/Event'

const logger = log.getLogger('Event Manager')

export class EventsManager {
    logger = log.getLogger('EventManager.js')
    /**
     * List of actual events in range [-2hours <= now <= +10 hours]
     */
    listOfCurrentDayEvents = []
    /**
     * Need for auto-delete events setting
     * 0-never 1-dayly, 2-weekly, 3-monthly,
     */
    autoDelete

    constructor(){
      this.autoDelete = 0
      this.initSettings()
    }

    /**
     * Event settings module
     */
    /**
     * Create or update file with app settings from device side
     */
    initSettings(){
      logger.log('init settings')
      try{
        const settings = this.readSettings()
        this.autoDelete = JSON.parse(settings).clear_history
        logger.log('Loading settings done, autoDelete = '+ this.autoDelete)
      } catch(Error){
        logger.error('Init settings falied', Error)
        logger.log('Set default settings...')
        const new_set = { clear_history: 0 }
        this.saveSettings(new_set)
      }
    }
    /**
     * Set auto-delete value
     * @param  0 never delete, 1 day delete,  2 week delete, 3 month delete,
     */
    setAutoDelete(value){
      this.autoDelete = value
      const set = this.readSettings()
      if (set && set.trim()){
        let updatedSettings = JSON.parse(set)
        updatedSettings.clear_history = value
        logger.log('Settings updated. New auto-delete value: ' +  value)
        this.saveSettings(updatedSettings)
      }
      this.uploadActualEvents()
    }
    /**
     * Get auto-delete value
     * @returns  0 never delete, 1 day delete,  2 week delete, 3 month delete,
     */
    getAutoDelete(){ return this.autoDelete }

    /**
     * Clear all of events
     */
    clearAllHistory(){
      writeFileSync({
        path: 'events',
        data: '',
        options: {
          encoding: 'utf8',
        }
      })
      logger.log('All events cleared')
    }

    /**
     * Checking event to repeat ON field and
     * add next repeating events to the list of events if it in range [-2h <= now <= +10h]
     * @param ev Checking event
     */
    repeateRuleForMainPage(ev){
      let repeatTimeMs = EventsManager.getRepeatTimeMs(ev)
      if (ev.repeat > 0) {
        logger.log('Repeating event start')
        let new_start = new Date(ev.start).getTime()
        let new_end = new Date(ev.end).getTime()
        let repeated_event = {...ev}
        repeated_event.repeat = 0
        new_start += HOUR_MS * repeatTimeMs
        new_end += HOUR_MS * repeatTimeMs
        repeated_event.start = new Date(new_start)
        repeated_event.end = new Date(new_end)
        logger.log('Repeat: ' + JSON.stringify(repeated_event))
        while (this.eventsFilter(repeated_event)){
          this.listOfCurrentDayEvents.push(EventsManager.addAnglesToEvent({...repeated_event}))
          if (ev.repeat == 3) repeatTimeMs = EventsManager.getMsToSameDateInNextMonth(ev)
          new_start += HOUR_MS * repeatTimeMs
          new_end += HOUR_MS * repeatTimeMs
          repeated_event.start = new Date(new_start)
          repeated_event.end = new Date(new_end)
          logger.log('Repeat: ' + JSON.stringify(repeated_event))
        }
      }
    }

    /**
     * Checking events to pass auto-delete filter
     * @param {*} event 
     * @returns true if event does not pass auto-delete filter
     */
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
      if (result) logger.log( 'Auto-delete = ' + this.autoDelete + ' Delete: ' + event)
      return result
    }

    /**
     * Checking events to pass filter [-2h now +10h]
     * @param {*} event 
     * @returns true if events time pass filter [-2h now +10h]
     */
    eventsFilter(event){
      let now = new Date()
      let startEv = new Date(event.start)
      let endEv = new Date(event.end)
      return  ((startEv.getTime() - now.getTime()) <= (10 * HOUR_MS) && startEv >= now) || 
              ((now.getTime() - endEv.getTime()) <= 2 * HOUR_MS && now >= endEv) ||
              (now >= startEv && now <= endEv)
    }

    /**
     * Get list  all events
     * @returns list of all events in the file events
     */
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

    /**
     * Get list of events in the period
     * @param {*} period expected {start: object Date , end: object Date}
     * @returns list of period events
     */
    getListOfEventsInPeriod(period){
      logger.log('Creating list of events in period: ' + JSON.stringify(period))
      const loaded = this.getListOfALlEvents()
      let resultList = []
      for (const ev of loaded){
        let repeatTimeMs = EventsManager.getRepeatTimeMs(ev)
        if (ev.repeat > 0) {
          let new_start = new Date(ev.start).getTime()
          let new_end = new Date(ev.end).getTime()
          let repeated_event = {...ev}
          repeated_event.repeat = 0
          if (new_start >= period.start.getTime()) 
              resultList.push(new Event(repeated_event))  
          new_start += repeatTimeMs
          new_end += repeatTimeMs
          repeated_event.start = new Date(new_start)
          repeated_event.end = new Date(new_end)
          while (new_start <= period.end.getTime()) {
            if (new_start >= period.start.getTime()) 
              resultList.push(new Event(repeated_event))
            if (ev.repeat == 3) repeatTimeMs = EventsManager.getMsToSameDateInNextMonth(ev)
            new_start += repeatTimeMs
            new_end += repeatTimeMs
            repeated_event.start = new Date(new_start)
            repeated_event.end = new Date(new_end)
          }
        }
        else {
          const start = new Date(ev.start)
          if ( start >= period.start && start <= period.end)
            resultList.push(ev)
        }
      }
      resultList.sort((a, b) => new Date(a.start) - new Date(b.start));
      logger.log('List of events created...:' + resultList)
      return resultList
    }

    /**
     * Get list of events in the current week
     * @param {*} date expected date in needs week 
     * @returns list of current week events
     */
    getListOfEventsInCurrentWeek(date){
      logger.log('Creating events list in current week...')
      const week = EventsManager.getWeekRange(date)
      console.log('WEEK ' + JSON.stringify(week))
      const loaded = this.getListOfALlEvents()
      for(const i of loaded)
        console.log('ALL ' + JSON.stringify(i))
      let resultList = []
      for (const ev of loaded){
        let repeatTimeMs = EventsManager.getRepeatTimeMs(ev)
        if (ev.repeat > 0) {
          const start = new Date(ev.start)
          const end = new Date(ev.end)
          let new_start = start.getTime()
          let new_end = end.getTime()
          let new_ev = {...ev}
          new_ev.repeat = 0
          if (new_start >= week.start.getTime() && new_start <= week.end.getTime() ){
            resultList.push(new Event(new_ev))  
            console.log('SINGLE ' + JSON.stringify(week.start + ' <= ' + new Date(new_start)))
          } 
          new_start += repeatTimeMs
          new_end += repeatTimeMs
          new_ev.start = new Date(new_start)
          new_ev.end = new Date(new_end)
          while (new_start <= week.end.getTime()) {
            if (new_start >= week.start.getTime()) 
              resultList.push(new Event(new_ev))
            if (ev.repeat == 3) repeatTimeMs = EventsManager.getMsToSameDateInNextMonth(ev)
            new_start += repeatTimeMs
            new_end += repeatTimeMs
            new_ev.start = new Date(new_start)
            new_ev.end = new Date(new_end)
          }
        }
        else {
          const start = new Date(ev.start)
          if ( start >= week.start && start <= week.end){
            resultList.push(ev)
          }
        }
      }
      resultList.sort((a, b) => new Date(a.start) - new Date(b.start));
      logger.log('List of week events created...:' + resultList)

      return resultList
    }

    separateListToPastCurrentFutureEvents(eventsList){
      let past = [], current = [], future = []
      const now = new Date()
      for (const ev of eventsList){
        const start = new Date(ev.start)
        const end = new Date(ev.end)
        if (now > end) past.push(ev)
        else if (start > now) future.push(ev)
        else current.push(ev)
      }
      return {past: past.length, current: past.length + current.length, future: past.length + current.length + future.length}
    }


    /**
     * Uploading events wich pass auto-delete, repeat, actual filter
     */
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
              const updatedEvent = EventsManager.addAnglesToEvent(ev)
              this.listOfCurrentDayEvents.push(updatedEvent)
            }
          }
        }
        EventsManager.writeEvents(afterDeleteFilterArr)
      }
      else logger.log('0 events loaded')
    }

  /**
   * Add event. Read events from file add new event and rewrite
   * Also add ID to new Event
   * @param {*} event new event
   */
    addEvent(event){
      logger.log('Creating new event...' + JSON.stringify(event))
      event.id = EventsManager.generateEventId()
      try{
        const loaded_events = EventsManager.readEvents()
        if (loaded_events && loaded_events.trim()){
          let result = JSON.parse(loaded_events)
          logger.log('Read previos events, and events to file...' + loaded_events)
          result.push(event)
          EventsManager.writeEvents(result)
        }
        else  EventsManager.writeEvents([event])
        this.uploadActualEvents()
      } catch(Error){
        logger.error('Add event faled...', Error)
      }
    }

    /**
     * Edit event fields
     * @param {*} event event with updated fields
     */
    editEvent(event) {
      logger.log('Edit event started ' + JSON.stringify(event))
      const loadedEvents = EventsManager.readEvents()
      let result = []
      if (loadedEvents && loadedEvents.trim()){
        const events = JSON.parse(loadedEvents)
        for (const e of events){
          if (e.id == event.id)
            result.push(event)
          else result.push(e)
        }
        EventsManager.writeEvents(result)
      }
      this.uploadActualEvents()
    }

    /**
     * Delete event by ID
     * @param {*} id id of deleted event
     */
    deleteEventById(id){
      logger.log('Delete event by ID: ' + id)
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

    /**
     * Get list of actual events (updated list Before it)
     * @returns list of actual events [-2h now +10h]
     */
    getListOfCurrentDayEvents(){
      this.listOfCurrentDayEvents.splice(0, this.listOfCurrentDayEvents.length) 
      this.uploadActualEvents()
      return this.listOfCurrentDayEvents
    }

    readSettings(){
      logger.log('Reading settings from file')
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
      logger.log('Save settings done')
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

    static generateEventId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Calculating the initial and final angles for the watchface relative to the current time
     * @param {*} event 
     * @returns Event with calculated start and end angles
     */
    static addAnglesToEvent(event){
       const angles = EventsManager.calculateAngles(event, Date.now())
       const result = {...event}
       result.startAngle = angles.startAngle
       result.endAngle = angles.endAngle
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
      const dayOfWeek = currentDate.getDay(); // 0-воскресенье, 1-понедельник, ...6-суббота
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + diffToMonday);
      const sunday = new Date(monday);
      monday.setHours(0)
      monday.setMinutes(0)
      monday.setSeconds(0)
      monday.setMilliseconds(0)
      sunday.setHours(0)
      sunday.setMinutes(0)
      sunday.setSeconds(0)
      sunday.setMilliseconds(0)
      sunday.setDate(monday.getDate() + 7);
      return { start: monday, end: sunday };
    }

    static getRepeatTimeMs(ev){
        let repeatTimeMs = 0
        if (ev.repeat == 1) repeatTimeMs = 24 * HOUR_MS
        else if ( ev.repeat == 2) repeatTimeMs = 7 * 24 * HOUR_MS
        else if (ev.repeat == 3) repeatTimeMs = EventsManager.getMsToSameDateInNextMonth(ev)
        return repeatTimeMs
    }
}