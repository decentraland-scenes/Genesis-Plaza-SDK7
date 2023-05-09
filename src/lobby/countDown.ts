import { TimerId } from "@dcl-sdk/utils/dist/timer"
import * as utils from '@dcl-sdk/utils'

export class CountDownUtil {
    timerId?: TimerId
    counter?: number
    
    start(startFrom: number) {
        this.counter = startFrom
        const host = this
        this.timerId = utils.timers.setInterval(() => {
            host.tick()
        }, 1000)
    }
    tick() {
        if(this.counter === undefined){
            throw new Error ("start counter must be defined")
        }
        this.counter--
        if(this.counter <= 0){
            this.stop()
        }
    }
    stop(){
        if(this.timerId !== undefined){
            utils.timers.clearInterval(this.timerId)
        }
    }
}


