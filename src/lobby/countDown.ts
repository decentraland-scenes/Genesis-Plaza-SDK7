import { TimerId } from "@dcl-sdk/utils/dist/timer"
import * as utils from '@dcl-sdk/utils'

export class CountDownUtil {
    timerId?: TimerId
    counter: number = -1
    incrementBy:number = -1
    timeIntervalMS: number = 1000

    start(startFrom: number) {
        console.log("CountDownUtil","start", "startFrom", startFrom, this.counter, this.timerId)
        //stop any existing counter
        this.stop()
        this.counter = startFrom
        const host = this
        this.timerId = utils.timers.setInterval(() => {
            host.tick()
        }, this.timeIntervalMS)
    }
    tick() {
        console.log("CountDownUtil","tick", this.counter, this.timerId)
        if(this.counter === undefined){
            throw new Error ("start counter must be defined")
        }
        this.counter += this.incrementBy
        if(this.counter <= 0){
            this.stop()
        }
    }
    stop(){
        console.log("CountDownUtil","stop", this.counter, this.timerId)
        if(this.timerId !== undefined){
            console.log("CountDownUtil","stop","called clearInterval", this.counter, this.timerId)
            utils.timers.clearInterval(this.timerId)
        }
    }
}


