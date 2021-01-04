import TimeFormatter from '@/utils/TimeFormatter'
import { DateTime } from 'luxon'
import i18n from '@/i18n'
import _ from 'lodash'
import FishWindow from '@/utils/FishWindow'
import EorzeaTime from '@/utils/Time'
import tip1Data from '@/store/tip1.json'
import tip2Data from '@/store/tip2.json'
import flatten from 'flat'

const NOTIFICATION_SOUNDS = [
  { key: 'mute', name_chs: '静音', filename: null },
  {
    key: 'incomingTell1',
    name_chs: '提示音1',
    filename: 'FFXIV_Incoming_Tell_1.mp3',
  },
  {
    key: 'incomingTell2',
    name_chs: '提示音2',
    filename: 'FFXIV_Incoming_Tell_2.mp3',
  },
  {
    key: 'incomingTell3',
    name_chs: '提示音3',
    filename: 'FFXIV_Incoming_Tell_3.mp3',
  },
  { key: 'aggro', name_chs: '遇敌', filename: 'FFXIV_Aggro.mp3' },
  { key: 'confirm', name_chs: '确认', filename: 'FFXIV_Confirm.mp3' },
  {
    key: 'linkshellTransmission',
    name_chs: '通讯贝',
    filename: 'FFXIV_Linkshell_Transmission.mp3',
  },
  { key: 'notification', name_chs: '通知', filename: 'FFXIV_Notification.mp3' },
]

const INTERVAL_SECOND = 1000
const INTERVAL_MINUTE = 60000
const INTERVAL_HOUR = 3600000
const INTERVAL_DAY = 86400000

const INTERVALS = [INTERVAL_DAY, INTERVAL_HOUR, INTERVAL_MINUTE, INTERVAL_SECOND]

