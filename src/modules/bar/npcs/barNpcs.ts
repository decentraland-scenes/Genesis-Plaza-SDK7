import * as npcLib from '@dcl-sdk/npc-utils'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { aritst1Model, aritst2Model, fashionistModel, navigationForwardSfx, octopusModel } from '../../../lobby/resources/resources'
import { Entity, Transform, engine } from '@dcl/sdk/ecs'
import { artist1TalkToUser, artist2TalkToUser, artistConversation, artistRecommendations, fashionistCommonDialog, fashionistEpicDialog, fashionistMythicDialog, fashionistNoneDialog, getFashionistDialog, getOcotDialog } from './npcDialogs'
import { rarestItem, rarityLevel } from './rarity'
import { triggers } from '@dcl-sdk/utils'
import * as utils from '@dcl-sdk/utils'
import { coreBuildingOffset } from '../../../lobby/resources/globals'


const LogTag: string = 'barNpcs'

export let octo: Entity
export let fashionist: Entity
export let artist1: Entity
export let artist2: Entity

export function initBarNpcs(): void {
  octo = createOctopusNpc()
  fashionist = createFashionistNpc()

  artist1 = createMainArtist()
  artist2 = createSecondaryArtist()
}

function createOctopusNpc(): Entity {
  let octo = createNpc({
    position: Vector3.create(160 - coreBuildingOffset.x, 0.2, 141.4 - coreBuildingOffset.z),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  },
    octopusModel,
    navigationForwardSfx,
    () => {
      // console.log(LogTag, "Hi! Octopus!")
      npcLib.talk(octo, getOcotDialog(octo))

      npcLib.changeIdleAnim(octo, 'TalkLoop')
      npcLib.playAnimation(octo, 'TalkIntro', true, 0.63)
    },
    () => {
      // console.log(LogTag, "Bye! Octopus!")
      npcLib.changeIdleAnim(octo, 'Idle')
      npcLib.playAnimation(octo, 'TalkOutro', true, 0.63)
    },
    false,
  )
  /* Manage single time on trigger enter to auto activate the octopus for entering the bar for the 1st time 
  let triggerArea = engine.addEntity()
  Transform.create(triggerArea, {
    position: Vector3.create(160, 1.5, 148.4),
  })
  MeshRenderer.setBox(triggerArea)
  triggers.enableDebugDraw(true)
  triggers.addTrigger(
    triggerArea,
    undefined,
    undefined,
    [{
      type: 'sphere',
      position: Vector3.create(0, 0, 0),
      radius: 3,
    }
    ],
    (entity: Entity) => {
      console.log(LogTag, "Enter");
      if (entity === engine.CameraEntity)
        console.log(LogTag, "Camera Enter");
    },
    (entity: Entity) => {
      console.log(LogTag, "Exit");
      if (entity === engine.CameraEntity)
        console.log(LogTag, "Camera Exit");
    },
    Color3.Green(),
  )
  */

  return octo
}

function createFashionistNpc(): Entity {

  let position = Vector3.create(162.65 - coreBuildingOffset.x, 0.23, 133.15 - coreBuildingOffset.z)

  let fashionist = createNpc(
    { position: position },
    fashionistModel,
    navigationForwardSfx,
    async () => {
      // console.log(LogTag, "Hi! Fashionist!")

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

      //utils.tweens.startRotation(npc,
      //  Transform.get(npc).rotation,
      //  Quaternion.fromEulerDegrees(0, 0, 0),
      //  1 
      //)

      npcLib.playAnimation(fashionist, `Talk`, false)
      npcLib.talk(fashionist, getFashionistDialog(fashionist), dialogIndex)

      let targetPosition = Vector3.clone(Transform.get(engine.PlayerEntity).position)
      targetPosition.y = position.y

      RotateFashionist(targetPosition)
    },
    () => {
      // console.log(LogTag, "Bye! Fashionist!")
      npcLib.playAnimation(fashionist, `Idle`, false)
      RotateFashionist(position)
    },
    false
  )

  return fashionist
}

function createMainArtist(): Entity {
  let mainArtist = createNpc(
    {
      position: Vector3.create(142.9 - coreBuildingOffset.x, -0.2, 165.7 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180 + 90, 0)
    },
    aritst1Model,
    navigationForwardSfx,
    () => {
      // console.log(LogTag, "Hi! Artist1!")
      artist1TalkToUser()
      npcLib.talk(artist1, artistRecommendations)
    },
    () => {
      // console.log(LogTag, "Bye! Artist1!")
      npcLib.playAnimation(mainArtist, 'Talk', false)
    },
    false,
  )

  npcLib.playAnimation(mainArtist, 'Talk', false)
  return mainArtist
}

function createSecondaryArtist(): Entity {
  let secondArtist = createNpc(
    {
      position: Vector3.create(142.9 - coreBuildingOffset.x, -0.2, 165.7 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180 + 90, 0)
    },
    aritst2Model,
    navigationForwardSfx,
    () => {
      // console.log(LogTag, "Hi! Artist2!")
      artist2TalkToUser()
      npcLib.talk(secondArtist, artistRecommendations)
    },
    () => {
      // console.log(LogTag, "Bye! Artist2!")
      npcLib.playAnimation(secondArtist, 'Talk', false)
    },
    false
  )

  npcLib.playAnimation(secondArtist, 'Talk', false)
  return secondArtist
}

function createNpc(transformData: any, modelPath: string, sfxPath: string,
  onActivate: () => void, onWalkAway: () => void, faceUser: boolean): Entity {
  const npc = npcLib.create(
    {
      position: transformData.position,
      rotation: transformData.rotation,
    },
    {
      type: npcLib.NPCType.CUSTOM,
      model: modelPath,
      onActivate: () => {
        onActivate()
      },
      onWalkAway: () => {
        onWalkAway()
      },
      faceUser: faceUser,
      dialogSound: sfxPath,
      onlyETrigger: true,
      coolDownDuration: 3,
    }
  )

  return npc
}

function RotateFashionist(targetPosition: Vector3){
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