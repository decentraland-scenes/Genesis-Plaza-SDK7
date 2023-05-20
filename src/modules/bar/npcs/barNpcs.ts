import * as npcLib from 'dcl-npc-toolkit'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { aritst1Model, aritst2Model, fashionistModel, navigationForwardSfx, octopusModel } from '../../../lobby/resources/resources'
import { Entity, Transform, engine } from '@dcl/sdk/ecs'
import { artistRecommendations, fashionistCommonDialog, fashionistEpicDialog, fashionistMythicDialog, fashionistNoneDialog, getFashionistDialog, getOcotDialog, girlArtistTalk } from './npcDialogs'
import { rarestItem, rarityLevel } from './rarity'
import * as utils from '@dcl-sdk/utils'

const LogTag: string = 'barNpcs'

export let octo: Entity
export let fashionist: Entity
export let boyArtist: Entity
export let girlArtist: Entity

export function initBarNpcs(): void {
  createOctopusNpc()

  fashionist = createFashionistNpc()

  createArtistCouple()
}

function createOctopusNpc() {
  let position: Vector3 = Vector3.create(160, 0.2, 141.4)

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

function createFashionistNpc(): Entity {

  let position = Vector3.create(162.65, 0.23, 133.15)

  let fashionist = npcLib.create(
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
    }
  )

  return fashionist
}


function createArtistCouple(): void {
  boyArtist = createBoyArtist()
  girlArtist = createGirlArtist()

  npcLib.talkBubble(girlArtist, girlArtistTalk)
}

function createBoyArtist(): Entity {
  let boy = npcLib.create(
    {
      position: Vector3.create(142.9, -0.2, 165.7),
      rotation: Quaternion.fromEulerDegrees(0, 180 + 90, 0)
    },
    {
      type: npcLib.NPCType.CUSTOM,
      model: aritst1Model,
      dialogSound: navigationForwardSfx,
      onlyETrigger: true,
      onActivate: () => {
        activateArtists()
      },
      onWalkAway: () => { },
      textBubble: true,
    }
  )

  npcLib.playAnimation(boy, 'Talk', false)
  return boy
}

function createGirlArtist(): Entity {
  let girl = npcLib.create(
    {
      position: Vector3.create(142.9, -0.2, 165.7),
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
        //artistTalkToEachOther(false)
      },
      textBubble: true,
    }
  )

  npcLib.playAnimation(girl, 'Talk', false)
  return girl
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
