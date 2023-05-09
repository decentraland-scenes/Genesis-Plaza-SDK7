import { TimerId } from "@dcl-sdk/utils/dist/timer"
import * as utils from '@dcl-sdk/utils'

export class CountDownUtil {
    timerId?: TimerId
    counter: number = -1
    
    incrementBy: number = 1000

    start(startFrom: number) {
        this.counter = startFrom
        const host = this
        this.timerId = utils.timers.setInterval(() => {
            host.tick()
        }, this.incrementBy)
    }
    tick() {
        console.log("CountDownUtil","tick", this.counter, this.timerId)
        if(this.counter === undefined){
            throw new Error ("start counter must be defined")
        }
        this.counter--
        if(this.counter <= 0){
            this.stop()
        }
    }
    stop(){
        console.log("CountDownUtil","stop", this.counter, this.timerId)
        if(this.timerId !== undefined){
            utils.timers.clearInterval(this.timerId)
        }
    }
}


