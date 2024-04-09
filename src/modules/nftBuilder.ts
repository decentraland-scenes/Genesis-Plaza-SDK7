import * as utils from '@dcl-sdk/utils'
import { NFT } from './nft'
import { nftData } from './nftData'
import { Color3, Vector3, Quaternion } from '@dcl/sdk/math'
import { engine } from '@dcl/sdk/ecs'


// UI Elements
//const canvas = new UICanvas()

export function addNFTs(): void {
  // NFTs
  const cryptoKittiesNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[0].address,
    {
      position: Vector3.create(126.94, 5, 93.823),
      rotation: Quaternion.fromEulerDegrees(0, 36.068 + 180, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.75, 0.75, 1.5),
    nftData[0].id
  )

  const makersPlaceNFT1 = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[1].address,
    {
      position: Vector3.create(124.055, 5, 95.885),
      rotation: Quaternion.fromEulerDegrees(0, 36.068 + 180, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.0, 1.0, 1.5),
    nftData[1].id
  )

  const knownOriginNFT1 = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[2].address,
    {
      position: Vector3.create(116.075, 5, 102.364),
      rotation: Quaternion.fromEulerDegrees(0, 40.278 + 180, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(1.5, 0.5, 0.0),
    nftData[2].id
  )

  const axieInfinityNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[3].address,
    {
      position: Vector3.create(113.39, 5, 104.817),
      rotation: Quaternion.fromEulerDegrees(0, 45.432 + 180, 0),
      scale: Vector3.create(5, 5, 2),
    },
    Color3.create(1.25, 1.25, 1.25),
    nftData[3].id
  )

  const myCryptoHeroesNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[4].address,
    {
      position: Vector3.create(106.977, 5, 113.486),
      rotation: Quaternion.fromEulerDegrees(0, 61.533 + 180, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.25, 0.5, 1.5),
    nftData[4].id
  )

  const mlbChampionsNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[5].address,
    {
      position: Vector3.create(105.261, 5, 116.672),
      rotation: Quaternion.fromEulerDegrees(0, 61.533 + 180, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.25, 0.25, 0.25),
    nftData[5].id
  )

  const blockchainCutiesNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[6].address,
    {
      position: Vector3.create(111.754, 5, 120.193),
      rotation: Quaternion.fromEulerDegrees(0, 61.533, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(1.0, 1.1, 0.85),
    nftData[6].id
  )

  const hyperDragonsNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[7].address,
    {
      position: Vector3.create(113.465, 5, 117.004),
      rotation: Quaternion.fromEulerDegrees(0, 61.533, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.5, 1.0, 1.0),
    nftData[7].id
  )

  const chainGuardiansNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[8].address,
    {
      position: Vector3.create(118.655, 5, 110.005),
      rotation: Quaternion.fromEulerDegrees(0, 44.895, 0),

      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.0, 1.0, 1.5),
    nftData[8].id
  )

  const cryptoMorphNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[9].address,
    {
      position: Vector3.create(120.991, 5, 107.84),
      rotation: Quaternion.fromEulerDegrees(0, 40.278, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.9, 0.25, 1.25),
    nftData[9].id
  )

  const josieNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[10].address,
    {
      position: Vector3.create(128.412, 5, 101.866),
      rotation: Quaternion.fromEulerDegrees(0, 36.068, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(1.5, 0.5, 0.0),
    nftData[10].id
  )

  const superRareNFT = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[11].address,
    {
      position: Vector3.create(131.283, 5, 99.787),
      rotation: Quaternion.fromEulerDegrees(0, 36.068, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(1.25, 0.5, 1.5),
    nftData[11].id
  )

  const makersPlaceNFT2 = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[12].address,
    {
      position: Vector3.create(136.106, 5, 89.079),
      rotation: Quaternion.fromEulerDegrees(0, 23.725 + 180, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(1.0, 1.0, 1.0),
    nftData[12].id
  )

  const makersPlaceNFT3 = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[13].address,
    {
      position: Vector3.create(139.43, 5, 95.704),
      rotation: Quaternion.fromEulerDegrees(0, 23.725, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(1.5, 0.0, 0.0),
    nftData[13].id
  )

  const knownOriginNFT2 = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[14].address,
    {
      position: Vector3.create(100.982, 5, 125.806),
      rotation: Quaternion.fromEulerDegrees(0, 65.83 + 180, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.5, 0.0, 1.5),
    nftData[14].id
  )

  const knownOriginNFT3 = new NFT(
    'urn:decentraland:ethereum:erc721:' + nftData[15].address,
    {
      position: Vector3.create(107.804, 5, 128.694),
      rotation: Quaternion.fromEulerDegrees(0, 65.83, 0),
      scale: Vector3.create(4, 4, 2),
    },
    Color3.create(0.5, 0.0, 1.5),
    nftData[15].id
  )

  // Trigger
  // const nftTrigger = engine.addEntity
  // nftTrigger.addComponent(
  //   {
  //     position: Vector3.create(120.491, 5, 108.638),
  //   })
  // )
  // let triggerBox = new utils.TriggerBoxShape(
  //   Vector3.create(60, 10, 60),
  //   Vector3.Zero()
  // )
  // engine.addEntity(nftTrigger)
}
