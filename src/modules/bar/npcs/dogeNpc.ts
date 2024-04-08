import { Transform, engine } from "@dcl/sdk/ecs";
import { Color4, Vector3 } from "@dcl/sdk/math";
import { NpcAnimationNameType, REGISTRY, trtDeactivateNPC } from "../../../registry";
import { coreBuildingOffset } from "../../../lobby/resources/globals";
import { FollowPathData } from "dcl-npc-toolkit/dist/types";
import { createDebugEntity } from "../../RemoteNpcs/npcHelper";
import { RemoteNpc, hideThinking } from "../../RemoteNpcs/remoteNpc";
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction, trackEnd, trackStart } from "../../stats/analyticsComponents";
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from "../../stats/AnalyticsConfig";
import * as npcLib from 'dcl-npc-toolkit'
import * as utils from '@dcl-sdk/utils'
import { genericPrefinedQuestions } from "../../../utils/customNpcUi/customUIFunctionality";
import { closeCustomUI, openCustomUI } from "../../../utils/customNpcUi/customUi";
import { dogeModelPath } from "../../../lobby/resources/resources";
import { connectNpcToLobby } from "../../../lobby-scene/lobbyScene";
import { streamedMsgsUiControl } from "../../RemoteNpcs/streamedMsgsUIcontrol";
import { closeAskNpcAiUi, openAskNpcAiUi } from "../../../utils/customNpcUi_v2/npcCustomUi";

let doge: RemoteNpc

const ANIM_TIME_PADD = .2
let isActive: boolean = false
let blockMovement: boolean = false

const DOGE_NPC_ANIMATIONS: NpcAnimationNameType = {
  HI: { name: "Hi", duration: 2, autoStart: undefined },
  IDLE: { name: "Idle", duration: -1, portraitPath: 'images/portraits/doge/doge.png' },
  WALK: { name: "Walk", duration: -1 },
  TALK: { name: "Talk1", duration: 5 },
  THINKING: { name: "Thinking", duration: 5 },
  RUN: { name: "Run", duration: -1 },
  WAVE: { name: "Wave", duration: 4 + ANIM_TIME_PADD },
  LAUGH: { name: "Laugh", duration: 2, autoStart: undefined },
  HAPPY: { name: "Happy", duration: 2, autoStart: undefined },
  SAD: { name: "Sad", duration: 2, autoStart: undefined },
  SURPRISE: { name: "Surprise", duration: 2, autoStart: undefined },
}

