import * as npcLib from 'dcl-npc-toolkit'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { aishaModelPath, aritst1ModelPath, aritst2ModelPath, dogeModelPath, fashionistModelPath, navigationForwardSfx, octopusModelPath, robModelPath, simoneModelPath } from '../../../lobby/resources/resources'
import { Billboard, ColliderLayer, Entity, GltfContainer, MeshRenderer, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { artistRecommendations, fashionistCommonDialog, fashionistEpicDialog, fashionistMythicDialog, fashionistNoneDialog, getFashionistDialog, getOcotDialog, girlArtistTalk } from './npcDialogs'
import { rarestItem, rarityLevel } from './rarity'
import * as utils from '@dcl-sdk/utils'
import { coreBuildingOffset } from '../../../lobby/resources/globals'
import { RemoteNpc, hideThinking } from '../../RemoteNpcs/remoteNpc'
import { FollowPathData } from 'dcl-npc-toolkit/dist/types'
import { CONFIG } from '../../../config'
import { closeCustomUI, openCustomUI } from '../../../utils/customNpcUi/customUi'
import { NpcAnimationNameType, REGISTRY, trtDeactivateNPC } from '../../../registry'
import { connectNpcToLobby } from '../../../lobby-scene/lobbyScene'
import { genericPrefinedQuestions } from '../../../utils/customNpcUi/customUIFunctionality'
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction, trackEnd, trackStart } from '../../stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from '../../stats/AnalyticsConfig'

const LogTag: string = 'barNpcs'

const ANIM_TIME_PADD = .2

const DOGE_NPC_ANIMATIONS: NpcAnimationNameType = {
  HI: { name: "Hi", duration: 2, autoStart: undefined},
  IDLE: { name: "Idle", duration: -1},
  WALK: { name: "Walk", duration: -1 },
  TALK: { name: "Talk1", duration: 5 },
  THINKING: { name: "Thinking", duration: 5 },
  RUN: { name: "Run", duration: -1 },
  WAVE: { name: "Wave", duration: 4 + ANIM_TIME_PADD },
  LAUGH: { name: "Laugh", duration: 2, autoStart: undefined},
  HAPPY: { name: "Happy", duration: 2, autoStart: undefined},
  SAD: { name: "Sad", duration: 2, autoStart: undefined},
  SURPRISE: { name: "Surprise", duration: 2, autoStart: undefined},
} 

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

export let octo: Entity
export let fashionist: Entity
export let boyArtist: Entity
export let girlArtist: Entity
export let doge: RemoteNpc
export let simonas: RemoteNpc
export let rob: RemoteNpc
export let aisha: RemoteNpc

export function initBarNpcs(): void {
  createOctopusNpc()
  createFashionistNpc()
  createArtistCouple()
  createDogeNpc()
  createSimonas()
}

//#region octopus
function createOctopusNpc() {
  let position: Vector3 = Vector3.create(160 - coreBuildingOffset.x, 0.2, 141.4 - coreBuildingOffset.z)

  octo = npcLib.create(
    {
      position: position,
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    },
    {
      type: npcLib.NPCType.CUSTOM,
      model: octopusModelPath,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      onActivate: () => {
        console.log(LogTag, "Hi! Octopus!")

        console.log(AnalyticsLogLabel, "barNpcs.ts", "Octopus")
        trackAction(octo, "Interact", undefined)
        trackStart(octo)

        npcLib.changeIdleAnim(octo, 'TalkLoop')
        npcLib.playAnimation(octo, 'TalkIntro', true, 0.63)
        //npcLib.playAnimation(octo, 'TalkLoop', false)

        npcLib.talk(octo, getOcotDialog(octo))
        //npcLib.talkBubble(octo, getOcotDialog(octo))
      },
      onWalkAway: () => {
        console.log(LogTag, "Bye! Octopus!")
        npcLib.changeIdleAnim(octo, 'Idle')
        npcLib.playAnimation(octo, 'TalkOutro', true, 0.63)

        trackEnd(octo)
      },
      portrait: {
        path: `images/portraits/bartender.png`,
        height: 300, width: 300,
        offsetX: -80, offsetY: 25
      },
    }
  )

  TrackingElement.create(octo, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.octopus,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })

  utils.triggers.addTrigger(octo,
    utils.NO_LAYERS,
    utils.LAYER_1,
    [{
      type: 'sphere',
      radius: 3,
      position: Vector3.create(0, 0, 0)
    }],
    (entity) => {
      // console.log("DebugSession", "Octpus-OnTriggerEnter"); 
      if (engine.PlayerEntity === entity) {
        console.log("DebugSession", "Player Enter Area");
        npcLib.activate(octo)
        utils.triggers.removeTrigger(octo)
      }
    }
  )
}
//#endregion

