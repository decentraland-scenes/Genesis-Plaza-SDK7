import { Room } from "colyseus.js";

import * as clientState from "../../connection/state/client-state-spec";
import * as serverStateSpec from "../../connection/state/server-state-spec";
import { GAME_STATE } from "../../modules/RemoteNpcs/state";


import { closeDialog } from "dcl-npc-toolkit/dist/dialog";
import { closeCustomUI } from "../customNpcUi/customUi";
import { REGISTRY } from "../../registry";
import { RemoteNpc, endInteraction, startThinking } from '../../modules/RemoteNpcs/remoteNpc';
import * as ui from 'dcl-ui-toolkit';
import { Color4 } from "@dcl/sdk/math";

const FILE_NAME = "connectedUtils.ts"

/**
 * NOTE endInteraction results in player going into STANDING state, need way to resume last action
 * @param ignore 
 */
export function closeAllInteractions(opts?: { exclude?: RemoteNpc, resumeLastActivity?: boolean }) {
  for (const npc of REGISTRY.allNPCs) {
    if (opts?.exclude === undefined || npc != opts.exclude) {
      console.log("closeAllInteractions ", npc.name)
      endInteraction(npc)

      //if(REGISTRY.activeNPCSound.get())
      //p.dialog.closeDialogWindow()
    } else {
      //just close the dialog
      closeDialog(npc.entity)
    }
  }
}

export function sendMsgToAI(msg: serverStateSpec.ChatMessage) {
  const METHOD_NAME = "sendMsgToAI"
  console.log(FILE_NAME, METHOD_NAME, "ENTRY", msg)

  if (msg === undefined || msg.text.text.trim().length === 0) {
    ui.createComponent(ui.Announcement, { value: "cannot send empty message", duration: 8, size: 60, color: Color4.White() })
    return
  }
  console.log(FILE_NAME, METHOD_NAME, "Message to Send", msg)
  //hide input
  closeCustomUI(false)
  //mark waiting for reply
  startThinking(REGISTRY.activeNPC, [REGISTRY.askWaitingForResponse])
  //wrap it in object
  if (GAME_STATE.gameRoom) GAME_STATE.gameRoom.send("message", msg)
}

let lastCharacterId: serverStateSpec.CharacterId = undefined

export function createMessageObject(msgText: string, characterId: serverStateSpec.CharacterId, room: Room<clientState.NpcGameRoomState>) {
  const chatMessage: serverStateSpec.ChatMessage = new serverStateSpec.ChatMessage({
    date: new Date().toUTCString(),
    packetId: { interactionId: "", packetId: "", utteranceId: "" },
    type: serverStateSpec.ChatPacketType.TEXT,
    text: { text: msgText, final: true },
    routing:
    {
      source: { isCharacter: false, isPlayer: true, name: room.sessionId, xId: { resourceName: room.sessionId } }
      , target: { isCharacter: true, isPlayer: false, name: "", xId: characterId ? characterId : lastCharacterId }
    },
  })
  if (!characterId) {
    console.log("createMessageObject using lastCharacterId", lastCharacterId)
  }
  if (characterId) lastCharacterId = characterId
  return chatMessage
}


