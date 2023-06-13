import { Transform, engine } from "@dcl/sdk/ecs";
import { AnalyticsLogLabel, SKIP_ANALYTICS } from "./AnalyticsConfig";
import { getUserData } from "~system/UserIdentity"
import { GetRealmResponse, RealmInfo, getRealm } from "~system/Runtime"
import { getWorldPosition } from "@dcl-sdk/utils";
import { log } from "../../back-ports/backPorts";
import { GenesisData } from "./genesis.data";
import { base64 } from "../../polyfill/delcares";
import { GetSceneResponse, getSceneInfo } from "~system/Scene";
import { SceneMetaData, getAndSetSceneMetaData, getSceneMetadata } from "../../utils/sceneDataHelper";

const SCENE_ID: string = "genesis_plaza"
const IN_SECONDS: boolean = false

let segment: Segment

const PARCEL_SIZE = 16

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
    position: Math.floor(getWorldPosition(engine.PlayerEntity).x / PARCEL_SIZE) + "," + Math.floor(getWorldPosition(engine.PlayerEntity).z / PARCEL_SIZE)
  }
  await getSegment().track(eventName, doc)
}

//start fetch now so less of a wait
const sceneInfoPromise = getAndSetSceneMetaData()

export async function sendTrack(trackEvent: string,
  elementType: string,
  elementId: string,
  rootId: string,
  parentId: string,
  instance: string,
  event: string,
  durationTime?: number,
  selection?: string,
  selectionDetails?: string) {

  console.log(AnalyticsLogLabel, "sendTrack", elementType,elementId,instance,event,durationTime,selection,selectionDetails)
  const realmPromise = getRealm({})
  
  await Promise.all([realmPromise, sceneInfoPromise])
  
  const realm:GetRealmResponse = (await realmPromise)
  const sceneInfo:SceneMetaData = getSceneMetadata()

  //get scene relative position
  const scenePos = getWorldPosition(engine.PlayerEntity)
  //now compute world absolute position
  const worldPos = {...scenePos}
  
  //must add base coords to compute abs world pos
  worldPos.x += (sceneInfo.scene._baseCoords.x*PARCEL_SIZE)
  worldPos.z += (sceneInfo.scene._baseCoords.y*PARCEL_SIZE)

  //What would happen if tomorrow a proposal to increase the LAND size from 16 to ??? is approved by the DAO?
  //added insulation will send scenePosition + sceneBase
  //from there we are insulated from an such change and if needed you can compute the exact coords ourself on the backend

  const doc: any = {
    sceneId: SCENE_ID,
    realm: realm.realmInfo?.realmName,
    rootSpanId: rootId,
    parentSpanId: parentId,
    spanId: instance,
    elementType: elementType,
    elementId: elementId,
    event_key: event,//'event' and properties.event conflict and properties.event is lost. renamed to event_key
    selection: selection,
    selectionDetails: selectionDetails,
    durationTime: durationTime && IN_SECONDS ? durationTime * 0.001 : durationTime,

    playTime: Date.now() - GenesisData.instance().startPlayTime,
    exactPosition: worldPos,
    scenePosition: scenePos,
    sceneBaseParcel: sceneInfo.scene.base,
    position: Math.floor(worldPos.x / PARCEL_SIZE) + "," + Math.floor(worldPos.z / PARCEL_SIZE)
  }
  await getSegment().track(trackEvent, doc)
}

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
          version: '2.0.0'
        }
      }
    }

    try {

      await fetch(`https://api.segment.io/v1/track`, {
        method: 'POST',
        headers: {
          'authorization': 'Basic ' + base64.encode(this.segmentKey + ':'),
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
