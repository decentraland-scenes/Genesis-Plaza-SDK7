import { Animator, Entity, Transform } from "@dcl/sdk/ecs";
import * as npcLib from "dcl-npc-toolkit";
import { NPCData } from "dcl-npc-toolkit/dist/types";
import { EmotionBehaviorCode } from "../../connection/state/server-state-spec";
import { NpcAnimationNameDef, REGISTRY } from "../../registry";
import { ChatPart } from "./streamedMsgs";

export class NpcCreationArgs {
  transformData: any
  npcData: NPCData
}

export function createNpc(args: NpcCreationArgs): Entity {
  const npc = npcLib.create(
    {
      parent: args.transformData.parent,
      position: args.transformData.position,
      rotation: args.transformData.rotation,
      scale: args.transformData.scale,
    },
    args.npcData
  )

  npcLib.getData(npc).portrait = args.npcData.portrait
  Transform.getMutable(npc).parent = args.transformData.parent

  return npc
}


export function getNpcEmotion(emotion: ChatPart): NpcAnimationNameDef {
  const activeNpc = REGISTRY.activeNPC;

  let npcData = (npcLib.getData(activeNpc.entity) as NPCData)
  const defaultEmotion: NpcAnimationNameDef = {
    portraitPath: REGISTRY.activeNPC.args.npcAnimations.TALK.portraitPath,
    name: REGISTRY.activeNPC.args.npcAnimations.TALK.name,
    duration: 2
  }

  if (!emotion) {
    console.log("Emotions", "Return Default");
    return defaultEmotion
  }

  let result: NpcAnimationNameDef = undefined;
  switch (emotion.packet.emotions.behavior) {
    case EmotionBehaviorCode.JOY:
      result = activeNpc.args.npcAnimations.HAPPY
      break
    // case EmotionBehaviorCode.AFFECTION:
    //   result = activeNpc.args.npcAnimations.HEART_WITH_HANDS
    //   break
    // case EmotionBehaviorCode.STONEWALLING:
    //   result = activeNpc.args.npcAnimations.COME_ON
    //   break
    case EmotionBehaviorCode.HUMOR:
    case EmotionBehaviorCode.TENSE_HUMOR:
      result = activeNpc.args.npcAnimations.LAUGH
      break
    case EmotionBehaviorCode.SADNESS:
      result = activeNpc.args.npcAnimations.SAD
      break
    case EmotionBehaviorCode.SURPRISE:
      result = activeNpc.args.npcAnimations.SURPRISE
      break
  }
  result = result ? result : defaultEmotion
  return result;
}

export function isBeingPlayed(npc: Entity, animation: string): boolean {
  if (!npc) return false
  if (!animation) return false
  return Animator.getClip(npc, animation).playing
}