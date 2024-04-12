import * as npcLib from 'dcl-npc-toolkit'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { fashionistModelPath, navigationForwardSfx } from '../../../lobby/resources/resources'
import { Entity, Transform, engine } from '@dcl/sdk/ecs'
import { fashionistCommonDialog, fashionistEpicDialog, fashionistMythicDialog, fashionistNoneDialog, getFashionistDialog } from './npcDialogs'
import { rarestItem, rarityLevel } from './rarity'
import * as utils from '@dcl-sdk/utils'
import { coreBuildingOffset } from '../../../lobby/resources/globals'
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction, trackEnd, trackStart } from '../../stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from '../../stats/AnalyticsConfig'

let fashionist: Entity

export function createFashionistNpc(): void {

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
        console.log('NPC', 'fashionist', 'walk away');
        npcLib.playAnimation(fashionist, `Idle`, false)
        RotateFashionist(position)

        trackEnd(fashionist)
      },
      portrait: {
        path: `images/portraits/WearableConnoisseur.png`,
        height: 300, width: 300,
        offsetX: -70, offsetY: -20
      }
    }
  )

  TrackingElement.create(fashionist, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.npc,
    elementId: ANALYTICS_ELEMENTS_IDS.fashionist,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })
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