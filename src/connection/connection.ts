//
// IMPORTANT : 
// - include `noLib: false` to your tsconfig.json file, under "compilerOptions"
//
///<reference lib="es2015.symbol" />
///<reference lib="es2015.symbol.wellknown" />
///<reference lib="es2015.collection" />
///<reference lib="es2015.iterable" />

import { Client, Room } from "colyseus.js";
import { isPreviewMode, getCurrentRealm } from '~system/EnvironmentApi'
import { getPlayerData } from '~system/Players';
import { GAME_STATE } from '../modules/RemoteNpcs/state';

import { CONFIG } from "../config";
import { getUserData } from "~system/UserIdentity"
import { getRealm } from "~system/Runtime"

import { REGISTRY } from "../registry";
import { notNull } from "../utils/utilities";
import { onDisconnect } from "./onConnect";
import { CUSTOM_CODE_MANUAL_ERROR_MSG, decodeConnectionCode, isErrorCode } from "../utils/connectionUtils/connection-utils";
import { Color4 } from "@dcl/sdk/math";

const FILE_NAME: string = "connection.ts"

//export const canvas = ui.canvas

export async function connect(roomName: string, options: any = {}) {
  const METHOD_NAME: string = "connect"
  console.log(FILE_NAME, METHOD_NAME, "ENTRY", roomName, options)
  disconnect()

  const realm = await getRealm({});
  const isPreview = realm.realmInfo?.isPreview

  //
  // make sure users are matched together by the same "realm".
  //
  //realm?.displayName;

  options.realm = realm?.realmInfo?.realmName;
  options.userData = await getUserData({});

  //use other playFabUserInfo
  options.playFabData = {}

  console.log(FILE_NAME, METHOD_NAME, "userData:", options);

  // const ENDPOINT = "wss://hept-j.colyseus.dev";
  const ENDPOINT = (isPreview)
    ? CONFIG.COLYSEUS_ENDPOINT_LOCAL // local environment
    : CONFIG.COLYSEUS_ENDPOINT_NON_LOCAL; // production environment*/

  console.log(FILE_NAME, METHOD_NAME, roomName, options, "to", ENDPOINT)

  if (isPreview) { addConnectionDebugger(ENDPOINT); }
  const client = new Client(ENDPOINT);

  try {
    //
    // Docs: https://docs.colyseus.io/client/client/#joinorcreate-roomname-string-options-any
    //
    const room = await client.joinOrCreate<any>(roomName, options);
    updateConnectionGame(room, 'connect')
    if (isPreview) { updateConnectionDebugger(room); }

    return room;

  } catch (e: any) {
    console.log(FILE_NAME, METHOD_NAME, "connect FAILED", e)

    let msg = e.message
    if (msg === undefined) {
      msg = "Unable to connect to server"
    }

    updateConnectionMessage(`Error: ${msg}`, Color4.Red())

    //TODO SWITCH TO THIS onGameLeaveDisconnect(room,code)
    onGameLeaveDisconnect(undefined, CUSTOM_CODE_MANUAL_ERROR_MSG, undefined, msg)//Constants.Game_2DUI.showErrorPrompt("",`Error: ${msg}`)
    throw e;
  }
}

export async function reconnect(roomId: string, sessionId: string, options: any = {}) {
  console.log("reconnect entered", roomId, sessionId)
  const realm = await getRealm({});
  const isPreview = realm.realmInfo?.isPreview

  //const ENDPOINT = CONFIG.COLYSEUS_ENDPOINT
  const ENDPOINT = (isPreview)
    ? CONFIG.COLYSEUS_ENDPOINT_LOCAL // local environment
    : CONFIG.COLYSEUS_ENDPOINT_NON_LOCAL; // production environment*/

  console.log("reconnecting to " + ENDPOINT)
  if (isPreview || CONFIG.DEBUG_SHOW_CONNECTION_INFO) { addConnectionDebugger(ENDPOINT); }
  const client = new Client(ENDPOINT);

  try {
    //
    // Docs: https://docs.colyseus.io/client/client/#joinorcreate-roomname-string-options-any
    //
    //let newRoom = null
    //let oldRoom = GAME_STATE.gameRoom
    const newRoom = await client.reconnect(roomId, sessionId)//.then(room_instance => {
    GAME_STATE.gameRoomInstId = new Date().getTime()
    //newRoom = room_instance;
    //onjoin();
    updateConnectionGame(newRoom, 'reconnect')
    if (isPreview || CONFIG.DEBUG_SHOW_CONNECTION_INFO && newRoom !== null) { updateConnectionDebugger(newRoom); }
    console.log("Reconnected successfully!");

    return newRoom;
    // }).catch(e => {
    //     log("reconnect Error", e);
    // });

  } catch (e: any) {
    console.log("reconnect room.event.connection error", ENDPOINT, e)

    updateConnectionMessage(`Reconnect Error: ${e.message} ` + decodeConnectionCode(e.code), Color4.Red())

    //TODO SWITCH TO THIS onGameLeaveDisconnect(room,code)
    onGameLeaveDisconnect(undefined, e.code, e.message, `Reconnect Error: ${e.message} ` + decodeConnectionCode(e.code))
    //Constants.Game_2DUI.showErrorPrompt("",)
    throw e;
  }
}

