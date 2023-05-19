import { Entity, Schemas, engine } from "@dcl/sdk/ecs";
import { ANALYTICS_EVENT_KEYS, ANALYTICS_GENERIC_EVENTS, AnalyticsLogLabel } from "./AnalyticsConfig"
import { sendTrack } from "./segements";

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function randomChar(): string {
  return characters.charAt(Math.floor(Math.random() * characters.length))
}
function generateGUID(): string {
  return ([...Array(36)].map(() => randomChar()).join(''))
}

export const TrackingElement = engine.defineComponent(
  "trackingElement",
  {
    guid: Schemas.String,
    elementType: Schemas.String,
    elementId: Schemas.String,
    startTime: Schemas.Number,
    isStarted: Schemas.Boolean,
  })

export function trackStart(entity: Entity, inTrackingKey?: string, event?: string) {
  const trackingElement = TrackingElement.getMutableOrNull(entity)
  if (trackingElement === null) {
    console.log(AnalyticsLogLabel, "Tracking Element can't be Null")
    return
  }
  if (trackingElement.isStarted) {
    console.log(AnalyticsLogLabel, "Event Already Started")
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
    trackingElement.guid,
    eventKey,
    undefined,
    undefined
  )
}

export function trackAction(entity: Entity, eventKey: string, selection: string) {
  const trackingElement = TrackingElement.getMutableOrNull(entity)
  if (trackingElement === null || trackingElement === undefined) {
    console.log(AnalyticsLogLabel, "Tracking Element can't be Null Or Undefined")
    return
  }
  sendTrack(
    ANALYTICS_EVENT_KEYS.scene_element_event,
    trackingElement.elementType,
    trackingElement.elementId,
    trackingElement.guid,
    eventKey,
    undefined,
    selection
  )
}

export function trackEnd(entity: Entity, inTrackingKey?: string, event?: string) {
  const trackingElement = TrackingElement.getMutableOrNull(entity)
  if (trackingElement === null || trackingElement === undefined) {
    console.log(AnalyticsLogLabel, "Tracking Element can't be Null Or Undefined")
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
    trackingElement.guid,
    eventKey,
    trackingElement.startTime,
    undefined
  )
}