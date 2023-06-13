import { AudioSource, AudioStream, CameraType, Entity, PBAudioSource, Transform, engine } from "@dcl/sdk/ecs";
import { AudioSourceAttachedToPlayer, PBAudioSourceAttachedToPlayer } from "../components";
import { onCameraModeChangedObservable } from "../back-ports/onCameraModeChangedObservable";
import * as utils from '@dcl-sdk/utils'

//if AudioSourceAttachedToPlayer.firstPersonVolume not set will take  AudioSourceAttachedToPlayer.thirdPersonVolume and drop by this much
export const FIRST_PERSON_VOLUME_ADJ=-.075
const FIRST_PERSON_VOLUME_ADJ_MIN = .02//if adjust goes below 0, set it just very low

const SOUNDS_ATTACHED_TO_PLAYER_STORAGE:Map<string,PBAudioSource> = new Map()

//workaround to audio plays when entering scene. but also on first time walking into scene plays them all at once yikes!
//only add when want to play i think is the workaround :(
export function applyAudioStreamWorkAround(type:'enter'|'exit'){
  console.log("applyAudioStreamWorkAround","ENTRY",type) 
  //return
  const audioStreamGroup = engine.getEntitiesWith(AudioSourceAttachedToPlayer)
  for(const [ent,audioAttachedToPlayerReadOnly] of audioStreamGroup){
    applyAudioStreamWorkaroundToEnt(type, ent, audioAttachedToPlayerReadOnly as PBAudioSourceAttachedToPlayer);  
  }
} 
 
function applyAudioStreamWorkaroundToEnt(type: string, ent: Entity, audioAttachedToPlayerReadOnly:PBAudioSourceAttachedToPlayer,_removedAudio?:PBAudioSource) {
  if (type === 'enter') {
    if (AudioSource.has(ent)) {
      console.log("applyAudioStreamWorkAround", "WARN already audio", ent, audioAttachedToPlayerReadOnly);
    } else {
      const addAudio: PBAudioSource = SOUNDS_ATTACHED_TO_PLAYER_STORAGE.get(audioAttachedToPlayerReadOnly.id);

      if (addAudio) {
        console.log("applyAudioStreamWorkAround", "adding audio back", ent, audioAttachedToPlayerReadOnly);
        //disable playing, if was playing - will be enabled by action 
        //issue is if needs to be background music wont auto play
        addAudio.playing = false;
        AudioSource.create(ent, addAudio);
      } else {
        console.log("applyAudioStreamWorkAround", "no audio to add", ent, audioAttachedToPlayerReadOnly);
      }
    }
  } else {
    //exit 
    const removedAudio: PBAudioSource = AudioSource.deleteFrom(ent);

    if (removedAudio) {
      console.log("applyAudioStreamWorkAround", "removed audio, stored for later", ent, audioAttachedToPlayerReadOnly);
      SOUNDS_ATTACHED_TO_PLAYER_STORAGE.set(audioAttachedToPlayerReadOnly.id, removedAudio);
    } else {
      if(_removedAudio){
        console.log("applyAudioStreamWorkAround", "provided audio, stored for later", ent, audioAttachedToPlayerReadOnly);
        SOUNDS_ATTACHED_TO_PLAYER_STORAGE.set(audioAttachedToPlayerReadOnly.id, _removedAudio);
      }else{
        console.log("applyAudioStreamWorkAround", "no audio to remove", ent, audioAttachedToPlayerReadOnly);
      }
    }

  }
}

export function setAudioSourceAttachedToPlayerPlaying(entity:Entity,play:boolean){
  const audioOnPlayer = AudioSourceAttachedToPlayer.getOrNull(entity)
  if(!audioOnPlayer){
    console.log("setAudioSourceAttachedToPlayerPlaying", "WARNING missing AudioSourceAttachedToPlayer", entity);
  }
  const audioSource = AudioSource.getMutableOrNull(entity)
  if(!audioSource){
    const audioSource = SOUNDS_ATTACHED_TO_PLAYER_STORAGE.get(audioOnPlayer.id);

    console.log("setAudioSourceAttachedToPlayerPlaying", "audioSource found in storage, attaching and setting play"
      , entity,audioOnPlayer.id,"audioSource.playing",audioSource.playing,"to",play);
    audioSource.playing = true
 
    AudioSource.create(entity,audioSource)
  }else{
    console.log("setAudioSourceAttachedToPlayerPlaying", "audioSource already attached setting play"
      , entity,audioOnPlayer.id,"audioSource.playing",audioSource.playing,"to",play);
    audioSource.playing = true
  }
}

export function addAudioSourceAttachedToPlayer(entity:Entity,audioAttachedToPlayer:PBAudioSourceAttachedToPlayer, audioSource?:PBAudioSource){
  AudioSourceAttachedToPlayer.create(entity,audioAttachedToPlayer)

  //create now???
  if(audioSource && audioSource.playing){
    AudioSource.create(entity, audioSource)
  }else{
    //workaround on workarounds
    //TODO attach it to an entity far away with volume 0.1 so it gets downloaded, then delete it
    
    const tempEnt = engine.addEntity()
    const copy = {...audioSource}
    copy.playing = false
    copy.volume = .001//quiet
    AudioSource.create(entity, audioSource)
    utils.timers.setTimeout(()=>{
      //delete entity, just wanted it downloaded
      //console.log("addAudioSourceAttachedToPlayer","deleting tempEnt",tempEnt)
      engine.removeEntity(tempEnt)
    },500)

    //WORKAROUND only add when playing :(
    applyAudioStreamWorkaroundToEnt('exit',entity,audioAttachedToPlayer,audioSource)
  }
}

//CURRENT BUG - if currently playing and change volume sound resets :(
const ENABLE_SOUND_ADJUST = false
export function initSoundsAttachedToPlayerHandler(){
  if(!ENABLE_SOUND_ADJUST){
    console.log("initSoundsAttachedToPlayerHandler","disabled till bug where sound playing restarts when volume changed is fixed","ENABLE_SOUND_ADJUST",ENABLE_SOUND_ADJUST)
    return;
  }
  onCameraModeChangedObservable.add((mode: CameraType) => {
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