import { Entity } from "@dcl/sdk/ecs";
import * as npcLib from "dcl-npc-toolkit";
import { NPCData } from "dcl-npc-toolkit/dist/types";

export class NpcCreationArgs {
  transformData: any
  npcData: NPCData
}

export function createNpc(args: NpcCreationArgs): Entity {
  const npc = npcLib.create(
    {
      position: args.transformData.position,
      rotation: args.transformData.rotation,
      scale: args.transformData.scale,
    },
    args.npcData
  )

  npcLib.getData(npc).portrait = args.npcData.portrait

  return npc
}