import * as npcLib from 'dcl-npc-toolkit'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { aishaModelPath } from '../../../lobby/resources/resources'
import { RemoteNpc, hideThinking } from '../../RemoteNpcs/remoteNpc'
import { closeCustomUI, openCustomUI } from '../../../utils/customNpcUi/customUi'
import { NpcAnimationNameType, REGISTRY, trtDeactivateNPC } from '../../../registry'
import { connectNpcToLobby } from '../../../lobby-scene/lobbyScene'
import { genericPrefinedQuestions } from '../../../utils/customNpcUi/customUIFunctionality'
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction, trackEnd, trackStart } from '../../stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from '../../stats/AnalyticsConfig'

export let aisha: RemoteNpc

const AISHA_NPC_ANIMATIONS: NpcAnimationNameType = {
  IDLE: { name: "Idle", duration: 4, autoStart: undefined, portraitPath: "images/portraits/aisha/Idle.png" },
  TALK: { name: "Talking", duration: 4, autoStart: undefined, portraitPath: "images/portraits/aisha/Talking.png" },
  THINKING: { name: "Thinking", duration: 4, autoStart: undefined, portraitPath: "images/portraits/aisha/Thinking.png" },
  EXCITED: { name: "Excited", duration: 4, autoStart: undefined, portraitPath: "images/portraits/aisha/Excited.png" },
  HAPPY: { name: "Excited", duration: 4, autoStart: undefined, portraitPath: "images/portraits/aisha/Excited.png" },
  LAUGH: { name: "Talking", duration: 4, autoStart: undefined, portraitPath: "images/portraits/aisha/Talking.png" },
  SAD: { name: "Talking", duration: 4, autoStart: undefined, portraitPath: "images/portraits/aisha/Talking.png" },
  SURPRISE: { name: "Excited", duration: 4, autoStart: undefined, portraitPath: "images/portraits/aisha/Excited.png" },
}

export function createAisha() {
  aisha = new RemoteNpc(
    { resourceName: "workspaces/genesis_city/characters/aisha" },
    {
      transformData: { position: Vector3.create(62, 0, 36), scale: Vector3.create(1.05, 1.05, 1.05), rotation: Quaternion.create(0, 0, 0, 0) },
      npcData: {
        type: npcLib.NPCType.CUSTOM,
        model: aishaModelPath,
        onActivate: () => {
          console.log('AIsha.NPC activated!')

          console.log(AnalyticsLogLabel, "barNpcs.ts", "AIsha")
          trackAction(aisha.entity, "Interact", undefined)
          trackStart(aisha.entity)

          connectNpcToLobby(REGISTRY.lobbyScene, aisha)
        },
        onWalkAway: () => {
          console.log("NPC", aisha.name, 'on walked away')

          trackEnd(aisha.entity)

          closeCustomUI(false)
          hideThinking(aisha)
          trtDeactivateNPC(aisha)
        },
        portrait:
        {
          path: AISHA_NPC_ANIMATIONS.IDLE.portraitPath, height: 300, width: 300
          , offsetX: -100, offsetY: 0
          , section: { sourceHeight: 256, sourceWidth: 256 }
        },
        idleAnim: AISHA_NPC_ANIMATIONS.IDLE.name,
        hoverText: 'Hello',
        faceUser: true,
        darkUI: true,
        coolDownDuration: 3,
        onlyETrigger: true,
        reactDistance: 4,
        continueOnWalkAway: false,
      }
    },
    {
      npcAnimations: AISHA_NPC_ANIMATIONS,
      thinking: {
        enabled: true,
        textEnabled: false,
        modelPath: 'models/core_building/loading-icon.glb',
        offsetX: 0,
        offsetY: 2.2,
        offsetZ: 0
      }
      , onEndOfRemoteInteractionStream: () => {
        openCustomUI()
      }
      , onEndOfInteraction: () => { }
    }
  )
  aisha.name = "npc.dclGuide"
  aisha.predefinedQuestions = genericPrefinedQuestions
  REGISTRY.allNPCs.push(aisha)

  TrackingElement.create(aisha.entity, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.aisha,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })
}