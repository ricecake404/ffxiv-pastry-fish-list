import EorzeaWeather from '@/utils/Weather'

export default {
  FISH_WINDOW_FORECAST_N: 10,

  divide(num1, num2) {
    return (num1 - (num1 % num2)) / num2
  },

  computeFishWindowIfExist(
    territoryId,
    periodStart,
    hourStart,
    hourEnd,
    previousWeatherSet,
    weatherSet
  ) {
    const prevPeriodStart = periodStart.toPreviousWeatherInterval()

    const periodStartHour = periodStart.getHours()
    const periodEndHour = periodStartHour + 8

    const intersections = intersectionOf(
      [periodStartHour, periodEndHour],
      [hourStart, hourEnd]
    )
    if (intersections.length === 0) {
      return []
    }
    if (
      territoryId == null ||
      ((previousWeatherSet.length === 0 ||
        previousWeatherSet.indexOf(
          EorzeaWeather.weatherAt(territoryId, prevPeriodStart)
        ) !== -1) &&
        (weatherSet.length === 0 ||
          weatherSet.indexOf(EorzeaWeather.weatherAt(territoryId, periodStart)) !== -1))
    ) {
      return intersections.map(range =>
        range.map(hour => periodStart.timeOfHours(hour).toEarthTime())
      )
    }
    return []
  },

  getNextNFishWindows(
    territoryId,
    eorzeaTime,
    hourStart,
    hourEnd,
    previousWeatherSet,
    weatherSet,
    n = this.FISH_WINDOW_FORECAST_N + 2
    // add 1 to make sure nextInterval process can also get enough fish windows
    // add another 1 to make sure previous fish windows take continuous fish windows
    // (which should be merged) into account
  ) {
    if (n < this.FISH_WINDOW_FORECAST_N + 2) {
      console.debug('fish window cache not found')
    }
    if (
      previousWeatherSet.length === 0 &&
      weatherSet.length === 0 &&
      hourStart === 0 &&
      hourEnd === 24
    ) {
      // console.warn('not time and weather restraint fish!')
      return []
    }
    // combine fish windows if connected
    // also ensure return count = n
    const fishWindows = []
    let counter = 0
    let time = eorzeaTime.toWeatherCheckPoint()
    const firstTime = time
    let loopCounter = 0
    while (counter < n && loopCounter < 10000) {
      loopCounter++
      const periodFishWindows = this.computeFishWindowIfExist(
        territoryId,
        time,
        hourStart,
        hourEnd,
        previousWeatherSet,
        weatherSet
      )
      periodFishWindows.forEach(fishWindow => {
        if (fishWindows.length > 0) {
          const lastIndex = fishWindows.length - 1

          const lastItem = fishWindows[lastIndex]
          if (lastItem[1] === fishWindow[0]) {
            fishWindows.splice(fishWindows.length - 1, 1, [lastItem[0], fishWindow[1]])
          } else {
            fishWindows.push(fishWindow)
            counter++
          }
        } else {
          fishWindows.push(fishWindow)
          counter++
        }
      })
      time = time.toNextWeatherInterval()
    }
    // try to find previous available fish window which can be combined with the current first one
    if (fishWindows.length > 0 && firstTime.toEarthTime() === fishWindows[0][0]) {
      loopCounter = 0
      let firstEorzeaWeatherStart = firstTime
      // console.log(fishId, EorzeaWeather.weatherAt(territoryId, firstEorzeaWeatherStart))
      let firstFishWindow //= fishWindows[0]
      let fishWindowsOfPeriod
      do {
        firstEorzeaWeatherStart = firstEorzeaWeatherStart.toPreviousWeatherInterval()
        fishWindowsOfPeriod = this.computeFishWindowIfExist(
          territoryId,
          firstEorzeaWeatherStart,
          hourStart,
          hourEnd,
          previousWeatherSet,
          weatherSet
        )
        loopCounter++
        if (fishWindowsOfPeriod.length === 0) {
          firstFishWindow = undefined
        } else if (fishWindowsOfPeriod.length === 1) {
          firstFishWindow = fishWindowsOfPeriod[0]
        } else {
          firstFishWindow = fishWindowsOfPeriod[1]
        }
        // console.log(
        //   'seek for fish',
        //   fishId,
        //   EorzeaWeather.weatherAt(territoryId, firstEorzeaWeatherStart),
        //   firstFishWindow && new Date(firstFishWindow[0]),
        //   firstFishWindow && new Date(firstFishWindow[1]),
        //   new Date(firstEorzeaWeatherStart.toNextWeatherInterval().toEarthTime())
        // )
      } while (
        // check fishWindow contains the whole weather time range
        firstFishWindow &&
        firstEorzeaWeatherStart.toEarthTime() === firstFishWindow[0] &&
        firstEorzeaWeatherStart.toNextWeatherInterval().toEarthTime() ===
          firstFishWindow[1] &&
        loopCounter < 1000
      )
      // console.log('loop cnt for fish front seeker', loopCounter)
      if (
        firstFishWindow &&
        firstEorzeaWeatherStart.toNextWeatherInterval().toEarthTime() ===
          firstFishWindow[1]
      ) {
        fishWindows[0][0] = firstFishWindow[0]
      } else {
        fishWindows[0][0] = firstEorzeaWeatherStart.toNextWeatherInterval().toEarthTime()
      }
    }
    // console.debug('loop count', loopCounter)
    return fishWindows.slice(0, n - 2)
  },
}

function intersectionOf(range1, range2) {
  let targetRanges = [range2]
  if (range2[0] > range2[1]) {
    targetRanges = [
      [0, range2[1]],
      [range2[0], 24],
    ]
  }
  return targetRanges
    .map(it => intersectionOfSimpleRange(range1, it))
    .filter(it => it.length !== 0)
}

function intersectionOfSimpleRange(range1, range2) {
  const range = [Math.max(range1[0], range2[0]), Math.min(range1[1], range2[1])]
  if (range[0] >= range[1]) return []
  return range
}
