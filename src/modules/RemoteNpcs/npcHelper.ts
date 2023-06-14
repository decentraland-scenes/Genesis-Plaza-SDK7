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
      if (activeNpc.args.npcAnimations.HAPPY) result = activeNpc.args.npcAnimations.HAPPY
      break
    // case EmotionBehaviorCode.AFFECTION:
    //   if(activeNpc.args.npcAnimations.HEART_WITH_HANDS) result = activeNpc.args.npcAnimations.HEART_WITH_HANDS
    //   break
    // case EmotionBehaviorCode.STONEWALLING:
    //   if(activeNpc.args.npcAnimations.COME_ON) result = activeNpc.args.npcAnimations.COME_ON
    //   break 
    case EmotionBehaviorCode.HUMOR:
    case EmotionBehaviorCode.TENSE_HUMOR:
      if (activeNpc.args.npcAnimations.LAUGH) result = activeNpc.args.npcAnimations.LAUGH
      break
    case EmotionBehaviorCode.SADNESS:
      if (activeNpc.args.npcAnimations.SAD) result = activeNpc.args.npcAnimations.SAD
      break
    case EmotionBehaviorCode.SURPRISE:
      if (activeNpc.args.npcAnimations.SURPRISE) result = activeNpc.args.npcAnimations.SURPRISE
      break
  }
  result = result ? result : defaultEmotion
  return result; 
}