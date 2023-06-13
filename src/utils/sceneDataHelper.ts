import { getSceneInfo,GetSceneResponse } from "~system/Scene"

export type SceneMetaData = {
    allowedMediaHostnames:string[]
    scene:{
        base: string
        _baseCoords: {x:number,y:number}
    }
}
const CLASSNAME = "sceneDataHelper"
let sceneData:GetSceneResponse
let sceneMetadata:SceneMetaData

const whenReady:(()=>void)[]=[]

export function getSceneData(){
    return sceneData
}
export function getSceneMetadata(){
    return sceneMetadata
}
export function getSceneBaseCoords(sceneMetadata:SceneMetaData):{x:number,y:number}{
    const arr = sceneMetadata.scene.base.split(",").map((v)=>parseFloat(v))
    return { x:arr[0], y:arr[1] }
}
export function whenSceneDataReadyAddCallback(callback:()=>void){
    if(sceneData){
        console.log(CLASSNAME,"INFO","whenSceneDataReadyAddCallback","sceneData already loaded, calling now")
        callback()
    }else{
        console.log(CLASSNAME,"INFO","whenSceneDataReadyAddCallback","sceneData not loaded, queuing up")
        //register
        whenReady.push(callback)
    }
}
export function getAndSetSceneMetaData(){
    const METHOD_NAME = "getAndSetSceneMetaData"
    console.log(CLASSNAME,"INFO",METHOD_NAME,"ENTRY")
    const promise = getSceneInfo({})
    promise.then((result:GetSceneResponse)=>{
        console.log(CLASSNAME,"INFO","cacheSceneMetaData","result",result)
        sceneData = result
        
        try{
            sceneMetadata = JSON.parse(result.metadata)
            sceneMetadata.scene._baseCoords = getSceneBaseCoords(sceneMetadata)
        }catch(e){
            console.log(CLASSNAME,"ERROR",METHOD_NAME,"sceneData.metadata was not parsable!!!",sceneData)
        }
        console.log(CLASSNAME,"INFO",METHOD_NAME,"calling whenReady callbacks size:",whenReady.length)
        //execute any registered callbacks
        for(const p of whenReady){
            p()
        }
        //clear it out for next time if there is a next time
        whenReady.length = 0
    })
    return promise
}
