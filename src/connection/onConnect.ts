import { Room, RoomAvailable } from "colyseus.js";
import { GAME_STATE, PlayerState } from "../modules/RemoteNpcs/state";
import * as clientState from "../connection/state/client-state-spec";
import * as serverState from "../connection/state/server-state-spec";
import * as serverStateSpec from "../connection/state/server-state-spec";

import * as utils from "@dcl-sdk/utils";
import { createEntityForSound } from "../utils/utilities";
import { CONFIG } from "../config";
import { REGISTRY } from "../registry";
import * as ui from 'dcl-ui-toolkit';
import { closeCustomUI } from "../utils/customNpcUi/customUi";

import { Dialog, playAnimation, talk } from "dcl-npc-toolkit";
import { ButtonData } from 'dcl-npc-toolkit/dist/types'
//import resources, { setSection } from "src/dcl-scene-ui-workaround/resources";
import { ChatNext, ChatPart, streamedMsgs } from "../modules/RemoteNpcs/streamedMsgs";
import { closeAllInteractions, createMessageObject, sendMsgToAI } from "../utils/connectionUtils/connectedUtils";
import { Color4 } from "@dcl/sdk/math";
import { Animator, AudioStream, executeTask } from "@dcl/sdk/ecs";
import { onConnectHost } from "../lobby-scene/lobbyScene";
import { endOfRemoteInteractionStream, goodBye, hideThinking } from "../modules/RemoteNpcs/remoteNpc";
import { getNpcEmotion } from "../modules/RemoteNpcs/npcHelper";

//const canvas = ui.canvas

let allRooms: RoomAvailable[] = [];
//let allPlayers:PlayerState[]=[]

//tracer function
//i need a way to sync server and client time, for now using this to later revisit
function getSharedTimeNow() {
  return Date.now();
}


//const canvas = canvas
/*const debugText = new UIText(canvas)
debugText.fontSize = 8//15
debugText.width = 120
debugText.height = 30
debugText.hTextAlign = "right";
debugText.hAlign = "right"
debugText.vAlign = "bottom"
//message.positionX = -80
debugText.positionY = -20
*/

function updateDebugText(player: serverStateSpec.PlayerState) {
  /*
  debugText.value = 
    "currentCharacterId:"+JSON.stringify(player.remoteClientCache.currentCharacterId)
    +"\ncurrentSceneTrigger:"+JSON.stringify(player.remoteClientCache.currentSceneTrigger)
  */
}

export async function onNpcRoomConnect(room: Room) {
  GAME_STATE.setGameRoom(room);

  GAME_STATE.setGameConnected("connected");


  onLevelConnect(room);

}

export function onDisconnect(room: Room, code?: number) {
  //ENEMY_MGR.removeAllPlayers();

  //room.removeAllListeners()

  GAME_STATE.setGameConnected("disconnected");

}


//function convertAndPlayAudio(sourceName:string,payloadId:string,base64Audio:string){
function convertAndPlayAudio(packet: serverStateSpec.ChatPacket) {
  const sourceName = packet.routing.source.name
  const payloadId = packet.packetId.packetId
  const base64Audio = packet.audio.chunk
  console.log("convertAndPlayAudio", payloadId)

  executeTask(async () => {
    //base64 is too big, passing payloadId and server will look it up and convert it
    //const soundClip = new AudioStream()
    //const soundSource = new AudioSource(soundClip) 
    const AUDIO_VOLUME = 1//1 //.2
    const loop = false
    const soundEntity = createEntityForSound("npcSound")//createEntitySound("npcSound", soundClip, AUDIO_VOLUME, loop)
    AudioStream.create(soundEntity, {
      url: CONFIG.COLYSEUS_HTTP_ENDPOINT + "/audio-base64-binary?payloadId=" + encodeURIComponent(payloadId),
      playing: true,
      volume: 1
    })
    REGISTRY.activeNPCSound.set(sourceName, soundEntity)
  })
}

//start fresh


