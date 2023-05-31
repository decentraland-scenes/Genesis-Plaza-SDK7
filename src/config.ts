import { Vector3 } from '@dcl/sdk/math';
import { isPreviewMode } from '~system/EnvironmentApi'


const ENV = "prd";

const DEBUG_FLAGS: Record<string, boolean> = {
  "local": true,
  "prd-demo": false,
  "prd": false
}

const COLYSEUS_ENDPOINT_URL: Record<string, string> = {
  local: "ws://127.0.0.1:2567",
  localColyseus: "ws://127.0.0.1:2567",
  dev: "wss://rnd-colyseus-service.decentraland.today",
  stg: "wss://rnd-colyseus-service.decentraland.today",
  prd: "wss://rnd-colyseus-service.decentraland.org",
};

const ADMIN_RIGHTS_ANYONE: Record<string, string[]> = {
  "local": ["YOU-WALLET-HERE", "any"],
  "prd-demo": ["YOU-WALLET-HERE"],
  "prd": ["YOU-WALLET-HERE", "any"]
}


const ParcelCountX: number = 1
const ParcelCountZ: number = 1
export class Config {
  sizeXParcels: number = ParcelCountX
  sizeZParcels: number = ParcelCountZ
  sizeX!: number
  sizeY!: number
  sizeZ!: number
  TEST_CONTROLS_ENABLE: boolean = true

  ADMINS = ADMIN_RIGHTS_ANYONE[ENV]


  DEBUG_SHOW_CONNECTION_INFO = false;
  DEBUG_SHOW_PLAYER_LOGIN_INFO = false;

  TEST_CONTROLS_DEFAULT_EXPANDED = false; //if test controls expanded by default


  initAlready: boolean = false

  COLYSEUS_ENDPOINT_LOCAL = "see #initForEnv";
  COLYSEUS_ENDPOINT_NON_LOCAL = "see #initForEnv"; // prod environment
  COLYSEUS_HTTP_ENDPOINT = "see #initForEnv"; // prod environment

  IN_PREVIEW = false
  FORCE_PREVIEW_ENABLED = true

  DEBUG_ACTIVE_SCENE_TRIGGER_ENABLED = DEBUG_FLAGS[ENV]

  DEBUG_2D_PANEL_ENABLED = DEBUG_FLAGS[ENV]
  DEBUG_UI_ANNOUNCE_ENABLED = DEBUG_FLAGS[ENV]

  DEBUG_SHOW_NPC_PATH = DEBUG_FLAGS[ENV] //if npc path is lit up
  PATH_DEBUG: boolean = true


  center!: Vector3
  centerGround!: Vector3
  init() {
    const env = ENV;

    this.sizeX = ParcelCountX * 16
    this.sizeZ = ParcelCountZ * 16
    this.sizeY = (Math.log((ParcelCountX * ParcelCountZ) + 1) * Math.LOG2E) * 20// log2(n+1) x 20 //Math.log2( ParcelScale + 1 ) * 20
    this.center = Vector3.create(this.sizeX / 2, this.sizeY / 2, this.sizeZ / 2)
    this.centerGround = Vector3.create(this.sizeX / 2, 0, this.sizeZ / 2)
    this.COLYSEUS_ENDPOINT_NON_LOCAL = COLYSEUS_ENDPOINT_URL[env]
    this.COLYSEUS_ENDPOINT_LOCAL = COLYSEUS_ENDPOINT_URL[env]
    this.COLYSEUS_HTTP_ENDPOINT = COLYSEUS_ENDPOINT_URL[env].replace("wss://", "https://").replace("ws://", "http://")


  }
}

export const CONFIG = new Config()

export function initConfig() {
  console.log('stage', CONFIG, "initConfig() with ")// + DEFAULT_ENV)
  CONFIG.init()

  isPreviewMode({}).then((val: any) => {
    console.log("IN_PREVIEW", CONFIG.IN_PREVIEW, val)
    CONFIG.IN_PREVIEW = val || CONFIG.FORCE_PREVIEW_ENABLED
  })
  return CONFIG
}
