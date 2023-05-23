import { getUserData, UserData } from "~system/UserIdentity"
import { getRealm, RealmInfo } from "~system/Runtime"

export enum Rarity {
  Unique = 'unique',
  Mythic = 'mythic',
  Legendary = 'legendary',
  Epic = 'epic',
  Rare = 'rare',
  Uncommon = 'uncommon',
  Common = 'common',
}

export enum rarityLevel {
  none,
  common,
  uncommon,
  rare,
  epic,
  legendary,
  mythic,
  unique,
}
export interface Profiles {
  id: string
  type: string
  timestamp: number
  pointers: string[]
  content: any[]
  metadata: Metadata
}

export interface Metadata {
  avatars: AvatarElement[]
}

export interface AvatarElement {
  userId: string
  email: string
  name: string
  hasClaimedName: boolean
  description: string
  ethAddress: string
  version: number
  avatar: AvatarAvatar
  inventory: string[]
  blocked: string[]
  tutorialStep: number
}

export interface AvatarAvatar {
  bodyShape: string
  snapshots: Snapshots
  eyes: Eyes
  hair: Eyes
  skin: Eyes
  wearables: string[]
  version: number
}

export interface Eyes {
  color: EyesColor
}

export interface EyesColor {
  color: ColorColor
}

export interface ColorColor {
  r: number
  g: number
  b: number
  a: number
}

export interface Snapshots {
  face: string
  face128: string
  face256: string
  body: string
}

export let userData: UserData
export let playerRealm: RealmInfo

let rarestEquippedItem: rarityLevel = 0

export async function setUserData() {
  const data = await getUserData({})
  if (data) {
    console.log(data.data?.displayName)
    if(data.data === undefined) {
      console.error("user data is undefined");
      return
    }
    userData = data.data
    userData.userId = userData.userId.toLocaleLowerCase()
  }
}

// fetch the player's realm
export async function setRealm() {
  let realm = await getRealm({})
  if (realm) {
    console.log(`You are in the realm: ${JSON.stringify(realm.realmInfo?.realmName)}`)
    if(realm.realmInfo === undefined){
      console.error("realm Info is undefined");
      return
    }
    playerRealm = realm.realmInfo
    if (
      realm.realmInfo.baseUrl === 'http://127.0.0.1:8000' ||
      realm.realmInfo.baseUrl === 'http://192.168.0.18:8000'
    ) {
      realm.realmInfo.baseUrl = 'https://peer.decentraland.org'
      console.log('CHANGED REALM TO: ', realm.realmInfo.baseUrl)
    }
  }
}

/**
 * Returns profile of an address
 *
 * @param address ETH address
 */
export async function getUserInfo() {
  return (await fetch(
    `${playerRealm.baseUrl}/content/entities/profiles?pointer=${userData.userId}`
  )
    .then((res) => res.json())
    .then((res) => {
      //  log('USERINF:', res)
      return res.length ? res[0] : res
    })) as Profiles
}

/**
 * Returns wearables inventory of an address
 *
 * @param address ETH address
 */
export async function getUserInventory() {
  console.log(
    `${playerRealm.baseUrl}/lambdas/collections/wearables-by-owner/${userData.userId}?includeDefinitions`
  )
  const response = await fetch(
    `${playerRealm.baseUrl}/lambdas/collections/wearables-by-owner/${userData.userId}?includeDefinitions`
  )
  const inventory = await response.json()

  //const response = await fetch(
  //   `https://wearable-api.decentraland.org/v2/addresses/${userData.userId}/wearables`
  // )
  //const inventory: Wearable[] = await response.json()

  return inventory
}

export async function rarestItem(
  equiped: boolean = false
): Promise<rarityLevel> {
  if (!userData) await setUserData()
  if (!playerRealm) await setRealm()
  if (!userData.hasConnectedWeb3) return rarityLevel.none

  const profile = await getUserInfo()
  //log('PROFILE:, ',profile )
  const inventory = await getUserInventory()
  //log('INVENTORY:, ',inventory )
  if (!profile || !inventory) return rarityLevel.none
  // log('PROFILE: ', profile)
  //log('INVENTORY :', inventory)
  if (equiped) {
    const equipedAsUrn =
      profile.metadata.avatars[0]?.avatar?.wearables?.map(mapToUrn)
    for (const item of equipedAsUrn) {
      for (let invItem of inventory) {
        if (item === invItem.definition.id && invItem.definition.rarity) {
          updateRarity(invItem.definition.rarity)
          console.log('ONE ITEM OF RARITY ', invItem.definition.rarity)
        }
      }
    }
  } else {
    for (let invItem of inventory) {
      if (invItem.definition.rarity) {
        updateRarity(invItem.definition.rarity)
      }
    }
  }
  // log(rarityLevel[rarestEquippedItem])
  return rarestEquippedItem
}

function mapToUrn(wearableId: string) {
  if (wearableId.indexOf('dcl://') < 0) {
    // Already urn
    return wearableId
  }
  const [collectionName, wearableName] = wearableId
    .replace('dcl://', '')
    .split('/')
  if (collectionName === 'base-avatars') {
    return `urn:decentraland:off-chain:base-avatars:${wearableName}`
  } else {
    return `urn:decentraland:ethereum:collections-v1:${collectionName}:${wearableName}`
  }
}

export function updateRarity(rarity: Rarity) {
  let rarityNum: number = 0
  switch (rarity) {
    case 'common':
      rarityNum = 1
      break
    case 'uncommon':
      rarityNum = 2
      break
    case 'rare':
      rarityNum = 3
      break
    case 'epic':
      rarityNum = 4
      break
    case 'legendary':
      rarityNum = 5
      break
    case 'mythic':
      rarityNum = 6
      break
    case 'unique':
      rarityNum = 7
      break
    default:
      rarityNum = 0
      break
  }
  if (rarityNum > rarestEquippedItem) {
    rarestEquippedItem = rarityNum
    //log('new Rarest ', rarestEquippedItem, ' ')
  }
}