export function createDogeNpc(): void {
  let dogePathPoints = [
    Vector3.create(166.7 - coreBuildingOffset.x, 0.24, 163. - coreBuildingOffset.z),
    Vector3.create(161 - coreBuildingOffset.x, 0.24, 160 - coreBuildingOffset.z),
    Vector3.create(157.5 - coreBuildingOffset.x, 0.24, 157.4 - coreBuildingOffset.z),
    Vector3.create(153.7 - coreBuildingOffset.x, 0.24, 156.2 - coreBuildingOffset.z),
    Vector3.create(148.1 - coreBuildingOffset.x, 0.24, 156.8 - coreBuildingOffset.z),
    Vector3.create(146.4 - coreBuildingOffset.x, 0.24, 156 - coreBuildingOffset.z),
    Vector3.create(143.1 - coreBuildingOffset.x, 0.24, 153.1 - coreBuildingOffset.z),
    Vector3.create(143.26 - coreBuildingOffset.x, 0.24, 147.5 - coreBuildingOffset.z),
    Vector3.create(148.1 - coreBuildingOffset.x, 0.24, 142.3 - coreBuildingOffset.z),
    Vector3.create(151.9 - coreBuildingOffset.x, 0.24, 142.3 - coreBuildingOffset.z),
    Vector3.create(153.8 - coreBuildingOffset.x, 0.24, 144.9 - coreBuildingOffset.z),
    Vector3.create(154 - coreBuildingOffset.x, 0.24, 146.9 - coreBuildingOffset.z),
    Vector3.create(154.6 - coreBuildingOffset.x, 0.24, 149.57 - coreBuildingOffset.z),
    Vector3.create(156.65 - coreBuildingOffset.x, 0.24, 154.7 - coreBuildingOffset.z),
    Vector3.create(162.3 - coreBuildingOffset.x, 0.24, 156.2 - coreBuildingOffset.z),
    Vector3.create(166.4 - coreBuildingOffset.x, 0.24, 156.1 - coreBuildingOffset.z),
    Vector3.create(169.7 - coreBuildingOffset.x, 0.24, 156.2 - coreBuildingOffset.z),
    Vector3.create(171.9 - coreBuildingOffset.x, 0.24, 157.8 - coreBuildingOffset.z),
    Vector3.create(173.8 - coreBuildingOffset.x, 0.24, 158.7 - coreBuildingOffset.z),
    Vector3.create(173.8 - coreBuildingOffset.x, 0.24, 160.1 - coreBuildingOffset.z),
    Vector3.create(173.15 - coreBuildingOffset.x, 0.24, 161.59 - coreBuildingOffset.z),
    Vector3.create(171.3 - coreBuildingOffset.x, 0.24, 163.22 - coreBuildingOffset.z),
  ]

  for (let index = 0; index < dogePathPoints.length; index++) {
    const element = dogePathPoints[index];
    createDebugEntity("Position: " + index.toString(), Vector3.add(element, Vector3.create(0, 0.5, 0)))
  }

  let dogePathData: FollowPathData = {
    path: dogePathPoints,
    loop: true,
    totalDuration: dogePathPoints.length * 3

    // curve: true,
  }

  doge = new RemoteNpc(
    { resourceName: "workspaces/genesis_city/characters/doge", id: 'Doge' },
    {
      transformData: {
        // parent: npcParent,
        position: dogePathPoints[0],
        scale: Vector3.create(2, 2, 2)
      },
      npcData: {
        type: npcLib.NPCType.CUSTOM,
        model: dogeModelPath,
        onActivate: () => {
          console.log('doge.Ai_NPC activated!')
          isActive = true

          console.log(AnalyticsLogLabel, "barNpcs.ts", "Doge")
          trackAction(doge.entity, "Interact", undefined)
          trackStart(doge.entity)

          connectNpcToLobby(REGISTRY.lobbyScene, doge)
        },
        onWalkAway: () => {
          isActive = false
          console.log("NPC", doge.name, 'walk away')

          trackEnd(doge.entity)
        
        //   closeCustomUI(false)
          closeAskNpcAiUi(false)
          hideThinking(doge)
          trtDeactivateNPC(doge)
          streamedMsgsUiControl.reset()
          if (!blockMovement) npcLib.followPath(doge.entity, dogePathData)
        },
        portrait:
        {
          path: 'images/portraits/doge/doge.png', height: 250, width: 250
          , offsetX: -100, offsetY: 10
          , section: { sourceHeight: 256, sourceWidth: 256 }
        },
        idleAnim: DOGE_NPC_ANIMATIONS.IDLE.name,
        faceUser: true,
        darkUI: true,
        coolDownDuration: 3,
        pathData: dogePathData,
        walkingAnim: DOGE_NPC_ANIMATIONS.WALK.name,
        hoverText: 'WOW',
        onlyETrigger: true,
        reactDistance: 5,
        continueOnWalkAway: false,
      },
    },
    {
      npcAnimations: DOGE_NPC_ANIMATIONS,
      thinking: {
        enabled: true,
        textEnabled: false,
        modelPath: 'models/core_building/loading-icon.glb',
        offsetX: 0,
        offsetY: 2,
        offsetZ: 0
      }
      , onEndOfRemoteInteractionStream: () => {
        // openCustomUI()
        openAskNpcAiUi()
      }
      , onEndOfInteraction: () => {
      }
    }
  )
  doge.name = "npc.doge"
  doge.predefinedQuestions = genericPrefinedQuestions
  REGISTRY.allNPCs.push(doge)
  npcLib.followPath(doge.entity)


  let debugCube = engine.addEntity()
  Transform.create(debugCube, {
    parent: doge.entity,
    position: Vector3.create(0, 1.5, 1.25),
    scale: Vector3.create(.5, .5, .5)
  })
  utils.triggers.addTrigger(debugCube, utils.LAYER_2, utils.LAYER_1,
    [
      {
        type: 'sphere',
        radius: 2,
      }
    ],
    (other) => {
      if (other === engine.PlayerEntity) {
        blockMovement = true
        if (isActive) return
        console.log("DogeView", "Hit Player Entity");
        npcLib.stopWalking(doge.entity)
      }
    },
    (other) => {
      if (other === engine.PlayerEntity) {
        blockMovement = false
        if (isActive) return
        console.log("DogeView", "Left Player Entity");
        npcLib.followPath(doge.entity, dogePathData)
      }
    },
    Color4.Green()
  )

  TrackingElement.create(doge.entity, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.doge,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })
}