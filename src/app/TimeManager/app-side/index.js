import { BaseSideService } from '@zeppos/zml/base-side'
import { settingsLib } from '@zeppos/zml/base-side'
import { gettext } from 'i18n'

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res){
      if (req.method === 'TEST_CONNECTION') {
        res(null, {
          result: 'CONNECTION SUCCEES'
        })
      }
      else res = 'TEST'
    },
    // onCall(req) {
    //   console.log('TEST' + req)
    // },
    onSettingsChange({ key, newValue, oldValue }) {
      this.call({
        result: 'test_settings'
      })
    },
  })
)
