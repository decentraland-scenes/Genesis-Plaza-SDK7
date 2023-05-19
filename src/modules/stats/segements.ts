import { Transform, engine } from "@dcl/sdk/ecs";
import { AnalyticsLogLabel, SKIP_ANALYTICS } from "./AnalyticsConfig";
import { getUserData } from "~system/UserIdentity"
import { getRealm } from "~system/Runtime"
import { getWorldPosition } from "@dcl-sdk/utils";
import { log } from "../../back-ports/backPorts";
import { GenesisData } from "./genesis.data";

const SCENE_ID: string = "genesis_plaza"
const IN_SECONDS: boolean = false

let segment: Segment

export function getSegment() {
  if (segment) return segment;

  segment = new Segment('CH4D0eauyRqTDYnqhI0jw1PVPLmaJENj')
  return segment
}

export async function sendTrackOld(eventName: string,) {
  const doc: any = {
    sceneId: SCENE_ID,
    playTime: Date.now() - GenesisData.instance().startPlayTime,
    exactPosition: getWorldPosition(engine.PlayerEntity),
    position: Math.floor(getWorldPosition(engine.PlayerEntity).x / 16) + "," + Math.floor(getWorldPosition(engine.PlayerEntity).z / 16)
  }
  await getSegment().track(eventName, doc)
}

export async function sendTrack(trackEvent: string,
  elementType: string,
  elementId: string,
  instance: string,
  event: string,
  durationTime?: number,
  selection?: string,
  selectionDesc?: string) {

  const realm = await getRealm({})

  const worldPos = getWorldPosition(engine.PlayerEntity)

  const doc: any = {
    sceneId: SCENE_ID,
    realm: realm,
    spanId: instance,
    elementType: elementType,
    elementId: elementId,
    event: event,
    selection: selection,
    selectionDesc: selectionDesc,
    durationTime: durationTime && IN_SECONDS ? durationTime * 0.001 : durationTime,

    playTime: Date.now() - GenesisData.instance().startPlayTime,
    exactPosition: worldPos,
    position: Math.floor(worldPos.x / 16) + "," + Math.floor(worldPos.z / 16)
  }
  await getSegment().track(trackEvent, doc)
}

declare function btoa(soruce: string): string

class Segment {

  constructor(public readonly segmentKey: string) { }

  async track(event: string, properties?: Record<string, any>) {
    if (SKIP_ANALYTICS) return
    const userData = await getUserData({})
    if (!userData || !userData.data) {
      console.log(`[ignored] Segment.track("${event}`,properties,`): missing userData`)
      return
    }
    console.log(`Segment.track("${event}`,properties,`)`)

    const data: SegemntTrack = {
      messageId: messageId(),
      anonymousId: userData.data.userId,
      timestamp: new Date().toJSON(),
      event,
      properties: {
        ...properties,
      },
      context: {
        library: {
          name: 'dcl-segment-gists',
          version: '0.0.0-development'
        }
      }
    }

    try {

      await fetch(`https://api.segment.io/v1/track`, {
        method: 'POST',
        headers: {
          'authorization': 'Basic ' + btoa(this.segmentKey + ':'),
          'content-type': 'application/json',
        },
        body: JSON.stringify(data)
      })
    } catch (err) {
      console.log(`[error] Segment.track("${event}"`,properties,`): ${(err as Error)?.message || err}`)
    }
  }
}

const MESSAGE_ID_DATA = 'abcdef0123456789'

function randomChar() {
  return MESSAGE_ID_DATA[Math.floor(Math.random() * MESSAGE_ID_DATA.length)]
}

function messageId() {
  return `dcl-scene-` + [...Array(36)].map(() => randomChar()).join('')
}

/**
 * SegemntTrack 
 * @property {string} anonymousId - The anonymous ID of the user.
 * @property {string} event - The name of the event.
 * @property {string} timestamp - The time the event occurred.
 * @property {string} messageId - A unique identifier for the message.
 * @property properties 
 * @property context 
 */
type SegemntTrack = {
  anonymousId: string,
  event: string,
  timestamp: string
  messageId: string
  properties: Record<string, any>,
  context: Record<string, any>,
}




//const realm = await getRealm({});
//const isPreview = realm.realmInfo?.isPreview
//
// make sure users are matched together by the same "realm".
//
//options.realm = realm?.realmInfo?.realmName;
//options.userData = await getUserData({});

export async function debugGetRealm() {
  const realm = await getRealm({})
  console.log(AnalyticsLogLabel, realm.realmInfo?.realmName)
  console.log("AnalyticLogs")
}