//#region  fashionist
function createFashionistNpc(): Entity {

  let position = Vector3.create(162.65 - coreBuildingOffset.x, 0.23, 133.15 - coreBuildingOffset.z)

  fashionist = npcLib.create(
    { position: position },
    {
      type: npcLib.NPCType.CUSTOM,
      model: fashionistModelPath,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      onActivate: async () => {

        console.log(AnalyticsLogLabel, "barNpcs.ts", "Fashionist")
        trackAction(fashionist, "Interact", undefined)
        trackStart(fashionist)

        let rareItem = await rarestItem(true)

        let dialogIndex = fashionistNoneDialog

        switch (rareItem) {
          case rarityLevel.common:
          case rarityLevel.uncommon:
          case rarityLevel.rare:
            dialogIndex = fashionistCommonDialog
            break
          case rarityLevel.epic:
          case rarityLevel.legendary:
            dialogIndex = fashionistEpicDialog
            break
          case rarityLevel.mythic:
          case rarityLevel.unique:
            dialogIndex = fashionistMythicDialog
            break
        }

        npcLib.playAnimation(fashionist, `Talk`, false)
        npcLib.talk(fashionist, getFashionistDialog(fashionist), dialogIndex)

        let targetPosition = Vector3.clone(Transform.get(engine.PlayerEntity).position)
        targetPosition.y = position.y

        RotateFashionist(targetPosition)
      },
      onWalkAway: () => {
        npcLib.playAnimation(fashionist, `Idle`, false)
        RotateFashionist(position)

        trackEnd(fashionist)
      },
      portrait: {
        path: `images/portraits/WearableConnoisseur.png`,
        offsetX: -70, offsetY: 10
      }
    }
  )

  TrackingElement.create(fashionist, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.fashionist,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })

  return fashionist
}
//#endregion

//#region artistCouple
function createArtistCouple(): void {
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
      onActivate: () => {
        npcLib.activate(girlArtist)
        console.log(AnalyticsLogLabel, "barNpcs.ts", "boyArtist")
        trackAction(boy, "Interact", undefined)
        trackStart(boy)
      },
      onWalkAway: () => {
        trackEnd(boy)
      },
      textBubble: true,
      portrait: {
        path: `images/portraits/ACch2.png`,
      }
    },
  )

  TrackingElement.create(boy, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.boyArtist,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })

  npcLib.playAnimation(boy, 'Talk', false)
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
      onActivate: () => {
        activateArtists()

        console.log(AnalyticsLogLabel, "barNpcs.ts", "girlArtist")
        trackAction(girl, "Interact", undefined)
        trackStart(girl)
      },
      onWalkAway: () => {
        artistTalkToEachOther(false)
        trackEnd(girl)
      },
      textBubble: true,
      portrait: {
        path: `images/portraits/ACch2.png`,
        offsetX: -80, offsetY: 10
      }
    }
  )

  TrackingElement.create(girl, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.girlArtist,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })

  npcLib.playAnimation(girl, 'Talk', false)
  return girl
}
//#endregion

//AI POWERED NPCs 

//#region doge
function createDogeNpc(): void {
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

  let dogePath: FollowPathData = {
    path: dogePathPoints,
    loop: true,
    totalDuration: dogePathPoints.length * 3

    // curve: true,
  }

  doge = new RemoteNpc(
    { resourceName: "workspaces/genesis_city/characters/doge" },
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

          console.log(AnalyticsLogLabel, "barNpcs.ts", "Doge")
          trackAction(doge.entity, "Interact", undefined)
          trackStart(doge.entity)

          connectNpcToLobby(REGISTRY.lobbyScene, doge)
        },
        onWalkAway: () => {
          console.log("NPC", doge.name, 'walk away')

          trackEnd(doge.entity)

          closeCustomUI(false)
          hideThinking(doge)
          trtDeactivateNPC(doge)
          npcLib.followPath(doge.entity, dogePath)
        },
        portrait:
        {
          path: 'images/portraits/doge.png', height: 300, width: 300
          , offsetX: -100, offsetY: 0
          , section: { sourceHeight: 256, sourceWidth: 256 }
        },
        idleAnim: DOGE_NPC_ANIMATIONS.IDLE.name,
        faceUser: true,
        darkUI: true,
        coolDownDuration: 3,
        pathData: dogePath,
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
        openCustomUI()
      }
      , onEndOfInteraction: () => {
      }
    }
  )
  doge.name = "npc.doge"
  doge.predefinedQuestions = genericPrefinedQuestions
  REGISTRY.allNPCs.push(doge)
  npcLib.followPath(doge.entity)

  TrackingElement.create(doge.entity, {
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.doge,
  })
}
//#endregion

