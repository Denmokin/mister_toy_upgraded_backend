import configProd from './prod.js'
import configDev from './dev.js'

export var config

if (process.env.NODE_ENV === 'production') {
    console.log('production')
    config = configProd
} else {
    console.log('dev')
    config = configDev
}
config.isGuestMode = true
