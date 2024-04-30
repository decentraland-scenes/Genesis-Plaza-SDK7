import { ColliderLayer, Entity, GltfContainer, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { coreBuildingOffset } from "../../../lobby/resources/globals";
import * as npcLib from 'dcl-npc-toolkit'
import { navigationForwardSfx } from "../../../lobby/resources/resources";

let catguy: Entity

export function createCatGuyNpc() {
  catguy = npcLib.create(
    {
        position: Vector3.create(191.8, 0.225, 68.2),
        rotation: Quaternion.fromEulerDegrees(0, 290, 0),
    },
    {
      type: npcLib.NPCType.CUSTOM,
      model: 'models/core_building/cat_guySittedV12.glb',
      dialogSound: navigationForwardSfx,
      continueOnWalkAway: false,
      onlyETrigger: true,
      idleAnim: 'idle',
      onActivate: () => {
        npcLib.playAnimation(catguy, 'talk', false)
        npcLib.talk(catguy, ILoveCats)
      },
      onWalkAway: () => {
        // npcLib.playAnimation(catguy, 'Idle', false)
      },
      portrait: {
        path: `images/portraits/catguy.png`,
        height: 300, width: 300,
        offsetX: -80, offsetY: -20
      },
    }
  )

  GltfContainer.getMutable(catguy).visibleMeshesCollisionMask = ColliderLayer.CL_POINTER | ColliderLayer.CL_PHYSICS
}

export let ILoveCats: npcLib.Dialog[] = [
	{
		text: `Hey there! Let me introduce myself. I’m the cat guy`,
		skipable: true,
	},
	{
		text: `That’s what everyone calls me. Or well, my cats don’t call me anything really, I wish they did. But if people other than my cats were to hang out with me, that’s what they’d call me for sure.`,
		skipable: true,
	},
	{
		text: `You’re welcome to call me that, but no pressure. But you see I’m really into cats, that’s my thing.`,
		skipable: true,
	},
	{
		text: `So it would make sense to call me the  <color="red">cat guy </color>.`,

		skipable: true,
	},
	{
		text: `I’m sorry, I’m talking about cats again. Such a broken record, aren’t I? Like a cat that won’t stop meowing all day.`,

		skipable: true,
	},
	{
		text: `Dammit!`,
		skipable: true,
		isEndOfDialog: true,
		triggeredByNext: () => {
            npcLib.playAnimation(catguy, 'idle', false)
			// catguy.playAnimation('idle')
		},
	},
]