//SDK 7 is not picking up the typing, this is a work around to enforce importing the typing
//add tsconfig.json this:
/* 
    "paths": {
      "colyseus.js/decentraland": ["./node_modules/colyseus.js/dist/colyseus.d.ts"]
    }

    "include"
    {
      "index.d.ts"
    }
*/
declare module 'colyseus.js/decentraland' {
  import * as colyseus from 'colyseus.js'
  export = colyseus
}