import { VideoState, engine, videoEventsSystem } from "@dcl/sdk/ecs"
import { updateAuditoriumVideoScreen } from "../auditoriumScreen"
import { screen, updateBarVideoScreen } from "../barVideoScreen"
import { barRadioOff, isInBar, setBarMusicOn } from "../bar/jukebox"

export const eventVideoUrl = 'https://customer-ofzh1p2ow8r96rk0.cloudflarestream.com/1d86fcbe2c8c77b23dfb6d99c00af9ee/manifest/video.m3u8?clientBandwidthHint=0.5'

//TODO: to set the correct event time and duration
let eventStartTime = Math.floor(Date.now() / 1000) + 20 //epoch second
let eventLength = 60 //3600 //8 * 60 * 60 //second

let isVideoSchedulerAdded = false
let isPlayingDefaultVideo = false

let checkInterval = 1
let interval_count = 0

function VideoScheduler(dt: number) {
    interval_count += dt
    if (interval_count < checkInterval) return

    interval_count = 0

    let now = Math.floor(Date.now() / 1000)

    if (now < eventStartTime) {
        console.log('videoScheduler. event has not started.')
            playDefaultVideo() 
    } else if ((now > eventStartTime + eventLength)) {
        console.log('videoScheduler. event end.')

        playDefaultVideo()

        // console.log('videoScheduler. isInBar?', isInBar)
        // if(isInBar){
        //     setBarMusicOn()
        // }

        engine.removeSystem(VideoScheduler)
    } else if (isPlayingDefaultVideo) {
        // playStream()
        videoStreamCheckAndPlay()

        // console.log('videoScheduler. isInBar?', isInBar)
        // if(isInBar){
        //     barRadioOff()
        // }
    }
}

function playDefaultVideo () {
    if (!isPlayingDefaultVideo) {
    isPlayingDefaultVideo = true
    updateBarVideoScreen("https://player.vimeo.com/external/843206751.m3u8?s=ad9e81b120faa9fa68506ed337e6095ac1de3f78")
    updateAuditoriumVideoScreen("https://player.vimeo.com/external/552481870.m3u8?s=c312c8533f97e808fccc92b0510b085c8122a875")
    }
    if(isInBar){
        setBarMusicOn()
    }
}

function playStream () {
    isPlayingDefaultVideo = false
    console.log('videoScheduler. event start.')
    updateBarVideoScreen(eventVideoUrl)
    updateAuditoriumVideoScreen(eventVideoUrl)
}

// let streamCheckInterval = 1
// let streamIntervalCount = 0

const videoStreamCheckAndPlay = async () => {
    console.log('videoScheduler: checking stream status')
    const videoStatus = await (await fetch('https://customer-ofzh1p2ow8r96rk0.cloudflarestream.com/1d86fcbe2c8c77b23dfb6d99c00af9ee/lifecycle')).json()
    console.log(videoStatus)
    if (videoStatus.status !== "ready"){
        playDefaultVideo()
    } else {
        playStream()
        barRadioOff()
    }
}


export function addVideoSchedulerSystem() {
    if (isVideoSchedulerAdded) return

    console.log('videoScheduler. system added.')
    isVideoSchedulerAdded = true
    engine.addSystem(VideoScheduler)

    videoEventsSystem.registerVideoEventsEntity(
        screen,
        function (videoEvent) {
            console.log(
                'videoScheduler.\nvideo event - state: ' +
                videoEvent.state +
                '\ncurrent offset:' +
                videoEvent.currentOffset +
                '\nvideo length:' +
                videoEvent.videoLength
            )

            if (videoEvent.state !== VideoState.VS_PLAYING) {
                console.log('videoScheduler. video event - video is NOT PLAYING')

                    videoStreamCheckAndPlay()

            }
            // switch (videoEvent.state) {
            //     case VideoState.VS_READY:
            //         console.log('videoScheduler. video event - video is READY')
            //         break
            //     case VideoState.VS_NONE:
            //         console.log('videoScheduler. video event - video is in NO STATE')
            //         break
            //     case VideoState.VS_ERROR:
            //         console.log('videoScheduler. video event - video ERROR')
            //         break
            //     case VideoState.VS_SEEKING:
            //         console.log('videoScheduler. video event - video is SEEKING')
            //         break
            //     case VideoState.VS_LOADING:
            //         console.log('videoScheduler. video event - video is LOADING')
            //         break
            //     case VideoState.VS_BUFFERING:
            //         console.log('videoScheduler. video event - video is BUFFERING')

            //         videoStreamCheckAndPlay()

            //         break
            //     case VideoState.VS_PLAYING:
            //         console.log('videoScheduler. video event - video started PLAYING')
            //         break
            //     case VideoState.VS_PAUSED:
            //         console.log('videoScheduler. video event - video is PAUSED')

            //         videoStreamCheckAndPlay()
            //         break
            // }
        }
    )
}
