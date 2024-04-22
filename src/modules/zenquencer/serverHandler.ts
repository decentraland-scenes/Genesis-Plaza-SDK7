import { setRealm, playerRealm } from '../../utils/userData'
import { seqNumbers, stones } from './stones'
import * as utils from '@dcl-sdk/utils'


// external servers being used by the project - Please change these to your own if working on something else!
export let awsServer = 'https://genesis-plaza.s3.us-east-2.amazonaws.com/'
export let fireBaseServer =
  'https://us-central1-genesis-plaza.cloudfunctions.net/app/'

// get latest sequencer state stored in server
export async function getStones(): Promise<number[][]> {
  try {
    if (!playerRealm) {
      await setRealm()
    }
    console.log('zenquencer. player realm:', playerRealm.serverName)
    let url = awsServer + 'sequencer/' + playerRealm.serverName + '/stones.json'
    console.log('zenquencer. url used ', url)
    let response = await fetch(url)
    let json = await response.json()
    return json.stones
  } catch {
    console.log('error fetching from AWS server')
  }
}

// change data in sequencer
let requestTimer: number = -1
export async function changeSequencer() {
  if (!playerRealm) {
    await setRealm()
  }
//   seqChanger.addComponentOrReplace(
    // Only send request if no more changes come over the next second
    if(requestTimer !== -1) utils.timers.clearTimeout(requestTimer)
    requestTimer = utils.timers.setTimeout(async function () {
      try {
        let url = fireBaseServer + 'update-sequencer?realm=' + playerRealm.serverName
        console.log('zenquencer. url used ', url, seqNumbers)
        let body = JSON.stringify({ stones: seqNumbers })
        let response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
        })
        return response.json()
      } catch {
        console.log('zenquencer. changeSequencer. error fetching from AWS server')
      }
    }, 1000)
//   )
}

// // dummy entity to throttle the sending of change requests
// let seqChanger = new Entity()
// engine.addEntity(seqChanger)
