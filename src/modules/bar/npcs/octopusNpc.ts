import { Entity, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { coreBuildingOffset } from "../../../lobby/resources/globals";
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction, trackEnd, trackStart } from "../../stats/analyticsComponents";
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from "../../stats/AnalyticsConfig";
import * as npcLib from 'dcl-npc-toolkit'
import * as utils from '@dcl-sdk/utils'
import { navigationForwardSfx, octopusModelPath } from "../../../lobby/resources/resources";
import { LogTag } from "./barNpcs";
import { octopusDialog } from "./npcDialogs";

let octo: Entity

export function createOctopusNpc() {
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
      continueOnWalkAway: false,
      onlyETrigger: true,
      onActivate: () => {
        console.log(LogTag, "Hi! Octopus!")

        console.log(AnalyticsLogLabel, "barNpcs.ts", "Octopus")
        trackAction(octo, "Interact", undefined)
        trackStart(octo)

        npcLib.changeIdleAnim(octo, 'TalkLoop')
        npcLib.playAnimation(octo, 'TalkIntro', true, 0.63)
        //npcLib.playAnimation(octo, 'TalkLoop', false)

        npcLib.talk(octo, octopusDialog)
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
      position: Vector3.create(0, 1, 0)
    }],
    (entity) => {
      // console.log("DebugSession", "Octpus-OnTriggerEnter"); 
      if (engine.PlayerEntity === entity) {
        console.log(LogTag, "Player Enter Area");
       // npcLib.activate(octo, octo)
        npcLib.activate(entity, octo)
        utils.triggers.removeTrigger(octo)
      }
    }
  )
}