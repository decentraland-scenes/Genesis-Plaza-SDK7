import { ColliderLayer, Entity, GltfContainer, engine } from "@dcl/sdk/ecs";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import { coreBuildingOffset } from "../../../lobby/resources/globals";
import * as npcLib from 'dcl-npc-toolkit'
import { navigationForwardSfx } from "../../../lobby/resources/resources";
import * as utils from '@dcl-sdk/utils'
import { FollowPathData } from "dcl-npc-toolkit/dist/types";

let wenMoon: Entity

export function createWenMoonNpc() {
  let position: Vector3 = wenPath[0]

  wenMoon = npcLib.create(
    {
      position: position,
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    },
    {
      type: npcLib.NPCType.CUSTOM,
      model: 'models/core_building/wenMoonV12.glb',
      dialogSound: navigationForwardSfx,
      continueOnWalkAway: false,
      onlyETrigger: true,
      idleAnim: 'idle',
      coolDownDuration: 3,
      onActivate: () => {
        npcLib.stopWalking(wenMoon)
        npcLib.talk(wenMoon, wenMoonTalk, 0)
        npcLib.playAnimation(wenMoon, `TurnIn`, true, 5.77)
      },
      onWalkAway: () => {
        npcLib.playAnimation(wenMoon, 'TurnOut', true, 0.53)
        utils.timers.setTimeout(() => {
            npcLib.followPath(wenMoon, wenPathData)
        }, 535)
      },
      portrait: {
        path: `images/portraits/wenmoon.png`,
        height: 350, width: 350,
        offsetX: -100, offsetY: -20
      },
      pathData: wenPathData,
      walkingAnim: 'Walk',
      faceUser: true,
    }
  )

  GltfContainer.getMutable(wenMoon).visibleMeshesCollisionMask = ColliderLayer.CL_POINTER | ColliderLayer.CL_PHYSICS

//   for(let i = 0; i < wenPath.length; i++){
//     utils.addTestCube({position: wenPath[i], scale: Vector3.create(5, 5, 5)}, ()=>{}, '', Color4.Magenta(), true, false)
//   }
}

let wenPath = [
    Vector3.create(82, 0, 138),
    Vector3.create(52, 0, 150),
    Vector3.create(41, 0, 179),
    Vector3.create(50, 0, 220),
    Vector3.create(97, 0, 255),
    Vector3.create(132, 0, 253),
    Vector3.create(159, 0, 228),
    Vector3.create(166, 0, 201),
    Vector3.create(201, 0, 181),
    Vector3.create(204, 0, 151),
    Vector3.create(201.9, 0, 121),
    Vector3.create(205, 0, 89),
    Vector3.create(175.6, 0, 70),
    Vector3.create(159.8, 0, 75.5),
    Vector3.create(139.1, 0, 70),
    Vector3.create(116.3, 0, 84.9),
    Vector3.create(91, 0, 110),
]
let wenPathData: FollowPathData = {
    path: wenPath,
    loop: true,
    totalDuration: wenPath.length * 60,
    curve: false
  }

export let wenMoonTalk: npcLib.Dialog[] = [
	{
		text: 'Hey there! Seen any promising new coins? It’s full of them, all over the place. You just need to be at the <i>right place</i> at the <i>right time</i>..',
		skipable: true,
	},
	{
		text: 'I’m  <color="red">Wen Moon </color>, a future millionaire, you’ll see. Any minute now!',
		skipable: true,
	},
	{
		text: 'Everyone gets a break except me. But it’s a matter of time now, I got a bit of everything, you never know what’s the next big thing.',
		skipable: true,
	},
	{
		text: 'For example, my friend was really psyched about Ponzi Coin, you heard of it? He says it’s going to be huge, and he’ll even cut me a special deal if I buy it from him.',
		skipable: true,
	},
	{
		text: 'Then there’s Bad Press Coin: its value is directly tied to how many negative mentions it gets on twitter. You think it’s a bad idea? <i>Go tweet about it haha</i>',
		skipable: true,
	},
	{
		text: 'Any of these could be the <i>next bitcoin</i>...',
		skipable: true,
	},
	{
		text: '<i>Gotta get them all!</i> Haha You know, just like that yellow cat says..',
		skipable: true,
	},
	{
		text: 'You know the one… The one from that famous comic book kids read today, Poker Nom ...or something',
		skipable: true,
	},
	{
		text: 'Anyway, I’ll keep looking. I’m gonna miss my big break if I stay chatting here. See you around!',
		skipable: true,
		isEndOfDialog: true,

		triggeredByNext: () => {
            npcLib.playAnimation(wenMoon, 'TurnOut', true, 0.53)
			// wenMoon.playAnimation(`TurnOut`, true, 0.53)

			utils.timers.setTimeout(() => {
				npcLib.followPath(wenMoon, wenPathData)
			}, 535)
		},
	},
]