export default {
  iconIdToUrl(iconId) {
    if (iconId == null) return ''
    const iconIdStr = iconId + ''
    const icon = iconIdStr.padStart(6, '0')
    const path = icon.substring(0, 3) + '000'
    return `${this.XIV_API_HOST}/i/${path}/${icon}.png`
  },
  iconIdToClass(iconId) {
    if (iconId == null) return ''
    const iconIdStr = iconId + ''
    const icon = iconIdStr.padStart(6, '0')
    return `bg-${icon}`
  },
  getName(multiLanguageItem, locale = 'chs') {
    return (
      multiLanguageItem &&
      (multiLanguageItem['name_' + locale]
        ? multiLanguageItem['name_' + locale]
        : multiLanguageItem['name_en'])
    )
  },

  getCountDownTypeName(countDown) {
    return `countDown.${this.COUNT_DOWN_TYPE[countDown]}`
  },

  hasCountDown(countDown) {
    return countDown != null && countDown.type !== this.ALL_AVAILABLE
  },

  printCountDownTime(time, showCnt = 1, paddingZero = true) {
    return TimeFormatter.millisecondsToText(time, showCnt, true, paddingZero)
  },
  goToFishAngelPage(anglerFishId) {
    window.open(`https://cn.ff14angler.com/fish/${anglerFishId}`)
  },
  secondsToFishEyesString(seconds) {
    if (seconds === true) return ''
    return TimeFormatter.millisecondsToText(seconds * 1000, 2, false, false)
  },

  // completed
  getPredators(fish, allFish, fishListTimePart = {}, fishListWeatherChangePart = {}) {
    if (fish == null || allFish == null) return []
    return Object.entries(fish.predators).map(([predatorId, count]) => {
      return {
        ...allFish[predatorId],
        requiredCnt: count,
        isPredator: true,
        fishTimePart:
          fishListTimePart[predatorId] == null
            ? { id: predatorId, countDown: { type: this.ALL_AVAILABLE } }
            : fishListTimePart[predatorId],
        fishWeatherChangePart: fishListWeatherChangePart[predatorId],
        // finalTargetCompleted: completed,
        // finalTargetCountDownType: fishListTimePart[fish._id]?.countDown?.type,
      }
    })
  },

  // convert pixel coordinate to game map coordinate
  // e.g. 2048 to 42
  // ref: https://github.com/xivapi/ffxiv-datamining/blob/master/docs/MapCoordinates.md
  pixelToPos(sizeFactor, pixelIndex) {
    const MAP_SIZE_FACTOR_MAGIC = 41
    const MAP_FILE_PIXEL_MAX = 2048
    return (
      (MAP_SIZE_FACTOR_MAGIC / (sizeFactor / 100)) * (pixelIndex / MAP_FILE_PIXEL_MAX) + 1
    )
  },

  getColorByStatus(theme, completed, countDownType, colorIndex = 0) {
    const colorRef = {
      FISHING: [theme.fishing, theme.fishingSecondary],
      COMPLETED: [theme.completed, theme.completedSecondary],
      WAITING: [theme.waiting, theme.waitingSecondary],
    }
    if (completed) {
      return colorRef.COMPLETED[colorIndex]
    } else {
      switch (countDownType) {
        case this.FISHING:
          return colorRef.FISHING[colorIndex]
        default:
          return colorRef.WAITING[colorIndex]
      }
    }
  },
  isAllAvailableFish(fish) {
    return (
      fish.previousWeatherSet.length === 0 &&
      fish.weatherSet.length === 0 &&
      fish.startHour === 0 &&
      fish.endHour === 24
    )
  },

  formatDateTime(millis, format = "[MM-dd '{dayDescription}'] HH:mm:ss") {
    if (millis) {
      const date = DateTime.fromMillis(millis)
      const startOfDate = date.startOf('days')
      const today = DateTime.fromMillis(Date.now()).startOf('days')
      const days = startOfDate.diff(today, 'days').as('days')
      let dayText
      switch (days) {
        case 0:
          dayText = i18n.t('date.today')
          break
        case 1:
          dayText = i18n.t('date.tomorrow')
          break
        default:
          dayText = date.weekdayShort
      }
      return date.toFormat(format.replace('{dayDescription}', dayText))
    } else {
      return ''
    }
  },

  formatET(etHours) {
    const integer = etHours - ((etHours * 10) % 10) / 10
    const decimal = etHours - integer
    return integer + (decimal === 0 ? '' : ':' + decimal * 60)
  },

  // no operation placeholder for list item to show as clickable style
  noOp() {},

  toMap(list, keyFn) {
    return list.reduce((dict, item) => {
      dict[keyFn(item)] = item
      return dict
    }, {})
  },

  mergeUserData(defaultData, storedDate) {
    // [NOTE]
    // _.merge will deep merge array which will cause problem
    // e.g. filter.patches: merge([2.0, 3.0], [4.0]) = [4.0, 3.0]
    // use mergeWith to replace the whole array instead of merge elements
    // =======================================================================
    // if need add new element in default value for settings,
    // another patch function is needed
    let newUserData = _.mergeWith(defaultData, storedDate, this.mergeArray)
    const defaultComponents = this.USER_DEFAULT_DATA.detailArrangement.components
    const currentArrangement = newUserData.detailArrangement
    const componentsDiff = defaultComponents.length - currentArrangement.components.length
    if (componentsDiff > 0) {
      currentArrangement.components = currentArrangement.components.concat(
        defaultComponents.slice(
          defaultComponents.length - componentsDiff,
          defaultComponents.length
        )
      )
    }
    return newUserData
  },

  mergeByReplacingArray(object, ...otherArgs) {
    return _.mergeWith(object, ...otherArgs, this.mergeArray)
  },

  mergeArray(objValue, srcValue) {
    if (_.isArray(srcValue)) {
      // force removing duplication here to fix old data
      return _.uniq(srcValue).filter(it => it != null)
    }
  },

  toPositionText(fishingSpot) {
    if (fishingSpot == null) return ''
    return `X: ${this.toPosStr(
      fishingSpot.size_factor,
      fishingSpot.x
    )}, Y:${this.toPosStr(fishingSpot.size_factor, fishingSpot.y)}`
  },
  toPosStr(sizeFactor, pos) {
    return this.pixelToPos(sizeFactor, pos).toFixed(0)
  },
  assembleFishForDetail(
    selectedFishId,
    allFish,
    fishDict,
    fishListTimePart,
    extraFishListTimePart,
    fishListWeatherChangePart
  ) {
    const fish = allFish[selectedFishId]
    if (fish) {
      return {
        ...fish,
        parts: {
          fishTimePart: extraFishListTimePart[selectedFishId],
          fishWeatherChangePart: fishListWeatherChangePart[selectedFishId],
          predators: this.getPredators(
            fish,
            fishDict,
            fishListTimePart,
            fishListWeatherChangePart
          ),
        },
      }
    } else {
      return undefined
    }
  },

  isConstrainsEqual(fish1, fish2) {
    return (
      _.isEqual(fish1.previousWeatherSet, fish2.previousWeatherSet) &&
      _.isEqual(fish1.weatherSet, fish2.weatherSet) &&
      fish1.startHour === fish2.startHour &&
      fish1.endHour === fish2.endHour
    )
  },
  getFishWindow(fish, now, allFish, fishingSpots, n = FishWindow.FISH_WINDOW_FORECAST_N) {
    // console.debug(fish)
    if (Object.keys(fish.predators).length === 0) {
      return this.getFishWindowOfSingleFish(fish, now, fishingSpots, n)
    } else {
      // TODO change to a more efficient way
      const predators = Object.keys(fish.predators).map(predatorId => {
        return allFish[predatorId]
      })
      if (
        predators.every(
          it => this.isAllAvailableFish(it) || this.isConstrainsEqual(fish, it)
        )
      ) {
        return this.getFishWindowOfSingleFish(fish, now, fishingSpots, n)
      } else if (predators.length === 1) {
        if (this.isAllAvailableFish(fish)) {
          return this.getFishWindowOfSingleFish(predators[0], now, fishingSpots, n)
        } else if (fish.weatherSet.length === 0 && fish.previousWeatherSet.length === 0) {
          return this.getFishWindowOfSingleFish(predators[0], now, fishingSpots, n).map(
            fishWindow => {
              // if start of fish window > 0, i.e. its window is shrunk by the weather
              // change it back to 0, since other 2 predators are always available in [0,8]
              const startEorzeaTime = new EorzeaTime(
                EorzeaTime.toEorzeaTime(fishWindow[0])
              )
              if (startEorzeaTime.getHours() > 0) {
                return [
                  startEorzeaTime.timeOfHours(fish.startHour).toEarthTime(),
                  startEorzeaTime.timeOfHours(fish.endHour).toEarthTime(),
                ]
              } else {
                return fishWindow
              }
            }
          )
        }
      } else {
        // So in real life, only 'Warden of the Seven Hues' i.e. "七彩天主" goes here,
        // let do some dirty work

        if (fish._id === 24994) {
          // just return the 'Green Prismfish' i.e. "绿彩鱼" fish windows
          return this.getFishWindowOfSingleFish(allFish[24204], now, fishingSpots, n).map(
            fishWindow => {
              // if start of fish window > 0, i.e. its window is shrunk by the weather
              // change it back to 0, since other 2 predators are always available in [0,8]
              const startEorzeaTime = new EorzeaTime(
                EorzeaTime.toEorzeaTime(fishWindow[0])
              )
              if (startEorzeaTime.getHours() > 0) {
                return [startEorzeaTime.timeOfHours(0).toEarthTime(), fishWindow[1]]
              } else {
                return fishWindow
              }
            }
          )
        } else {
          console.error('Unsupported fish!', fish._id)
          return this.getFishWindowOfSingleFish(fish, now, fishingSpots, n)
        }
      }
    }
  },

  getFishWindowOfSingleFish(
    fish,
    now,
    fishingSpots,
    n = FishWindow.FISH_WINDOW_FORECAST_N
  ) {
    return FishWindow.getNextNFishWindows(
      // [NOTE]
      // Only check the 1st location
      // If fish with multi spot has weather constraints
      // will miss other location fish window
      // but there is no such case currently...
      // so just take the 1st one
      // e.g. 温泉王
      fishingSpots[fish.locations[0]]?.territory_id,
      new EorzeaTime(EorzeaTime.toEorzeaTime(now)),
      fish.startHour,
      fish.endHour,
      fish.previousWeatherSet,
      fish.weatherSet,
      n + 2
    )
  },

  computeRate(fishWindows) {
    const len = fishWindows.length
    if (len === 0) return 1
    const total = fishWindows[len - 1][0] - fishWindows[0][0]
    const active = fishWindows
      .slice(0, len - 1)
      .reduce((sum, fishWindow) => (sum += fishWindow[1] - fishWindow[0]), 0)
    return active / total
  },

  toFishFilterPatch(fishPatch) {
    if (!fishPatch) return fishPatch
    return +fishPatch.toString().match('^(\\d(\\.\\d)?)\\d?$')[1]
  },

  getMaxIntervalPartUnit(interval) {
    const index = INTERVALS.findIndex(it => it <= interval)
    let unit
    if (index === -1) unit = INTERVAL_SECOND
    else unit = INTERVALS[index]
    // console.log(unit)
    return unit
  },

  getMaxIntervalPart(interval, unit) {
    // console.log(Math.trunc(interval / unit))
    return Math.trunc(interval / unit)
  },

  shouldUpdate(realInterval, lazyInterval) {
    const realUnit = this.getMaxIntervalPartUnit(realInterval)
    const lazyUnit = this.getMaxIntervalPartUnit(lazyInterval)
    return (
      realUnit !== lazyUnit ||
      this.getMaxIntervalPart(realInterval, realUnit) !==
        this.getMaxIntervalPart(lazyInterval, lazyUnit)
    )
  },

  getDetailComponentSettingTemplate(componentNames) {
    return componentNames.map(it =>
      this.USER_DEFAULT_DATA.detailArrangement.components.find(
        component => component.name === it
      )
    )
  },

  hasTips(fishId) {
    return tip1Data[fishId] || tip2Data[fishId]
  },

  validateImportData(data, sample) {
    const importKeys = Object.keys(flatten(data, { safe: true })).sort()
    const sampleKeys = Object.keys(flatten(sample, { safe: true })).sort()
    return importKeys.every(it => sampleKeys.includes(it))
  },

  goToFishingSpotAngelPage(anglerLocationId) {
    window.open(`https://cn.ff14angler.com/?spot=${anglerLocationId}`)
  },

  tugToHookset(tug, hookset) {
    if (tug === 'light') {
      return 'Precision'
    } else if (tug === 'medium') {
      return 'Powerful'
    } else {
      return hookset
    }
  },

  timeId2TimeText(timeId) {
    const timeTextList = ['无要求', '白天', '黄昏', '夜晚']
    return timeTextList[timeId]
  },

  timeId2TimeIcon(timeId) {
    const timeTextList = [
      null,
      'mdi-weather-sunny',
      'mdi-weather-sunset',
      'mdi-weather-night',
    ]
    return timeTextList[timeId]
  },

  toItemIdIfExisted(id, name) {
    if (name.match('[\u4e00-\u9fff]+')) {
      return id
    } else {
      return null
    }
  },

  TIME_UNITS: ['day', 'hour', 'minute', 'second', 'days', 'hours', 'minutes', 'seconds'],

  INTERVAL_SECOND: INTERVAL_SECOND,
  INTERVAL_MINUTE: INTERVAL_MINUTE,
  INTERVAL_HOUR: INTERVAL_HOUR,
  INTERVAL_DAY: INTERVAL_DAY,

  GIG_ICON: {
    small: 'bg-060671',
    normal: 'bg-060672',
    large: 'bg-060673',
  },

  GIG_DICT: ['', 'small', 'normal', 'large'],

  TUG_ICON: {
    light: '!',
    medium: '! !',
    heavy: '! ! !',
  },

  TUG_ICON_COLOR: {
    '!': 'success',
    '! !': 'error',
    '! ! !': 'warning',
  },

  HOOKSET_ICON: {
    Powerful: '001115',
    Precision: '001116',
  },

  HOOKSET_SKILL_NAME_DICT: {
    Powerful: '强力提钩',
    Precision: '精准提钩',
  },

  COUNT_DOWN_TYPE: ['fishing', 'waiting', 'allAvailable'],

  FISHING: 0,
  WAITING: 1,
  ALL_AVAILABLE: 2,

  ICON_PREDATORS: '011101',
  ICON_SNAGGING: '011102',
  ICON_FISH_EYES: '011103',

  ITEM_COLOR: {
    FISHING: ['#22362b', 'primary darken-2'],
    WAITING: ['transparent', 'transparent'],
    COMPLETED: ['#173251', 'success darken-2'],
    NORMAL: ['grey darken-3', 'grey darken-4'],
  },

  ITEM_BACKGROUND_COLOR: {
    FISHING: ['#22362b', '#183027'],
    COMPLETED: ['#173251', '#0c2242'],
    WAITING: ['#2d2d32', '#272727'],
  },

  PATCH_MAX: 5.35,
  PATCH_AVAILABLE_MAX: 5.3,
  XIV_API_HOST: 'https://cafemaker.wakingsands.com', //'https://xivapi.com',

  USER_DEFAULT_DATA: {
    // website version info
    websiteVersion: '0.1.0',
    completed: [],
    pinned: [],
    toBeNotified: [],
    filters: {
      patches: [
        // eslint-disable-next-line
        2.0,
        2.1,
        2.2,
        2.3,
        2.4,
        2.5,
        // eslint-disable-next-line
        3.0,
        3.1,
        3.2,
        3.3,
        3.4,
        3.5,
        // eslint-disable-next-line
        4.0,
        4.1,
        4.2,
        4.3,
        4.4,
        4.5,
        // eslint-disable-next-line
        5.0,
        5.1,
        5.2,
        5.3,
      ],
      completeType: 'UNCOMPLETED',
      bigFishType: 'BIG_FISH',
      fishN: 10,
      sorterType: 'COUNTDOWN',
    },
    // page settings
    showFilter: true,
    showBanner: true,
    opacity: 1,
    rightPanePercentage: 30,
    notification: {
      volume: 0.5,
      isSystemNotificationEnabled: true,
      settings: [
        {
          key: 'waiting',
          sound: NOTIFICATION_SOUNDS[1].key,
          enabled: true,
          hasBefore: true,
          before: 2,
        },
        {
          key: 'fishing',
          sound: NOTIFICATION_SOUNDS[2].key,
          enabled: true,
          hasBefore: false,
          before: 0,
        },
      ],
    },
    detailArrangement: {
      components: [
        {
          name: 'DetailItemMap',
          expandedEnabled: true,
          expanded: true,
          enabled: true,
          order: 0,
        },
        {
          name: 'DetailItemFishWindowTable',
          expandedEnabled: true,
          expanded: true,
          enabled: true,
          order: 1,
        },
        {
          name: 'DetailItemCountdownBar',
          expandedEnabled: false,
          enabled: true,
          order: 2,
        },
        {
          name: 'DetailItemRequirements',
          expandedEnabled: false,
          enabled: true,
          order: 3,
        },
        {
          name: 'DetailItemBuffAndBaits',
          expandedEnabled: false,
          enabled: true,
          order: 4,
        },
        {
          name: 'DetailItemPredators',
          expandedEnabled: false,
          enabled: true,
          order: 5,
        },
        {
          name: 'DetailItemTips',
          expandedEnabled: true,
          expanded: true,
          enabled: true,
          order: 6,
        },
      ],
    },
    theme: {
      dark: true,
    },
    event: {
      startLight: true,
    },
    oceanFishing: {
      showWarningDialog: true,
    },
  },

  DETAIL_ITEM_DISPLAY_CONSTRAINTS: {
    DetailItemMap: 'hasFishingSpot',
    DetailItemCountdownBar: false,
    DetailItemRequirements: false,
    DetailItemBuffAndBaits: false,
    DetailItemFishWindowTable: 'hasCountDown',
    DetailItemPredators: 'hasPredators',
    DetailItemTips: 'hasTips',
  },

  // fish tracker [js/app/viewmodel.js]
  FISH_TRACKER_STRUCTURE: {
    filters: {
      completion: 'all',
      patch: [],
    },
    completed: [],
    pinned: [],
    upcomingWindowFormat: 'fromPrevClose',
    sortingType: 'windowPeriods',
    theme: 'dark',
  },

  // TAB_INDEX_PINNED: 0,
  TAB_INDEX_NORMAL: 0,
  TAB_INDEX_TO_BE_NOTIFIED: 1,

  TABS: [
    // { icon: 'mdi-pin', title: 'list.pinTitle' },
    { icon: 'mdi-format-list-text', title: 'list.normalTitle' },
    { icon: 'mdi-bell', title: 'list.toBeNotifiedTitle' },
  ],

  NOTIFICATION_SOUNDS: NOTIFICATION_SOUNDS,
}
