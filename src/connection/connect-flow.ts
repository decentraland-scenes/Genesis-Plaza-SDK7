import { GAME_STATE } from '../modules/RemoteNpcs/state';

import { connect, disconnect, reconnect } from './connection';
import { Room } from 'colyseus.js';
import { REGISTRY } from '../registry';
import { preventConcurrentExecution } from '../utils/utilities';


const FILE_NAME: string = "connect-flow.ts"

export function leave(consent?: boolean) {
  disconnect(consent)
}

export function joinNewRoom() { }

export async function joinOrCreateRoom(roomName: string, options: any = {}) {
  console.log("connect-flow", "joinOrCreateRoom", roomName, options)
  await connect(roomName, options).then((room: Room<any>) => {
    console.log("connect-flow", "joinOrCreateRoom", roomName, options, "Connected!")

    REGISTRY.onConnectActions(room, "reconnect")

  }).catch((err: any) => {
    console.log("connect-flow", "joinOrCreateRoom", roomName, options, "ERROR!", err)
    console.error(err);
  });
}

let joinOrCreateRoomAsync_roomName: string
let joinOrCreateRoomAsync_options: any = {}
export const _joinOrCreateRoomAsync = preventConcurrentExecution("joinOrCreateRoomAsync", async () => {
  let retVal: Room<any>

  const roomName: string = joinOrCreateRoomAsync_roomName
  const options: any = joinOrCreateRoomAsync_options

  retVal = await connect(roomName, options)
  console.log("connect-flow", "_joinOrCreateRoomAsync", roomName, options, "Connected!")

  REGISTRY.onConnectActions(retVal, "reconnect")

  return retVal;
})
export async function joinOrCreateRoomAsync(roomName: string, options: any = {}): Promise<Room<any>> {

  const METHOD_NAME = "joinOrCreateRoomAsync"
  console.log(FILE_NAME, METHOD_NAME, "ENTRY")

  joinOrCreateRoomAsync_roomName = roomName
  joinOrCreateRoomAsync_options = options

  const promise: Promise<Room<any>> = new Promise(async (resolve, reject) => {
    try {
      let loginRes: Room<any>
      loginRes = await _joinOrCreateRoomAsync()
      resolve(loginRes)
      console.log(FILE_NAME, METHOD_NAME, "ENTRY", "ResolvePromise")
    } catch (e) {
      console.log(FILE_NAME, METHOD_NAME, "joinOrCreateRoomAsync failed ", e)
      //if(CONFIG.ENABLE_DEBUGGER_BREAK_POINTS) debugger
      reject(e)
    }
  })
  //if doconsole.LoginFlowAsync is preventConcurrentExecution wrapped
  //confirmed that if it returns the same promise or a new one
  //promise.then just adds more to the callback so all callers
  //will get their callbacks ran
  promise.then(() => {
    /*if(callback && callback.onSuccess){
        console.log("doconsole.LoginFlow calling callback. onSuccess")
        callback.onSuccess()
    }else{
        console.log("doconsole.LoginFlow success,no callback. onSuccess")
    }*/
  })
  return promise
}

//START colyseusConnect//START colyseusConnect//START colyseusConnect
export const colyseusReConnect = () => {
  const oldRoom = GAME_STATE.gameRoom
  if (oldRoom !== null && oldRoom !== undefined) {
    const oldRoomId = oldRoom.id
    const oldRoomName = oldRoom.name
    console.log("attempt to reconnect to ", oldRoomId, oldRoom)
    reconnect(oldRoom.id, oldRoom.sessionId, {}).then((room: Room<any>) => {
      console.log("ReConnected!");
      //GAME_STATE.setGameConnected('connected')

      //onJoinActions(room,"reconnect")
      REGISTRY.onConnectActions(room, "reconnect")

    }).catch((err: any) => {
      console.log("connect-flow", "colyseusReConnect", oldRoomId, oldRoomName, oldRoom, "ERROR!", err)
      console.error(err);
    });
  } else {
    console.log("was not connected")
  }
}//end colyseusConnect
