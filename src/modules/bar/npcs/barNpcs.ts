import * as npcLib from 'dcl-npc-toolkit'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { aritst1Model, aritst2Model, fashionistModel, navigationForwardSfx, octopusModel } from '../../../lobby/resources/resources'
import { Billboard, Entity, MeshRenderer, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { artistRecommendations, fashionistCommonDialog, fashionistEpicDialog, fashionistMythicDialog, fashionistNoneDialog, getFashionistDialog, getOcotDialog, girlArtistTalk } from './npcDialogs'
import { rarestItem, rarityLevel } from './rarity'
import * as utils from '@dcl-sdk/utils'
import { barCenter, coreBuildingOffset } from '../../../lobby/resources/globals'
import { RemoteNpc, hideThinking } from '../../RemoteNpcs/remoteNpc'
import { FollowPathData } from 'dcl-npc-toolkit/dist/types'
import { CONFIG } from '../../../config'
import { closeCustomUI, openCustomUI } from '../../../utils/customNpcUi/customUi'
import { NpcAnimationNameType, REGISTRY, trtDeactivateNPC } from '../../../registry'
import { connectNpcToLobby } from '../../../lobby-scene/lobbyScene'
import { genericPrefinedQuestions } from '../../../utils/customNpcUi/customUIFunctionality'

const LogTag: string = 'barNpcs'

const ANIM_TIME_PADD = .2

const DOGE_NPC_ANIMATIONS: NpcAnimationNameType = {
  IDLE: { name: "Idle", duration: -1 },
  WALK: { name: "Walk", duration: -1 },
  TALK: { name: "Talk1", duration: 5 },
  THINKING: { name: "Thinking", duration: 5 },
  RUN: { name: "Run", duration: -1 },
  WAVE: { name: "Wave", duration: 4 + ANIM_TIME_PADD },
}

const npcParent: Entity = createBarParentEntity()
export let octo: Entity
export let fashionist: Entity
export let boyArtist: Entity
export let girlArtist: Entity
export let doge: RemoteNpc

export function initBarNpcs(): void {
  createOctopusNpc()
  createFashionistNpc()
  createArtistCouple()
  createDogeNpc()
}

function createBarParentEntity(): Entity {
  let result = engine.addEntity()
  Transform.create(result, {
    position: Vector3.create(24, 0, 40)
  })
  // MeshRenderer.setBox(result)
  return result
}

function createOctopusNpc() {
  let position: Vector3 = Vector3.create(160 - coreBuildingOffset.x, 0.2, 141.4 - coreBuildingOffset.z)

  octo = npcLib.create(
    {
      position: position,
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    },
    {
      type: npcLib.NPCType.CUSTOM,
      model: octopusModel,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      onActivate: () => {
        console.log(LogTag, "Hi! Octopus!")

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
      },
      portrait: {
        path: `images/portraits/bartender.png`,
        height: 300, width: 300,
        offsetX: -80, offsetY: 25
      },
    }
  )

  utils.triggers.addTrigger(octo,
    utils.LAYER_1,
    utils.ALL_LAYERS,
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

  //let playerTriggerEntity = engine.addEntity()
  //Transform.create(playerTriggerEntity, {
  //  parent: engine.PlayerEntity,
  //  position: Vector3.create(0, 0, 0)
  //})
  //utils.triggers.addTrigger(
  //  playerTriggerEntity,
  //  utils.LAYER_1,
  //  utils.ALL_LAYERS,
  //  [{
  //    type: 'sphere',
  //    radius: 1
  //  }],
  //)

  // utils.triggers.enableDebugDraw(true)

}

function createFashionistNpc(): void {

  let position = Vector3.create(162.65 - coreBuildingOffset.x, 0.23, 133.15 - coreBuildingOffset.z)

  fashionist = npcLib.create(
    { position: position },
    {
      type: npcLib.NPCType.CUSTOM,
      model: fashionistModel,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      onActivate: async () => {

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
      },
      portrait: {
        path: `images/portraits/WearableConnoisseur.png`,
        offsetX: -70, offsetY: 10
      }
    }
  )
}


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
      model: aritst1Model,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      onActivate: () => {
        npcLib.activate(girlArtist)
      },
      onWalkAway: () => { },
      textBubble: true,
      portrait: {
        path: `images/portraits/ACch2.png`,
      }
    },
  )

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
      model: aritst2Model,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      onActivate: () => {
        activateArtists()
      },
      onWalkAway: () => {
        artistTalkToEachOther(false)
      },
      textBubble: true,
      portrait: {
        path: `images/portraits/ACch2.png`,
        offsetX: -80, offsetY: 10
      }
    }
  )

  npcLib.playAnimation(girl, 'Talk', false)
  return girl
}

