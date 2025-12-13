import { onGesture, GESTURE_RIGHT } from '@zos/interaction'
import { createKeyboard, inputType } from '@zos/ui'
import { push, back } from '@zos/router'
import {log} from '@zos/utils'

import { eventServise } from '../../../utils/Globals'

const logger = log.getLogger('page/event/edit/description.js')

Page ({

    registerGes(){
        onGesture({
            callback: (event) => {
            if (event === GESTURE_RIGHT) {
                logger.log('Edit description event canceled push to edit menu')
                push({
                    url: 'page/event/edit/menu',
                })
            }
            return true
            },
        })
    },

    onInit(params){
        logger.log('Init edit description page with params: ' + params)
        this.registerGes()
        let needToEditEvent = JSON.parse(params)
        const keyboard = createKeyboard({
            inputType: inputType.JSKB,
            onComplete: (keyboardWidget, result) => {
                needToEditEvent.description = result.data
                logger.log('Edit description done: ' + needToEditEvent.description)
                eventServise.editEvent(needToEditEvent)
                push({
                    url: 'page/event',
                    params: JSON.stringify(needToEditEvent)
                })
            },
            onCancel: (keyboardWidget, result) => {
                logger.log('Edit description canceled')
                back()
            },
            text: needToEditEvent.description
        })
    }
})
