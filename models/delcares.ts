import * as utils from '@dcl-sdk/utils'
import { XMLHttpRequest } from './xmlhttprequest'

console.log("DECLARING!!!")

type Timeout = {}

function clearTimeout(timer: string | number | Timeout | undefined) {
    //console.log("DECLARING","clearTimeout called!!!",timer)
    //simulate
    if (timer !== undefined) {
        utils.timers.clearTimeout(timer as any)
    }
}
function setTimeout(fn: () => void, time: number) {
    //console.log("DECLARING","setTimeout called!!!",fn,time)
    //simulate
    return utils.timers.setTimeout(fn, time)
}
class FormData { }


/**
 * This is a workaround to solve a runtime issues
 * 
 */


Object.assign(globalThis, {
    FormData: FormData,
    XMLHttpRequest: XMLHttpRequest,
    clearTimeout: clearTimeout,
    setTimeout: setTimeout
});

if (console != null && !(console as any).warn) (console as any).warn = (...args: any[]) => console.log('WARNING', ...args)