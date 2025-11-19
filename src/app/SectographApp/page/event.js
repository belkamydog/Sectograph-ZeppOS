import { getText } from '@zos/i18n'
import * as Styles from 'zosLoader:./index.[pf].layout.js'
import hmUI from '@zos/ui'


Page ({
    build(){
        hmUI.createWidget(hmUI.widget.TEXT, {
            x: 240,
            y: 240,
            w: 288,
            h: 46,
            color: 0xffffff,
            text_size: 36,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            text: 'HELLO, Zepp OS'
        })
    }
})