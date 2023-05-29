import { getSceneInfo,GetSceneResponse } from "~system/Scene"

type SceneMetaData = {
    allowedMediaHostnames:string[]
}
const CLASSNAME = "allowedMediaHelper"
let sceneData:GetSceneResponse
let sceneMetadata:SceneMetaData

const whenReady:(()=>void)[]=[]

export function whenAllowedMediaHelperReadyAddCallback(callback:()=>void){
    if(sceneData){
        console.log(CLASSNAME,"INFO","whenAllowedMediaHelperReadyAddCallback","sceneData already loaded, calling now")
        callback()
    }else{
        console.log(CLASSNAME,"INFO","whenAllowedMediaHelperReadyAddCallback","sceneData not loaded, queuing up")
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

export function isInWhiteList(url:string){
    if(!sceneMetadata){
        console.log(CLASSNAME,"WARN","isInWhiteList","sceneMetadata was not initialized!!!",sceneMetadata,"returning true")
        return true
    }
    let inWhitelist = false
    for(const p of sceneMetadata.allowedMediaHostnames){
        const idx = url.indexOf(p)
        //second check of < 15 is to make sure beggingin of url, not later by chance
        if(idx > -1 && idx < 15){
            //console.log(CLASSNAME,"TRACE","isInWhiteList","matched",url,"to",p)
            inWhitelist = true 
            break;
        }
    }
    console.log(CLASSNAME,"INFO","isInWhiteList","matched",url,inWhitelist)
    return inWhitelist
}
export function sanitizeUrl(url:string){
    //scene.json only lists the loadbalaner 'peer' so rewrite to use loadbalancer
    return url.replace(/\/\/peer(-[^.]+)?\./, '//peer.')
}
export function getImageOrFallback(url:string,fallbackImage:string){
    if(sceneData === undefined){
        getAndSetSceneMetaData() //for next time cuz its a promise :(
        console.log(CLASSNAME,"WARN","getImageOrFallback","sceneData was not initialized!!!")
        return sanitizeUrl(url)
    }
    const sanitizedUrl = sanitizeUrl(url)
    //check if matches fallback
    if(!isInWhiteList(sanitizedUrl)){
        return fallbackImage
    }
    return sanitizedUrl
}