function createDogeNpc(): void {
  let parentPosition = Transform.get(npcParent).position
  // - coreBuildingOffset.z - parentPosition.z
  let dogePathPoints = [
    Vector3.create(166.7 - coreBuildingOffset.x - parentPosition.x, 0.24, 163. - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(161 - coreBuildingOffset.x - parentPosition.x, 0.24, 160 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(157.5 - coreBuildingOffset.x - parentPosition.x, 0.24, 157.4 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(153.7 - coreBuildingOffset.x - parentPosition.x, 0.24, 156.2 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(148.1 - coreBuildingOffset.x - parentPosition.x, 0.24, 156.8 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(146.4 - coreBuildingOffset.x - parentPosition.x, 0.24, 156 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(143.1 - coreBuildingOffset.x - parentPosition.x, 0.24, 153.1 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(143 - coreBuildingOffset.x - parentPosition.x, 0.24, 152.8 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(143.2 - coreBuildingOffset.x - parentPosition.x, 0.24, 150.7 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(143.26 - coreBuildingOffset.x - parentPosition.x, 0.24, 147.5 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(148.1 - coreBuildingOffset.x - parentPosition.x, 0.24, 142.3 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(151.9 - coreBuildingOffset.x - parentPosition.x, 0.24, 142.3 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(153.8 - coreBuildingOffset.x - parentPosition.x, 0.24, 144.9 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(154 - coreBuildingOffset.x - parentPosition.x, 0.24, 146.9 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(154.6 - coreBuildingOffset.x - parentPosition.x, 0.24, 149.57 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(156.65 - coreBuildingOffset.x - parentPosition.x, 0.24, 154.7 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(162.3 - coreBuildingOffset.x - parentPosition.x, 0.24, 156.2 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(166.4 - coreBuildingOffset.x - parentPosition.x, 0.24, 156.1 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(169.7 - coreBuildingOffset.x - parentPosition.x, 0.24, 156.2 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(171.9 - coreBuildingOffset.x - parentPosition.x, 0.24, 157.8 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(173.8 - coreBuildingOffset.x - parentPosition.x, 0.24, 158.7 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(173.8 - coreBuildingOffset.x - parentPosition.x, 0.24, 160.1 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(173.15 - coreBuildingOffset.x - parentPosition.x, 0.24, 161.59 - coreBuildingOffset.z - parentPosition.z),
    Vector3.create(171.3 - coreBuildingOffset.x - parentPosition.x, 0.24, 163.22 - coreBuildingOffset.z - parentPosition.z),
  ]

  for (let index = 0; index < dogePathPoints.length; index++) {
    const element = dogePathPoints[index];
    createDebugEntity("Position: " + index.toString(), Vector3.add(element, Vector3.create(0, 0.5, 0)))
  }

  let dogePath: FollowPathData = {
    path: dogePathPoints,
    loop: true,
    totalDuration: dogePathPoints.length * 4
    // curve: true,
  }

  doge = new RemoteNpc(
    { resourceName: "workspaces/genesis_city/characters/doge" },
    {
      transformData: {
        parent: npcParent,
        position: dogePathPoints[0],
        scale: Vector3.create(2, 2, 2)
      },
      npcData: {
        type: npcLib.NPCType.CUSTOM,
        model: 'models/core_building/dogeNPC_anim4.glb',
        onActivate: () => {
          console.log('doge.Ai_NPC activated!')
          connectNpcToLobby(REGISTRY.lobbyScene, doge)
        },
        onWalkAway: () => {
          console.log("NPC", doge.name, 'walk away')
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
}


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
    parent: npcParent,
    position: position,
    scale: Vector3.create(.25, .25, .25)
  })
  TextShape.create(test, {
    text: text,
    textColor: Color4.Black()
  })
  Billboard.create(test)
}