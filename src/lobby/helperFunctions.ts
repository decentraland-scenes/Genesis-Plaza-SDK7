export function splitTextIntoLines(
  text: string,
  maxLenght: number,
  maxLines?: number
) {
  let finalText: string = ''
  for (let i = 0; i < text.length; i++) {
    let lines = finalText.split('\n')

    if (lines[lines.length - 1].length >= maxLenght && i !== text.length) {
      if (finalText[finalText.length - 1] !== ' ') {
        if (maxLines && lines.length >= maxLines) {
          finalText = finalText.concat('...')
          return finalText
        } else {
          finalText = finalText.concat('-')
        }
      }
      finalText = finalText.concat('\n')
      if (text[i] === ' ') {
        continue
      }
    }

    finalText = finalText.concat(text[i])
  }

  return finalText
}

export function cleanString(input:string) {
  var output = "";
  for (var i=0; i<input.length; i++) {
      if (input.charCodeAt(i) <= 127 || input.charCodeAt(i) >= 160 && input.charCodeAt(i) <= 255) {
          output += input.charAt(i);
      }
  }
  return output;
}

export function wordWrap(str:string, maxWidth:number, maxLines:number) {
  let newLineStr = "\n"
  let done = false 
  let res = ''
  let linesSeparate = str.split(newLineStr)
  let lines = ''

  //log("original lines: " + str.split(newLineStr).length)
  
  if(str.length > maxWidth){
    for( let j=0; j< linesSeparate.length; j++){
      res = ''
      done = false 
      //process each line for linebreaks
      while (linesSeparate[j].length > maxWidth) {  
       
        let found = false;
        // Inserts new line at first whitespace of the line
        for (let i = maxWidth - 1; i >= 0; i--) {
            if (testWhite(linesSeparate[j].charAt(i))) {
                res = res + [linesSeparate[j].slice(0, i), newLineStr].join('');

                //don't remove slash, but break line
                if(testSlash(linesSeparate[j].charAt(i))){
                  linesSeparate[j] = linesSeparate[j].slice(i);
                }
                // remove white space completely
                else{
                  linesSeparate[j] = linesSeparate[j].slice(i + 1);
                }
                
                found = true;            
                break;
            }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
            res += [linesSeparate[j].slice(0, maxWidth), newLineStr].join('');
            linesSeparate[j] = linesSeparate[j].slice(maxWidth);        
        }
      } 
    
      lines +=  res + linesSeparate[j] + "\n"
    
    }
        
      
      //let lines = res + str
      let finalLines = lines.split('\n') 
      let croppedResult = ''
    
      for(let i=0; i < maxLines && i < finalLines.length; i++){
        if(i == maxLines - 1 ){
          croppedResult += finalLines[i] 
        }
        else{
          croppedResult += finalLines[i] + '\n'  
        }
      }
    
      // if(finalLines.length > maxLines){
      //   croppedResult += '...'
      // }
      return croppedResult;
  }
  else {
    return str
  }

  
}

function testWhite(x:string):boolean {
  var white = new RegExp(/^[\s/]+$/);
  return white.test(x.charAt(0));
}

function testSlash(x:string):boolean{
  var white = new RegExp(/^[/]+$/);
  return white.test(x.charAt(0));
}

export function shortenText(text: string, maxLenght: number) {
  let finalText: string = ''

  if (text.length > maxLenght) {
    finalText = text.substring(0, maxLenght)
    finalText = finalText.concat('...')
  } else {
    finalText = text
  }

  return finalText
}

export function monthToString(_monthID:number):string{
  
  switch(_monthID){
    case 0: {
      return "Jan"
    }
    case 1: {
      return "Feb"
    }
    case 2: {
      return "Mar"
    }
    case 3: {
      return "Apr"
    }
    case 4: {
      return "May"
    }
    case 5: {
      return "Jun"
    }
    case 6: {
      return "Jul"
    }
    case 7: {
      return "Aug"
    }
    case 8: {
      return "Sep"
    }
    case 9: {
      return "Oct"
    }
    case 10: {
      return "Nov"
    }
    case 11: {
      return "Dec"
    }
  }
  
  return "N/A"
}

export function dateToRemainingTime(dateStart:string):string{

  let eventStartTime = Date.parse(dateStart)
  let currentTime = Date.now()

  


//complete remaining time in MILLISECONDS
  let remainingTime = eventStartTime - currentTime

  //complete remaining time in SECONDS
  let fullSeconds  =  Math.abs(Math.floor(remainingTime / 1000))

  //complete remaining time in HOURS
  let fullHours = Math.abs(Math.floor(fullSeconds/3600))
  
  //complete remaining time in HOURS
  let fullDays =  Math.abs(Math.floor(fullHours/24))
  
  let fractionHour = fullSeconds/3600 - fullHours
  let leftoverMinutes = Math.floor(fractionHour * 60)
  
  let finalTime = fullHours
  let finalUnit = "hours"

 
  if(fullDays > 1){
    finalTime = Math.abs(fullDays)
    finalUnit = "days"
  }
  
  if(fullDays == 1){
    finalTime = Math.abs(fullDays)
    finalUnit = "day"
  }  

  if(Math.abs(fullDays) < 1){
    if(fullHours == 0){
      finalTime = leftoverMinutes
      finalUnit = "mins"
    }
    if(fullHours == 1){
      finalTime = Math.abs(fullHours)
      finalUnit = "hour"
    }    
    if(fullHours > 1 ){
      finalTime = Math.abs(fullHours)
      finalUnit = "hours"
    }
  }
  
    
      
  

  let endString = ("Starts in "+ finalTime + " " + finalUnit)

  if( remainingTime < 0){
    endString = ("Started "+ finalTime + " "+ finalUnit + " ago")
  }


  return endString
}

export function eventIsSoon(dateStart:string):boolean{

  let eventStartTime = Date.parse(dateStart)
  let currentTime = Date.now()

  //complete remaining time in MILLISECONDS
  let remainingTime = eventStartTime - currentTime

  //complete remaining time in SECONDS
  let fullSeconds  =  Math.abs(Math.floor(remainingTime / 1000))


  //complete remaining time in HOURS
  let fullHours = Math.abs(Math.floor(fullSeconds/3600))

  if(fullHours <= 1){
    return true
  }
  return false

}
