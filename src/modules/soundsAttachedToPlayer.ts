import { AudioSource, AudioStream, CameraType, PBAudioSource, Transform, engine } from "@dcl/sdk/ecs";
import { AudioSourceAttachedToPlayer } from "../components";
import { onOnCameraModeChangedObservableAdd } from "../back-ports/onCameraModeChangedObservable";


//if AudioSourceAttachedToPlayer.firstPersonVolume not set will take  AudioSourceAttachedToPlayer.thirdPersonVolume and drop by this much
export const FIRST_PERSON_VOLUME_ADJ=-.075
const FIRST_PERSON_VOLUME_ADJ_MIN = .02//if adjust goes below 0, set it just very low

const SOUNDS_ATTACHED_TO_PLAYER_STORAGE:Map<string,PBAudioSource> = new Map()
export function applyAudioStreamWorkAround(type:'enter'|'exit'){
  
  const audioStreamGroup = engine.getEntitiesWith(AudioSourceAttachedToPlayer)
  for(const [ent,audioAttachedToPlayerReadOnly] of audioStreamGroup){
  
    if(type === 'enter'){
      if(AudioSource.has(ent)){
        console.error("applyAudioStreamWorkAround","already has audio",ent,audioAttachedToPlayerReadOnly)
      }else{
        const addAudio:PBAudioSource = SOUNDS_ATTACHED_TO_PLAYER_STORAGE.get( audioAttachedToPlayerReadOnly.id )
        
        if(addAudio){
          console.log("applyAudioStreamWorkAround","adding audio back",ent,audioAttachedToPlayerReadOnly)
          AudioSource.create( ent,  addAudio )
        }else{
          console.log("applyAudioStreamWorkAround","no audio to add",ent,audioAttachedToPlayerReadOnly)
        }
      }
    }else{
      //exit
      const removedAudio:PBAudioSource = AudioSource.deleteFrom( ent )
      
      if(removedAudio){
        console.log("applyAudioStreamWorkAround","removed audio, stored for later",ent,audioAttachedToPlayerReadOnly)
        SOUNDS_ATTACHED_TO_PLAYER_STORAGE.set(audioAttachedToPlayerReadOnly.id,removedAudio)
      }else{
        console.log("applyAudioStreamWorkAround","no audio to remove",ent,audioAttachedToPlayerReadOnly)
      }

    }  
  }
} 

//CURRENT BUG - if currently playing and change volume sound resets :(
const ENABLE_SOUND_ADJUST = true
export function initSoundsAttachedToPlayerHandler(){
  if(!ENABLE_SOUND_ADJUST){
    console.log("initSoundsAttachedToPlayerHandler","disabled till bug where sound playing restarts when volume changed is fixed","ENABLE_SOUND_ADJUST",ENABLE_SOUND_ADJUST)
    return;
  }
  onOnCameraModeChangedObservableAdd((mode: CameraType) => {
    const audioStreamGroup = engine.getEntitiesWith(AudioSourceAttachedToPlayer)
    for(const [ent,audioAttachedToPlayerReadOnly] of audioStreamGroup){

      //TODO check if still in engine, if not remove from listener
      //if (targetEngine.getEntityState(entity) == EntityState.Removed || !Trigger.has(entity)) {

      const audioSource = AudioSource.getMutableOrNull(ent)
      if(!audioSource){
        console.log("initSoundsAttachedToPlayerHandler","no audio source to adjust",ent,audioAttachedToPlayerReadOnly)
        continue;
      }
      let newVol = audioAttachedToPlayerReadOnly.thirdPersonVolume
      //const n
      if(mode === CameraType.CT_FIRST_PERSON){
        newVol = audioAttachedToPlayerReadOnly.firstPersonVolume
      }else{
        //third person
        newVol = audioAttachedToPlayerReadOnly.thirdPersonVolume
      }
      console.log("initSoundsAttachedToPlayerHandler","audio source to adjust",ent,audioAttachedToPlayerReadOnly,audioSource.volume,newVol)
      audioSource.volume = newVol

    }
  })
}