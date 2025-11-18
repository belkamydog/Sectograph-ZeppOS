export function calculateAngles(event){
    let startAngle = convertTimeToAngle(event.start)
    let endAngle = convertTimeToAngle(event.end)
    startAngle = startAngle > endAngle ? (startAngle-360) : startAngle
    console.log("Start Angle:" + startAngle + " " + "EndAngle " + endAngle)
    return {startAngle, endAngle}
}

export function convertTimeToAngle(time){
  // 1h => 30 grad
  // 1h => 60 min => 30/60 = > 0.5 grad/min
  let result = (time.h * 60 + time.m) * 0.5
  // normalization
  return result >= 360 ? result % 360 : result
}