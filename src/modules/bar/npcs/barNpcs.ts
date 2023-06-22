import * as utils from '@dcl-sdk/utils'
import { initDialogs as initWaitingDialog } from '../../../modules/RemoteNpcs/waitingDialog'
import { LobbyScene } from '../../../lobby-scene/lobbyScene'
import { Room } from 'colyseus.js'
import { onNpcRoomConnect } from '../../../connection/onConnect'
import { createDogeNpc } from './dogeNpc'
import { createOctopusNpc } from './octopusNpc'
import { createFashionistNpc } from './fashionistNpc'
import { createArtistCouple } from './artistCoupleNpcs'
import { createSimonas } from './simonasNpc'
import { createAisha } from './aishaNpc'
import { REGISTRY } from '../../../registry'

export const LogTag: string = 'barNpcs'

const aishaSpawnSecondsDelay = 5

let npcFrameworkAdded: boolean = false
let barNpcsAdded: boolean = false
let outsideNpcAdded: boolean = false

export function initNpcFramework() {
  if (npcFrameworkAdded) return
  npcFrameworkAdded = true

  //Quests
  initWaitingDialog()

  REGISTRY.lobbyScene = new LobbyScene()
  REGISTRY.onConnectActions = (room: Room<any>, eventName: string) => {
    //npcConn.onNpcRoomConnect(room)
    onNpcRoomConnect(room)
  }

}
export function initBarNpcs(): void {
  if (barNpcsAdded) return
  barNpcsAdded = true

  initNpcFramework()

  createOctopusNpc()
  createFashionistNpc()
  createArtistCouple()
  createDogeNpc()
  createSimonas()
}

export function initOutsideNpcs(delay?: number): void {
  if (outsideNpcAdded) return

  outsideNpcAdded = true

  initNpcFramework()

  utils.timers.setTimeout(() => {
    createAisha()
  }, delay ? delay : aishaSpawnSecondsDelay * 1000)
}
