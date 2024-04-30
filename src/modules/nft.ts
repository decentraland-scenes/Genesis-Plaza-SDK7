import { Entity, NftShape, engine, Transform, TransformTypeWithOptionals, PBNftShape, AvatarAttach, AvatarAnchorPointType, AudioSource, pointerEventsSystem, InputAction } from '@dcl/sdk/ecs'
import { nftData } from './nftData'
import { Color3 } from '@dcl/sdk/math'
import { openNftDialog } from '~system/RestrictedActions'

export class NFT{
  public entity:Entity
  public id: number
  private sound: Entity = engine.addEntity()

  constructor(nft: string, transform: TransformTypeWithOptionals, color: Color3, id: number) {
    this.entity = engine.addEntity()  
    

    console.log("CREATING NFT: URN: " + nft)
    NftShape.createOrReplace(this.entity, {
      urn: nft, 
      color: color
    } )
    //this.addComponent(nft)
    Transform.create(this.entity, transform)
   // this.addComponent(transform)

    //this.getComponent(NFTShape).color = color
    this.id = id

    // Sound
    Transform.createOrReplace(this.sound)
    AvatarAttach.create(this.sound, {
      anchorPointId: AvatarAnchorPointType.AAPT_NAME_TAG,
    })
    //this.sound.addComponent(new Transform())

    AudioSource.createOrReplace(this.sound, {
      audioClipUrl: "sounds/navigationForward.mp3"
    })
    // this.sound.addComponent(
    //   new AudioSource(resources.sounds.ui.navigationForward)
    // )
    // engine.addEntity(this.sound)
    // this.sound.setParent(Attachable.AVATAR)

    
    pointerEventsSystem.onPointerDown(
      {
        entity: this.entity,
        opts: { button: InputAction.IA_PRIMARY, hoverText: 'More Info', maxDistance: 8 },
      },
      function () {
        
        openNftDialog({
          //TODO : TEST 0 ONLY FOR NOW, BUT SHOULD BE ID
          urn: nftData[0].address,
        })
      }
    )

    // this.addComponent(
    //   new OnPointerDown(
    //     (e): void => {
    //       this.sound.getComponent(AudioSource).playOnce()
    //       openNFTDialog(nft.src, nftData[this.id].details.info)
    //     },
    //     {
    //       button: ActionButton.PRIMARY,
    //       hoverText: 'More Info',
    //       distance: 8,
    //     }
    //   )
    // )
  }
}
