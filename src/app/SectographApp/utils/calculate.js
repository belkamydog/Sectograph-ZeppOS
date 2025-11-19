export function calculateAngles(event){
    let startAngle = convertTimeToAngle(event.start)
    let endAngle = convertTimeToAngle(event.end)
    startAngle = startAngle > endAngle ? (startAngle-360) : startAngle
    // console.log("Start Angle:" + startAngle + " " + "EndAngle " + endAngle)
    return {startAngle, endAngle}
}

export function convertTimeToAngle(time){
  // 1h => 30 grad
  // 1h => 60 min => 30/60 = > 0.5 grad/min
  let result = (time.h * 60 + time.m) * 0.5
  // normalization
  return result >= 360 ? result % 360 : result
}

export function isPointInSector(x, y, centerX, centerY, radius, startAngle, endAngle) {
  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
  if (distance > radius) {
    // console.log("OUT OF CIRCLE")
    return false;
  }
  let pointAngle = 90 - Math.atan2(centerY-y, x - centerX) * (180 / Math.PI);
  // console.log("Point angle" + pointAngle)

  if (startAngle <= endAngle) {
    // console.log("s " + startAngle + " e " + endAngle + " p " + pointAngle + " "+ ( pointAngle >= startAngle && pointAngle <= endAngle))
    return pointAngle >= startAngle && pointAngle <= endAngle;
  } else {
    return pointAngle >= startAngle || pointAngle <= endAngle;
  }
}