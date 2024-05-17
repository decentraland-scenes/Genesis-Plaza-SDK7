import * as utils from '@dcl-sdk/utils'
import { Material, MeshRenderer, PBVideoPlayer, Transform, VideoPlayer, engine } from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color3 } from '@dcl/sdk/math'

const screen = engine.addEntity()

export function updateAuditoriumVideoScreen(url: string){
    console.log('videoScheduler. update auditorium video url:', url)
    let videoPlayer: PBVideoPlayer = {
        src: url,
        playing: true,
        loop: true
    }
    VideoPlayer.createOrReplace(screen, videoPlayer)
}

export function addAuditoriumVideo(){
    // const videoSrc = "https://player.vimeo.com/external/552481870.m3u8?s=c312c8533f97e808fccc92b0510b085c8122a875"

    // VideoPlayer.create(screen, {
    //     src: videoSrc,
    //     playing: false,
    //     loop: true
    // })

    MeshRenderer.setPlane(screen)
    Transform.create(screen, { 
        position: Vector3.create(285, 17.5, 279),
        rotation: Quaternion.fromEulerDegrees(0, 210 + 180, 0),
        scale: Vector3.create(10 * 2.8, 5.6 * 2.8, 10 * 2.8),
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
        position: Vector3.create(270, 5, 255)
    })
    utils.triggers.addTrigger(
        triggerVideo,
        utils.NO_LAYERS,
        utils.LAYER_1,
        [
            {
                type: 'box',
                scale: Vector3.create(90, 90, 90)
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
