/*
//TODO TAG:PORT-REIMPLEMENT-ME
//currently no tutorialEnableObservable in sdk7
//https://decentralandteam.slack.com/archives/C03NH6S541G/p1683634448357079
export const tutorialEnableObservable = new Observable<Readonly<boolean>>()

declare var dcl: any

async function handleExternalAction(message: { type: string; payload: any }) {
  if (message.type === "tutorial") {
    if (message.payload === "begin") {
      tutorialEnableObservable.notifyObservers(true)
    } else if (message.payload === "end") {
      tutorialEnableObservable.notifyObservers(false)
    }
  }
}

function subscribeToExternalActions() {
  if (typeof dcl !== "undefined") {
    dcl.subscribe("externalAction")
    dcl.onEvent((e: any) => {
      if (e.type === "externalAction") {
        handleExternalAction(e.data as any)
      }
    })
  }
}
subscribeToExternalActions()*/