function onLevelConnect(room: Room<clientState.NpcGameRoomState>) {
  //initLevelData(room.state.levelData)

  //REGISTRY.npcScene.onConnect( room )
  onConnectHost(REGISTRY.lobbyScene, room)

  room.onMessage("grid", (data) => {
    //console.log("GRID DATA: " + JSON.parse(data.grid)[0][0].infectionLevel)
    // console.log("GRID CELL: " + JSON.parse(data.grid)[0][0].infectionLevel)
    //REGISTRY.lobbyScene.grid.updateColumns(JSON.parse(data.grid))
  })


  room.onMessage("inGameMsg", (data) => {
    console.log("room.msg.inGameMsg", data);
    if (data !== undefined && data.msg === undefined) {
      GAME_STATE.notifyInGameMsg(data);
      ui.createComponent(ui.Announcement, { value: data, duration: 8, size: 60, color: Color4.White() })
    } else {
      GAME_STATE.notifyInGameMsg(data.msg);
      let dataDuration = data.duration !== undefined ? data.duration : 8
      ui.createComponent(ui.Announcement, { value: data.msg, duration: dataDuration, size: 60, color: Color4.White() })
    }

    //ui.displayAnnouncement(`${highestPlayer.name} wins!`, 8, Color4.White(), 60);
    //ui.displayAnnouncement(message, 8, Color4.White(), 60);
    //GAME_STATE.setGameEndResultMsg() 
  });

  let lastInteractionId = ""
  let playedAudioYet = false
  let npcDialog: Dialog[] = []
  let npcDialogAudioPacket: serverStateSpec.ChatPacket[] = []

  //need a managing system


  const whatIsYourName: ButtonData = {
    label: "What is your name", goToDialog: REGISTRY.askWaitingForResponse.name,
    triggeredActions: () => {
      const chatMessage: serverStateSpec.ChatMessage = createMessageObject("Please tell me your name?", undefined, room)
      sendMsgToAI(chatMessage)
    }
  }
  const whatCanIBuy: ButtonData = {
    label: "What is the PW", goToDialog: REGISTRY.askWaitingForResponse.name,
    triggeredActions: () => {
      const chatMessage: serverStateSpec.ChatMessage = createMessageObject("What is the computer password?", undefined, room)
      sendMsgToAI(chatMessage)
    }
  }

  const goodbye: ButtonData = {
    label: "Goodbye", goToDialog: REGISTRY.askWaitingForResponse.name,
    triggeredActions: () => {

      goodBye(REGISTRY.activeNPC)

      closeAllInteractions()
      closeCustomUI(true)
    }
  }
  const doYouTakeCredit: ButtonData = {
    label: "Do you take credit", goToDialog: REGISTRY.askWaitingForResponse.name,
    triggeredActions: () => {
      const chatMessage: serverStateSpec.ChatMessage = createMessageObject("Do you take credit?", undefined, room)
      sendMsgToAI(chatMessage)
    }
  }

  const askWhatCanIHelpYouWithDialog: Dialog = {
    name: "ask-generic-how-can-i-help",
    text: "Ask something else?",
    //offsetX: 60,
    isQuestion: true,
    skipable: false,
    isEndOfDialog: true,
    buttons: [whatIsYourName, whatCanIBuy, doYouTakeCredit, goodbye],
  }


  function createDialog(chatPart: ChatNext) {
    console.log("createDialog", "ENTRY", chatPart)
    //debugger    

    if (chatPart.text === undefined) {
      //if got here too late, order is messed up
      console.log("createDialog", "chatPart.end?", chatPart, "did not have text. waiting for more")
      //debugger
      streamedMsgs.waitingForMore = true
      return;
    }
    const dialog = chatPart.text.createNPCDialog()

    closeCustomUI(false)

    dialog.triggeredByNext = () => {
      const NO_LOOP = true
      console.log("DebugSession", "Play Animation", REGISTRY.activeNPC.npcAnimations.TALK.name, "for", REGISTRY.activeNPC.name);
      playAnimation(REGISTRY.activeNPC.entity, REGISTRY.activeNPC.npcAnimations.TALK.name, NO_LOOP, REGISTRY.activeNPC.npcAnimations.TALK.duration)

      //FIXME WORKAROUND, need to string dialogs together
      //or this workaround lets it end, then start a new one
      //REGISTRY.activeNPC.dialog.closeDialogWindow() //does not work
      closeAllInteractions({ exclude: REGISTRY.activeNPC })
      utils.timers.setTimeout(() => {
        if (!chatPart.endOfInteraction && !streamedMsgs.hasNextAudioNText()) {
          console.log("createDialog", "chatPart.end.hasNext?", chatPart, ". waiting for more")
          streamedMsgs.waitingForMore = true
          return;
        }
        const nextPart = streamedMsgs.next()
        //debugger 
        if (nextPart.text) {

          const nextDialog = createDialog(nextPart)

          let hasEmotion = nextPart.emotion ? true : false
          console.log("Emotions", "Do we have emotions?", hasEmotion, ':', nextPart);

          let emotion = getNpcEmotion(nextPart.emotion)

          if (hasEmotion) {
            //TODO TAG:play-emotion
            console.log("Emotions", "DisplayEmotion", nextPart.emotion.packet.emotions.behavior, "=>", emotion);
            if (CONFIG.EMOTION_DEBUG) ui.createComponent(ui.Announcement, { value: "got emotion 224-\n" + JSON.stringify(nextPart.emotion.packet.emotions), duration: 5, size: 60, color: Color4.White() }).show(5)
          }

          if (nextDialog) {
            if (hasEmotion && emotion.portraitPath) nextDialog.portrait = { path: emotion.portraitPath }
            console.log('Emotions', 'Portrait:', nextDialog.portrait);

            talk(REGISTRY.activeNPC.entity, [nextDialog]);
            console.log("Emotions", "Dialog", nextDialog);

            console.log('Emotions', 'Animation:', emotion.name);
            if (hasEmotion && emotion.name) playAnimation(REGISTRY.activeNPC.entity, emotion.name, true, emotion.duration)
          }

          if (true) {//audio optional
            if (nextPart.audio && nextPart.audio.packet.audio.chunk) {
              console.log("onMessage.structuredMsg.audio", nextPart.audio);
              convertAndPlayAudio(nextPart.audio.packet)
              //npcDialogAudioPacket.push( msg )
            }
          }
        } else {
          //check to see if this interaction id has an ending we didn't find before
          //if its part of same interactionId but not the utterace
          const checkRes = streamedMsgs._next(false, chatPart.indexStart)
          if (!chatPart.endOfInteraction && checkRes.endOfInteraction) {
            console.log("createDialog", "chatPart.end.checkRes", "thought it was not end but it is after checking latest packets")
          }
          if (chatPart.endOfInteraction || checkRes.endOfInteraction) {
            console.log("createDialog", "chatPart.end", chatPart, "end of dialog", dialog)
            //TODO find better way to detect reset
            streamedMsgs.started = false
            streamedMsgs.waitingForMore = false

            //GETTING TRIGGERED on race condition i think, audio came through but not text?
            //show input box 
            endOfRemoteInteractionStream(REGISTRY.activeNPC)
            //debugger
            //REGISTRY.activeNPC.talk([askWhatCanIHelpYouWithDialog,REGISTRY.askWaitingForResponse]);
          } else {
            streamedMsgs.waitingForMore = true
            //still waiting for more from server
            console.log("createDialog", "chatPart.end?", chatPart, "not end of chat but end of values to display. waiting for more", dialog)
          }
        }
      }, 200)
    }

    console.log("createDialog", "RETURN", "chatPart", chatPart, "dialog", dialog)

    return dialog
  }


  room.state.players.onAdd = (_player: serverStateSpec.PlayerState, sessionId: string) => {
    //workaround for now
    const player = _player as clientState.PlayerState

    console.log("room.state.players.onAdd", player);

    player.listen("remoteClientCache", (remoteClientCache: clientState.InWorldConnectionClientCacheState) => {
      console.log("room.state.players.listen.remoteClientCache", remoteClientCache);
      updateDebugText(player)
    })

    player.remoteClientCache.onChange = (remoteClientCache: serverState.InWorldConnectionClientCacheState) => {
      console.log("room.state.players.onChange.remoteClientCache", remoteClientCache);
      updateDebugText(player)
    }
  }


  room.onMessage("structuredMsg", (msg: serverStateSpec.ChatPacket) => {
    console.log("onMessage.structuredMsg", msg);
    //allRooms = rooms;
    //update_full_list();
    //clear then out

    let newInteraction = false
    newInteraction = lastInteractionId !== msg.packetId.interactionId
    lastInteractionId = msg.packetId.interactionId

    const chatPart = new ChatPart(msg)
    streamedMsgs.add(chatPart)

    console.log("onMessage", "hideThinking");
    if (REGISTRY.activeNPC) hideThinking(REGISTRY.activeNPC)

    //TODO find better way to detect reset like when last stream msg was at last?
    if (REGISTRY.activeNPC && (streamedMsgs.started == false || streamedMsgs.waitingForMore) && streamedMsgs.hasNextAudioNText()) {
      console.log("structuredMsg", "createDialog", "chatPart.start", chatPart)
      const nextPart = streamedMsgs.next()

      streamedMsgs.started = true
      streamedMsgs.waitingForMore = false
      const dialog = createDialog(nextPart)

      let hasEmotion = nextPart.emotion ? true : false
      console.log("Emotions", "Do we have emotions?", hasEmotion, ":", nextPart);

      let emotion = getNpcEmotion(nextPart.emotion)

      if (hasEmotion) {
        //TODO TAG:play-emotion 
        console.log("Emotions", "DisplayEmotion", nextPart.emotion.packet.emotions.behavior, "=>", emotion);
        if (CONFIG.EMOTION_DEBUG) ui.createComponent(ui.Announcement, { value: "got emotion 318-\n" + JSON.stringify(nextPart.emotion.packet.emotions), duration: 5, size: 60, color: Color4.White() }).show(5)
      }

      if (dialog) {
        if (hasEmotion && emotion.portraitPath) dialog.portrait = { path: emotion.portraitPath }
        console.log('Emotions', 'Portrait:', dialog.portrait);

        talk(REGISTRY.activeNPC.entity, [dialog]);
        console.log("Emotions", "Dialog", dialog);

        console.log('Emotions', 'Animation', dialog.name);
        if (hasEmotion && emotion.name) playAnimation(REGISTRY.activeNPC.entity, emotion.name, true, emotion.duration)
      } else {
        console.log("structuredMsg", "createDialog", "no dialog to show,probably just a control msg", dialog, "chatPart", chatPart, "nextPart", nextPart)
      }

      if (true) {//if(npcDialog.length ==1){
        if (nextPart.audio && nextPart.audio.packet.audio.chunk) {
          console.log("onMessage.structuredMsg.audio", msg);
          convertAndPlayAudio(nextPart.audio.packet)
          //npcDialogAudioPacket.push( msg ) 
        }
      }
    } else {
      console.log("structuredMsg", "createDialog", "chatPart.onmsg", "started:", streamedMsgs.started, "waitingForMore:", streamedMsgs.waitingForMore, "hasNextAudioNText", streamedMsgs.hasNextAudioNText())
    }
    // 


  });

  room.onMessage("inGameMsg", (data: string | serverStateSpec.ShowMessage) => {
    console.log("room.msg.inGameMsg", data);

    if (typeof data === "string") {///} || data instanceof String)
      GAME_STATE.notifyInGameMsg(data);
      //ui.displayAnnouncement(data, 8, Color4.White(), 60);
    } else {
      //if (message !== undefined && message.msg === undefined) {
      GAME_STATE.notifyInGameMsg(data.message);
      //ui.displayAnnouncement(data.title + "\n" + data.message,
      //data.duration !== undefined ? data.duration : 8, data.isError ? Color4.Red() : Color4.White(), 60);
      //}
    }

  });


  room.onMessage("showError", (data: serverStateSpec.ShowMessage) => {
    console.log("onMessage.showError", data);
    //allRooms = rooms;
    //update_full_list();
    //clear then out
    //Game_2DUI.showErrorPrompt(data.title, data.message);
    //ui.displayAnnouncement(data.title + "\n" + data.message,
    //  data.duration !== undefined ? data.duration : 8, data.isError ? Color4.Red() : Color4.White(), 40);
    console.log("Received onMessage.showError");
  });


  room.onMessage("serverTime", (data) => {
    //console.log("onMessage.serverTime", data);
    //console.log("SERVERTIME: " + data.time)
    REGISTRY.serverTime = data.time
  })

  room.onMessage("grid", (data) => {
    //console.log("onMessage.grid", data);
    //console.log("GRID DATA: " + JSON.parse(data.grid)[0][0].infectionLevel)
    // console.log("GRID CELL: " + JSON.parse(data.grid)[0][0].infectionLevel)
    //REGISTRY.lobbyScene.grid.updateColumns(JSON.parse(data.grid)) 
  })




  room.onLeave(() => {
    //allPlayers = [];
    //update_full_list();
    console.log("Bye, bye!");
  });

  room.onLeave((code) => {
    console.log("onLeave, code =>", code);
  });
}

/*
let triggerCounter = 0
for(const p of ["no_shards_given","player_gave_shards","containment_alarms_on","containment_alarms_stopped"]){
 const setTriggerShardsGiven = new Entity()
 setTriggerShardsGiven.addComponent( new OnPointerDown(()=>{
   if(GAME_STATE.gameRoom) GAME_STATE.gameRoom.send("setSceneTrigger", {name:p})  
 },{
   hoverText:"trigger:"+p 
 }))
 setTriggerShardsGiven.addComponent(new Transform({
   position:new Vector3(8,1,8+triggerCounter)
 }))
 setTriggerShardsGiven.addComponent(new BoxShape())
 triggerCounter+=2
 engine.addEntity(setTriggerShardsGiven)
}
*/