import * as npcLib from 'dcl-npc-toolkit'
import { Vector3 } from '@dcl/sdk/math'
import { robModelPath } from '../../../lobby/resources/resources'
import { RemoteNpc, hideThinking } from '../../RemoteNpcs/remoteNpc'
import { closeCustomUI, openCustomUI } from '../../../utils/customNpcUi/customUi'
import { NpcAnimationNameType, REGISTRY, trtDeactivateNPC } from '../../../registry'
import { connectNpcToLobby } from '../../../lobby-scene/lobbyScene'
import { genericPrefinedQuestions } from '../../../utils/customNpcUi/customUIFunctionality'
import { TrackingElement, trackAction, trackEnd, trackStart } from '../../stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from '../../stats/AnalyticsConfig'

let rob: RemoteNpc

const ROB_NPC_ANIMATIONS: NpcAnimationNameType = {
  HI: { name: "Hi", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/hi1.png" },
  IDLE: { name: "Idle", duration: 4, autoStart: undefined, portraitPath: "images/portaits/rob/idle1.png" },
  TALK: { name: "Talking", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/talking1.png" },
  THINKING: { name: "Thinking", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/interesting1.png" },
  LOADING: { name: "Loading", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/interesting1.png" },
  LAUGH: { name: "Laugh", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/laughing1.png" },
  HAPPY: { name: "Happy", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/happy1.png" },
  SAD: { name: "Sad", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/sad1.png" },
  SURPRISE: { name: "Surprise", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/surprise1.png" },
}

function createRob() {
  rob = new RemoteNpc(
    { resourceName: "workspaces/genesis_city/characters/" },
    {
      transformData: { position: Vector3.create(9, 0, 9), scale: Vector3.create(1, 1, 1) },
      npcData: {
        type: npcLib.NPCType.CUSTOM,
        model: robModelPath,
        onActivate: () => {
          console.log('Rob.NPC activated!')

          console.log(AnalyticsLogLabel, "barNpcs.ts", "Rob")
          trackAction(rob.entity, "Interact", undefined)
          trackStart(rob.entity)

          connectNpcToLobby(REGISTRY.lobbyScene, rob)
        },
        onWalkAway: () => {
          console.log("NPC", rob.name, 'on walked away')

          trackEnd(rob.entity)

          closeCustomUI(false)
          hideThinking(rob)
          trtDeactivateNPC(rob)
        },
        portrait:
        {
          path: ROB_NPC_ANIMATIONS.IDLE.portraitPath, height: 300, width: 300
          , offsetX: -100, offsetY: 0
          , section: { sourceHeight: 256, sourceWidth: 256 }
        },
        idleAnim: ROB_NPC_ANIMATIONS.IDLE.name,
        hoverText: 'Hello',
        faceUser: true,
        darkUI: true,
        coolDownDuration: 3,
        onlyETrigger: true,
        reactDistance: 5,
        continueOnWalkAway: false,
      }
    },
    {
      npcAnimations: ROB_NPC_ANIMATIONS,
      thinking: {
        enabled: true,
        textEnabled: false,
        modelPath: 'models/loading-icon.glb',
        offsetX: 0,
        offsetY: 2,
        offsetZ: 0
      }
      , onEndOfRemoteInteractionStream: () => {
        openCustomUI()
      }
      , onEndOfInteraction: () => { }
    }
  )
  rob.name = "npc.dclGuide"
  rob.predefinedQuestions = genericPrefinedQuestions
  REGISTRY.allNPCs.push(rob)

  TrackingElement.create(rob.entity, {
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.rob,
  })
}