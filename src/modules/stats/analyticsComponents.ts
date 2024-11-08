import { Entity, Schemas, engine } from "@dcl/sdk/ecs";
import { ANALYTICS_EVENT_KEYS, ANALYTICS_GENERIC_EVENTS, AnalyticsLogLabel } from "./AnalyticsConfig"
import { sendTrack } from "./segements";

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function randomChar(): string {
  return characters.charAt(Math.floor(Math.random() * characters.length))
}
export function generateGUID(): string {
  return ([...Array(36)].map(() => randomChar()).join(''))
}


export const ANALYTIC_ENTITY_REGISTRY:Record<string,Entity> = {

}

export function registerAnalyticsEntity(ent:Entity){
  const key = TrackingElement.getOrNull(ent)?.elementId
  ANALYTIC_ENTITY_REGISTRY[ key ] = ent
}
export function getRegisteredAnalyticsEntity(key:string){
  return ANALYTIC_ENTITY_REGISTRY[ key ]
}

const ROOT_GUID = generateGUID()

export function getParentGuid(trackingElement: TrackingElementType){
  //TODO recursive look for tracking parent 
  if(trackingElement && trackingElement.parent){
    return TrackingElement.getOrNull(trackingElement.parent)?.guid
  }
  //default is root
  return ROOT_GUID
}

export type TrackingElementType={
    guid: string,
    elementType: string,
    elementId: string,
    parent: Entity,
    startTime: number
    isStarted: boolean
}


export const TrackingElement = engine.defineComponent(
  "analytics.trackingElement",
  {
    guid: Schemas.String,
    elementType: Schemas.String,
    elementId: Schemas.String,
    parent: Schemas.Entity,
    startTime: Schemas.Number,
    isStarted: Schemas.Boolean,
  })

export function trackStart(entity: Entity, inTrackingKey?: string, event?: string) {
  const trackingElement = TrackingElement.getMutableOrNull(entity)
  if (trackingElement === null) {
    console.log(AnalyticsLogLabel, inTrackingKey, "Tracking Element can't be Null")
    return
  }
  if (trackingElement.isStarted) {
    console.log(AnalyticsLogLabel, inTrackingKey, "Event Already Started", trackingElement.elementId, trackingElement.elementType)
    return
  }
  trackingElement.isStarted = true
  trackingElement.startTime = Date.now()
  let eventKey: string = event ? event : ANALYTICS_GENERIC_EVENTS.start
  let trackingKey: string = inTrackingKey ? inTrackingKey : ANALYTICS_EVENT_KEYS.scene_element_visit
  sendTrack(
    trackingKey,
    trackingElement.elementType,
    trackingElement.elementId,
    ROOT_GUID,
    getParentGuid(trackingElement as TrackingElementType),
    trackingElement.guid,
    eventKey,
    undefined,
    undefined
  )
}

export function trackAction(entity: Entity, eventKey: string, selection?: string,selectionDesc?:string) {
  const trackingElement = TrackingElement.getMutableOrNull(entity)
  if (trackingElement === null || trackingElement === undefined) {
    console.log(AnalyticsLogLabel, eventKey, "Tracking Element can't be Null Or Undefined")
    return
  }
  sendTrack(
    ANALYTICS_EVENT_KEYS.scene_element_event,
    trackingElement.elementType,
    trackingElement.elementId,
    ROOT_GUID,
    getParentGuid(trackingElement as TrackingElementType),
    trackingElement.guid,
    eventKey,
    undefined,
    selection,
    selectionDesc
  )
}

export function trackEnd(entity: Entity, inTrackingKey?: string, event?: string) {
  const trackingElement = TrackingElement.getMutableOrNull(entity)
  if (trackingElement === null || trackingElement === undefined) {
    console.log(AnalyticsLogLabel, inTrackingKey, "Tracking Element can't be Null Or Undefined")
    return
  }
  trackingElement.isStarted = false
  trackingElement.startTime = Date.now() - trackingElement.startTime
  let eventKey: string|undefined = event ? event : ANALYTICS_GENERIC_EVENTS.end
  let trackingKey: string = inTrackingKey ? inTrackingKey : ANALYTICS_EVENT_KEYS.scene_element_visit
  sendTrack(
    trackingKey,
    trackingElement.elementType,
    trackingElement.elementId,
    ROOT_GUID,
    getParentGuid(trackingElement as TrackingElementType),
    trackingElement.guid,
    eventKey,
    trackingElement.startTime,
    undefined
  )
}