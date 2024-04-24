import * as npcLib from 'dcl-npc-toolkit'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { simoneModelPath } from '../../../lobby/resources/resources'
import { ColliderLayer } from '@dcl/sdk/ecs'
import { RemoteNpc, hideThinking } from '../../RemoteNpcs/remoteNpc'
import { closeCustomUI, openCustomUI } from '../../../utils/customNpcUi/customUi'
import { NpcAnimationNameType, REGISTRY, trtDeactivateNPC } from '../../../registry'
import { connectNpcToLobby } from '../../../lobby-scene/lobbyScene'
import { genericPrefinedQuestions } from '../../../utils/customNpcUi/customUIFunctionality'
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction, trackEnd, trackStart } from '../../stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from '../../stats/AnalyticsConfig'
import { streamedMsgsUiControl } from '../../RemoteNpcs/streamedMsgsUIcontrol'
import { closeAskNpcAiUi, openAskNpcAiUi } from '../../../utils/customNpcUi_v2/npcCustomUi'

let simonas: RemoteNpc

const SIMONAS_NPC_ANIMATIONS: NpcAnimationNameType = {
  HI: { name: "Hi", duration: 2, autoStart: undefined, portraitPath: "images/portraits/simone/hi1.png" },
  IDLE: { name: "Idle", duration: 4, autoStart: undefined, portraitPath: "images/portraits/simone/idle1.png" },
  TALK: { name: "Talking", duration: 2, autoStart: undefined, portraitPath: "images/portraits/simone/talking1.png" },
  THINKING: { name: "Thinking", duration: 2, autoStart: undefined, portraitPath: "images/portraits/simone/interesting1.png" },
  LOADING: { name: "Loading", duration: 2, autoStart: undefined, portraitPath: "images/portraits/simone/interesting1.png" },
  LAUGH: { name: "Laugh", duration: 2, autoStart: undefined, portraitPath: "images/portraits/simone/laughing1.png" },
  HAPPY: { name: "Happy", duration: 2, autoStart: undefined, portraitPath: "images/portraits/simone/happy1.png" },
  SAD: { name: "Sad", duration: 2, autoStart: undefined, portraitPath: "images/portraits/simone/sad1.png" },
  SURPRISE: { name: "Surprise", duration: 2, autoStart: undefined, portraitPath: "images/portraits/simone/surprise1.png" },
}

export function createSimonas() {
  simonas = new RemoteNpc(
    { resourceName: "workspaces/genesis_city/characters/simone", id: 'Simone' },
    {
      transformData: { position: Vector3.create(169, 105 - 1.1, 147.5), scale: Vector3.create(1, 1, 1), rotation: Quaternion.fromEulerDegrees(0, -120, 0) },
      npcData: {
        type: npcLib.NPCType.CUSTOM,
        model: {
          src: simoneModelPath, //collider not working for Simone_Anim.glb
          invisibleMeshesCollisionMask: ColliderLayer.CL_POINTER | ColliderLayer.CL_PHYSICS,
          visibleMeshesCollisionMask: ColliderLayer.CL_NONE
        },
        onActivate: () => {
          console.log('Simonas.NPC activated!')

          console.log(AnalyticsLogLabel, "barNpcs.ts", "Simone")
          trackAction(simonas.entity, "Interact", undefined)
          trackStart(simonas.entity)

          connectNpcToLobby(REGISTRY.lobbyScene, simonas)
        },
        onWalkAway: () => {
          console.log("NPC", simonas.name, 'on walked away')

          trackEnd(simonas.entity)

        //   closeCustomUI(false)
          closeAskNpcAiUi(false)

          hideThinking(simonas)
          trtDeactivateNPC(simonas)

          streamedMsgsUiControl.reset()
        },
        portrait:
        {
          path: 'images/portraits/simone/simone.png', height: 300, width: 300
          , offsetX: -100, offsetY: -55
          , section: { sourceHeight: 256, sourceWidth: 256 }
        },
        idleAnim: SIMONAS_NPC_ANIMATIONS.IDLE.name,
        hoverText: 'Hello',
        faceUser: true,
        darkUI: true,
        coolDownDuration: 3,
        onlyETrigger: true,
        reactDistance: 6,
        continueOnWalkAway: false,
      }
    },
    {
      npcAnimations: SIMONAS_NPC_ANIMATIONS,
      thinking: {
        enabled: true,
        textEnabled: false,
        modelPath: 'models/core_building/loading-icon.glb',
        offsetX: 0,
        offsetY: 2.3,
        offsetZ: 0
      }
      , onEndOfRemoteInteractionStream: () => {
        // openCustomUI()
        openAskNpcAiUi(1)
      }
      , onEndOfInteraction: () => { }
    }
  )
  simonas.name = "npc.simone"
  simonas.predefinedQuestions = genericPrefinedQuestions
  REGISTRY.allNPCs.push(simonas)

  TrackingElement.create(simonas.entity, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.simone,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })
}