function createSimonas() {
  simonas = new RemoteNpc(
    { resourceName: "workspaces/genesis_city/characters/simone" },
    {
      transformData: { position: Vector3.create(38, 0.8, 57), scale: Vector3.create(1, 1, 1), rotation: Quaternion.create(0, 1, 0, 0) },
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

          closeCustomUI(false)
          hideThinking(simonas)
          trtDeactivateNPC(simonas)
        },
        portrait:
        {
          path: SIMONAS_NPC_ANIMATIONS.IDLE.portraitPath, height: 300, width: 300
          , offsetX: -100, offsetY: 0
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
        openCustomUI()
      }
      , onEndOfInteraction: () => { }
    }
  )
  simonas.name = "npc.simone"
  simonas.predefinedQuestions = genericPrefinedQuestions
  REGISTRY.allNPCs.push(simonas)

  TrackingElement.create(simonas.entity, {
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.simone,
  })
}
//#endregion

/*
//#region  Rob
const ROB_NPC_ANIMATIONS: NpcAnimationNameType = {
  HI: { name: "Hi", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/hi1.png"},
  IDLE: { name: "Idle", duration: 4, autoStart: undefined, portraitPath: "images/portaits/rob/idle1.png"},
  TALK: { name: "Talking", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/talking1.png"},
  THINKING: { name: "Thinking", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/interesting1.png"},
  LOADING: { name: "Loading", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/interesting1.png"},
  LAUGH: { name: "Laugh", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/laughing1.png"},
  HAPPY: { name: "Happy", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/happy1.png"},
  SAD: { name: "Sad", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/sad1.png"},
  SURPRISE: { name: "Surprise", duration: 2, autoStart: undefined, portraitPath: "images/portaits/rob/surprise1.png"},
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
      , onEndOfInteraction: () => {}
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
//#endregion

//#region AIsha
const AISHA_NPC_ANIMATIONS: NpcAnimationNameType = {
  HI: { name: "Hi", duration: 2, autoStart: undefined, portraitPath: "images/portaits/aisha/hi1.png"},
  IDLE: { name: "Idle", duration: 4, autoStart: undefined, portraitPath: "images/portaits/aisha/idle1.png"},
  TALK: { name: "Talking", duration: 2, autoStart: undefined, portraitPath: "images/portaits/aisha/talking1.png"},
  THINKING: { name: "Thinking", duration: 2, autoStart: undefined, portraitPath: "images/portaits/aisha/interesting1.png"},
  LOADING: { name: "Loading", duration: 2, autoStart: undefined, portraitPath: "images/portaits/aisha/interesting1.png"},
  LAUGH: { name: "Laugh", duration: 2, autoStart: undefined, portraitPath: "images/portaits/aisha/laughing1.png"},
  HAPPY: { name: "Happy", duration: 2, autoStart: undefined, portraitPath: "images/portaits/aisha/happy1.png"},
  SAD: { name: "Sad", duration: 2, autoStart: undefined, portraitPath: "images/portaits/aisha/sad1.png"},
  SURPRISE: { name: "Surprise", duration: 2, autoStart: undefined, portraitPath: "images/portaits/aisha/surprise1.png"},
}

function createAisha() {
  aisha = new RemoteNpc(
    { resourceName: "workspaces/genesis_city/characters/" },
    {
      transformData: { position: Vector3.create(3, 0, 3), scale: Vector3.create(1, 1, 1) },
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
        reactDistance: 5,
        continueOnWalkAway: false,
      }
    },
    {
      npcAnimations: AISHA_NPC_ANIMATIONS,
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
      , onEndOfInteraction: () => {}
    }
  )
  aisha.name = "npc.dclGuide"
  aisha.predefinedQuestions = genericPrefinedQuestions
  REGISTRY.allNPCs.push(aisha)

  TrackingElement.create(aisha.entity, {
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.aisha,
  })
}
//#endregion
*/

function RotateFashionist(targetPosition: Vector3) {
  let targetRotation = Quaternion.fromLookAt(
    Transform.get(fashionist).position,
    targetPosition,
    Vector3.create(0, 1, 0)
  )

  utils.tweens.startRotation(fashionist,
    Transform.get(fashionist).rotation,
    targetRotation,
    .5,
    utils.InterpolationType.LINEAR
  )
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

function createDebugEntity(text: string, position: Vector3) {
  if (!CONFIG.PATH_DEBUG) return
  let test = engine.addEntity()
  Transform.create(test, {
    position: position,
    scale: Vector3.create(.25, .25, .25)
  })
  TextShape.create(test, {
    text: text,
    textColor: Color4.Black()
  })
  Billboard.create(test)
}