//TODO: Implement Custom uI 
//let message: UIText;

export function disconnect(_consent?: boolean) {
  const METHOD_NAME: string = "disconnect"
  console.log(FILE_NAME, METHOD_NAME, "ENTRY",_consent, GAME_STATE.gameRoom)
  const consent = _consent === undefined || _consent
  if (GAME_STATE.gameRoom !== null && GAME_STATE.gameRoom !== undefined) {
    onDisconnect(GAME_STATE.gameRoom)
    console.log(FILE_NAME, METHOD_NAME, "calling leave now")
    GAME_STATE.gameRoom.leave(consent)
    if (consent && notNull(GAME_STATE.gameRoom)) GAME_STATE.gameRoom.removeAllListeners()
    if (consent) GAME_STATE.setGameRoom(null)
    updateConnectionMessage("not-connected", Color4.White())
  }
}

function addConnectionDebugger(endpoint: string) {
  /*
  if(!message || message === undefined || message === null){
      //const canvas = canvas
      message = new UIText(canvas)
      message.fontSize = 10//15
      message.width = 120
      message.height = 30
      message.hTextAlign = "center";
      message.vAlign = "bottom"
      //message.positionX = -80
      message.positionY = -20
  }
  */
  updateConnectionMessage(`Connecting to ${endpoint}`, Color4.White());
}

function updateConnectionMessage(value: string, color: Color4) {
  /*
  if(message){
      message.value = value;
      message.color = color;
  }
  */
}

function updateConnectionDebugger(room: Room) {
  updateConnectionMessage("Connected to " + room.name + "(" + room.id + ")" + "(" + room.sessionId + ")", Color4.Green());
  /*room.onLeave(() =>{ 
      log("LEFT ROOM")
          //GAME_STATE.setGameConnected('disconnected')
          updateConnectionMessage("Connection lost", Color4.Red())
          Constants.Game_2DUI.showErrorPrompt("","Connection lost")
      }
  );*/

}


const onGameLeaveDisconnect = (room: Room, code: number, msg?: string, overrideMsg?: string) => {
  //GAME_STATE.setGameRoom(null)

  if (notNull(room)) room.removeAllListeners()

  if (isErrorCode(code)) {
    //TODO PUT ERROR HERE?? Constants.Game_2DUI.showErrorPrompt("","Connection lost")
    //show error box!?!
    if (overrideMsg) {
      //REGISTRY.Game_2DUI.showErrorPrompt(undefined,overrideMsg)
    } else {
      msg = `Error: ${msg}: ` + decodeConnectionCode(code)
      //REGISTRY.Game_2DUI.showErrorPrompt(undefined,msg)
    }
  } else {
    //GOOD OR BAD MSG???
    updateConnectionMessage("Disconnected", Color4.White())
  }
  //TODO check if was notified of disconnection
  //maybe in race, if server does not talk turn this RED!!!

  onDisconnect(room, code)
  //removeGameElements()
}

function updateConnectionGame(room: Room, eventName: string) {
  const METHOD_NAME = "updateConnectionGame"
  console.log(METHOD_NAME, "ENTRY", room, eventName)
  //updateConnectionMessage("Connected.", Color4.Green());
  //https://docs.colyseus.io/colyseus/client/client/#onleave
  const instance = eventName + "." + GAME_STATE.gameRoomInstId//toLocaleDateString
  console.log(METHOD_NAME, "room.instance", instance, room.id)
  room.onLeave(((code) => {
    console.log(METHOD_NAME, instance, ".room.event.leave. updateConnectionGame room.onLeave ENTRY " + code)



    if (!isErrorCode(code)) {
      onGameLeaveDisconnect(room, code)
    } else if (GAME_STATE.gameRoom) {
      //wait 500 ms for playfab scores to sync
      console.log(METHOD_NAME, "will attempt reconnect shortly")
      //utils.setTimeout(200,()=>{  
      const oldRoom = GAME_STATE.gameRoom
      //try reconnect
      reconnect(oldRoom.id, oldRoom.sessionId, {}).then((newroom) => {
        console.log(METHOD_NAME, instance, ".ReConnected!");
        //GAME_STATE.setGameConnected('connected')

        REGISTRY.onConnectActions(newroom, "reconnect")

      }).catch((err) => {
        console.log(METHOD_NAME, instance, ".room.event.leave. reconnect failed", err, code);
        console.error(err);
        onGameLeaveDisconnect(room, code, err.message)
      });
      //})
    }
  }))
  room.onError((code, message) => {
    //console.log("oops, error ocurred:");
    //console.log(message);
    const msg = "Oops an error ocurred:" + code + " " + message
    console.log(instance, ".room.onError " + msg)

    //GAME_STATE.setGameConnected(false)

    updateConnectionMessage(msg, Color4.Red())
    //TODO SWITCH TO THIS 
    onGameLeaveDisconnect(room, code, message)
  })
}
