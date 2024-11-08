import * as utils from '@dcl-sdk/utils'
import { Material, MeshRenderer, Transform, VideoPlayer, engine } from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color3 } from '@dcl/sdk/math'

let isBarVideoAdded = false

export function addBarVideo(){
    if(isBarVideoAdded) return

    isBarVideoAdded = true
    console.log('addBarVideo.')
    const barVideoSrc = "https://player.vimeo.com/external/843206751.m3u8?s=ad9e81b120faa9fa68506ed337e6095ac1de3f78"

    const screen = engine.addEntity()
    MeshRenderer.setPlane(screen)
    Transform.create(screen, { 
        position: { x: 160.007, y: 3.88876, z: 173.449 },
        rotation: Quaternion.fromEulerDegrees(0, 0, 0),
        scale: {x: 11.0332, y: 5.53546, z: 1}
    })

    VideoPlayer.create(screen, {
        src: barVideoSrc,
        playing: false,
        loop: true
    })

    const videoTexture = Material.Texture.Video({ videoPlayerEntity: screen })

    Material.setPbrMaterial(screen, {
        texture: videoTexture,
        roughness: 1,
        specularIntensity: 0,
        metallic: 0,
        emissiveTexture: videoTexture,
        emissiveColor: Color3.White(),
        emissiveIntensity: 0.8
    })

    let triggerVideo = engine.addEntity()
    Transform.create(triggerVideo, {
        position: {x: 160, y: 10, z: 155}
    })
    utils.triggers.addTrigger(
        triggerVideo,
        utils.NO_LAYERS,
        utils.LAYER_1,
        [
            {
                type: 'box',
                scale: Vector3.create(50, 25, 50)
            }
        ],
        (enterEntity)=>{
            VideoPlayer.getMutable(screen).playing = true
        },
        (exitEntity)=>{
            VideoPlayer.getMutable(screen).playing = false
        },
    )
}
