//workaround, during move player, onEnterScene/onLeaveScene trigger, should not

let MOVE_PLAYER_IN_PROGRESS = false

export function isMovePlayerInProgress(){
    return MOVE_PLAYER_IN_PROGRESS
}
export function setMovePlayerInProgress(b:boolean){
    console.log("setMovePlayerInProgress",b)
    MOVE_PLAYER_IN_PROGRESS = b
}