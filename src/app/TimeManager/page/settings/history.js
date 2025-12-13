import { createWidget, widget, align, prop } from '@zos/ui'
import { back } from '@zos/router'
import { getText } from '@zos/i18n'
import { AUTO_DELETE, styleColors } from '../../utils/Constants'
import { createModal, MODAL_CONFIRM } from '@zos/interaction'
import { settingsService } from '../../utils/Globals'
import { SettingsService } from '../../utils/services/SettingsService'


let index_auto_delete = 0//  AUTO_DELETE.indexOf(SettingsService.loadSettings().autoDelete)
Page({
    actions: ['Never','Older than day', 'Older than week', 'Older than month'],

    attentionDialog(){
        const attention = getText('Attention! Some events can be deleted!') 
        const dialog = createModal({
            content: attention ,
            autoHide: false,
            show: false,
            onClick: (keyObj) => {
                const { type } = keyObj
                if (type === MODAL_CONFIRM) {
                    let settings = SettingsService.loadSettings()
                    settings.autoDelete = AUTO_DELETE[index_auto_delete]
                    SettingsService.saveSettings(settings)
                    dialog.show(false)
                    back()
                } else {
                    dialog.show(false)
                }
            },
        })
        dialog.show(true) 
    },

    initDeleteRadioGroup(){
        const radioGroup = createWidget(widget.RADIO_GROUP, {
            x: 0,
            y: 0,
            w: 480,
            h: 480,
            select_src: 'radio_selected.png',
            unselect_src: 'radio_unselected.png',
            check_func: (group, index, checked) => {
                if (checked){
                    index_auto_delete = index
                } 
            }
        })
        const x = 380
        const neverDelete = radioGroup.createWidget(widget.STATE_BUTTON, {
            x: x,
            y: 150,
            w: 64,
            h: 64
        })
        const dayDelete = radioGroup.createWidget(widget.STATE_BUTTON, {
            x: x,
            y: 250,
            w: 64,
            h: 64
        })
        const weekDelete = radioGroup.createWidget(widget.STATE_BUTTON, {
            x: x,
            y: 350,
            w: 64,
            h: 64
        })
        const monthDelete = radioGroup.createWidget(widget.STATE_BUTTON, {
            x: x,
            y: 450,
            w: 64,
            h: 64
        })


        const neverDeleteLabel = createWidget(widget.TEXT, {
            text: getText(this.actions[0]),
            w: 250,
            h: 135,
            x: 70,     
            y: 140,
            align_v: align.UP,
            align_h: align.LEFT,
            text_size: 32,
            color: styleColors.white_smoke
        })
        const dayDeleteLabel = createWidget(widget.TEXT, {
            text: getText(this.actions[1]),
            w: 250,
            h: 64,
            x: 70,
            y: 240,
            align_v: align.CENTER_V,
            align_h: align.LEFT,
            text_size: 32,
            color: styleColors.white_smoke
        })
        const weekDeleteLabel = createWidget(widget.TEXT, {
            text: getText(this.actions[2]),
            w: 250,
            h: 64,
            x: 70,
            y: 340,
            align_v: align.CENTER_V,
            align_h: align.LEFT,
            text_size: 32,
            color: styleColors.white_smoke
        })
        const monthDeleteLabel = createWidget(widget.TEXT, {
            text: getText(this.actions[3]),
            w: 250,
            h: 64,
            x: 70,
            y: 440,
            align_v: align.CENTER_V,
            align_h: align.LEFT,
            text_size: 32,
            color: styleColors.white_smoke
        })

        if (AUTO_DELETE.indexOf(SettingsService.loadSettings().autoDelete) == 0)
            radioGroup.setProperty(prop.INIT, neverDelete)
        else if (AUTO_DELETE.indexOf(SettingsService.loadSettings().autoDelete) == 1) 
            radioGroup.setProperty(prop.INIT, dayDelete)                
        else if (AUTO_DELETE.indexOf(SettingsService.loadSettings().autoDelete) == 2) 
            radioGroup.setProperty(prop.INIT, weekDelete)
        else if (AUTO_DELETE.indexOf(SettingsService.loadSettings().autoDelete) == 3) 
            radioGroup.setProperty(prop.INIT, monthDelete)
    },
    
    onInit(){
        console.log('INDEX AD' + SettingsService.loadSettings().autoDelete)
        createWidget(widget.TEXT, {
            text: getText('Delete events:'),
            w: 300,
            h: 50,
            x: (480-300)/2,
            y: 50,
            align_v: align.CENTER_V,
            align_h: align.CENTER_H,
            text_size: 35,
            color: styleColors.white_smoke
        })
        this.initDeleteRadioGroup()
        const self = this
        createWidget(widget.BUTTON, {
            x: 40,
            y: 550,
            w: 400,
            h: 60,
            radius: 30,
            normal_color: styleColors.dark_red,
            press_color: styleColors.blue_violet,
            text: getText('Submit'),
            text_size: 32,
            click_func: () => {
                if (index_auto_delete > 0){
                    self.attentionDialog()
                }else {
                    const settings = settingsService.loadSettings()
                    settings.autoDelete = AUTO_DELETE[index_auto_delete]
                    SettingsService.saveSettings(settings)
                    back()
                }
            }
        })
    }

}) 