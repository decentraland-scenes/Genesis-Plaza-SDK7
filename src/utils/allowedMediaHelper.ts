import { getAndSetSceneMetaData, getSceneData, getSceneMetadata, whenSceneDataReadyAddCallback } from "./sceneDataHelper"


const CLASSNAME = "allowedMediaHelper"

export function whenAllowedMediaHelperReadyAddCallback(callback:()=>void){
    whenSceneDataReadyAddCallback(callback)
}

export function isInWhiteList(url:string){
    const sceneMetaData = getSceneMetadata()
    if(!sceneMetaData){
        console.log(CLASSNAME,"WARN","isInWhiteList","sceneMetadata was not initialized!!!",sceneMetaData,"returning true")
        return true
    }
    let inWhitelist = false
    for(const p of sceneMetaData.allowedMediaHostnames){
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
    if(getSceneData() === undefined){
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

