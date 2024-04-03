import * as npcLib from 'dcl-npc-toolkit'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { coreBuildingOffset } from '../../../lobby/resources/globals'
import { NPCData } from 'dcl-npc-toolkit/dist/types'
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction, trackEnd, trackStart } from '../../stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from '../../stats/AnalyticsConfig'
import { Entity } from '@dcl/sdk/ecs'
import { artistRecommendations, girlArtistTalk } from './npcDialogs'
import { aritst1ModelPath, aritst2ModelPath, navigationForwardSfx } from '../../../lobby/resources/resources'

export let boyArtist: Entity
export let girlArtist: Entity

export function createArtistCouple(): void {
  boyArtist = createBoyArtist()
  girlArtist = createGirlArtist()

  npcLib.talkBubble(girlArtist, girlArtistTalk)
}

function createBoyArtist(): Entity {
  let boy = npcLib.create(
    {
      position: Vector3.create(142.9 - coreBuildingOffset.x, -0.2, 165.7 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180 + 90, 0)
    },
    {
      type: npcLib.NPCType.CUSTOM,
      model: aritst1ModelPath,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      // onlyExternalTrigger: true,
      onActivate: () => {
       // npcLib.activate(girlArtist, boy)
        npcLib.activate(girlArtist)
        console.log(AnalyticsLogLabel, "barNpcs.ts", "boyArtist")
        trackAction(boy, "Interact", undefined)
        trackStart(boy)
      },
      onWalkAway: () => {
        console.log('NPC', 'ARTIST', 'walk away');
        trackEnd(boy)
      },
      textBubble: true,
      portrait: {
        path: `images/portraits/ACch2.png`,
      },
      bubbleYOffset: .15,
      bubbleXOffset: -1
    },
  )

  TrackingElement.create(boy, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.boyArtist,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })

  npcLib.playAnimation(boy, 'Talk', false)
  console.log("CHECK_DATA", npcLib.getData(boy) as NPCData);

  return boy
}

function createGirlArtist(): Entity {
  let girl = npcLib.create(
    {
      position: Vector3.create(142.9 - coreBuildingOffset.x, -0.2, 165.7 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180 + 90, 0)
    },
    {
      type: npcLib.NPCType.CUSTOM,
      model: aritst2ModelPath,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      //onlyExternalTrigger: true,
      onActivate: () => {
        activateArtists()

        console.log(AnalyticsLogLabel, "barNpcs.ts", "girlArtist")
        trackAction(girl, "Interact", undefined)
        trackStart(girl)
      },
      onWalkAway: () => {
        console.log('NPC', 'ARTIST', 'walk away');
        artistTalkToEachOther(false)
        trackEnd(girl)
      },
      textBubble: true,
      portrait: {
        path: `images/portraits/ACch2.png`,
        offsetX: -80, offsetY: 10
      },
      bubbleYOffset: .15,
      bubbleXOffset: 1.15
    }
  )

  TrackingElement.create(girl, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.girlArtist,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })

  npcLib.playAnimation(girl, 'Talk', false)

  console.log("CHECK_DATA", npcLib.getData(girl) as NPCData);
  return girl
}

function activateArtists(): void {
  npcLib.closeBubble(boyArtist)
  npcLib.closeBubble(girlArtist)
  npcLib.playAnimation(boyArtist, 'TalkToUser', false)
  npcLib.playAnimation(girlArtist, 'TalkToUser', false)
  npcLib.talk(girlArtist, artistRecommendations)
}

function artistTalkToEachOther(force: boolean): void {
  if (force) {
    npcLib.playAnimation(girlArtist, 'Talk', false)
    npcLib.playAnimation(boyArtist, 'Talk', false)
    npcLib.talkBubble(girlArtist, girlArtistTalk)
  }
  else {
    utils.timers.setTimeout(
      () => {
        artistTalkToEachOther(true)
      }
      , 500)
  }
}
