import Vue from 'vue'
import Vuex from 'vuex'
import { DATA } from '@/store/data'
import DATA_CN from '@/store/translation'
import FIX from '@/store/fix'
import merge from 'lodash/merge'
import DataUtil from '@/utils/DataUtil'
import _ from 'lodash'
import LocalStorageUtil from '@/utils/LocalStorageUtil'
import FishingData from '@/store/fishingData'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fish: DataUtil.mergeByReplacingArray(FishingData, FIX.FISH, FIX.SPEAR_FISH),
    fishingSpots: merge(DATA.FISHING_SPOTS, DATA_CN.FISHING_SPOTS),
    spearFishingSports: DATA.SPEARFISHING_SPOTS,
    items: DATA_CN.ITEMS,
    achievements: DATA_CN.OCEAN_FISHING_ACHIEVEMENTS,
    weatherRates: DATA.WEATHER_RATES,
    weatherTypes: DATA_CN.WEATHER_TYPES,
    zones: DATA_CN.ZONES,
    bigFish: DATA_CN.BIG_FISH,
    newPatchFish: DATA_CN.NEW_PATCH_FISH,
    folklore: DATA_CN.FOLKLORE,
    fishingSpotFish: _.groupBy(DATA_CN.FISHING_SPOT_FISH, 'fishingSpot'),
    showSearchDialog: false,
    showImportExportDialog: false,
    snackbar: {
      show: false,
      text: '',
      color: '',
    },
    activeTabIndex: DataUtil.TAB_INDEX_NORMAL,
    aetheryte: _.groupBy(DATA_CN.AETHERYTE, 'mapFileId'),
    sounds: {},
    showFishPageRightPane: false,
    loading: false,
    userData: DataUtil.mergeUserData(
      _.cloneDeep(DataUtil.USER_DEFAULT_DATA),
      LocalStorageUtil.loadAndBackupUserData()
    ),
  },
  getters: {
    getItemIconUrl: state => id => {
      const iconId = state.items[id]?.icon ?? 1100
      // const localImg = require(`../assert/${iconId}.png`)
      // if (localImg) {
      //   return localImg
      // } else {
      return DataUtil.iconIdToUrl(iconId)
      // }
    },
    // combine icon file together
    // https://css-tricks.com/css-sprites/
    // https://www.toptal.com/developers/css/sprite-generator
    getItemIconClass: state => id => {
      const iconId = state.items[id]?.icon ?? 60034
      // const localImg = require(`../assert/${iconId}.png`)
      // if (localImg) {
      //   return localImg
      // } else {
      return DataUtil.iconIdToClass(iconId)
      // }
    },
    getAchievementIconClass: state => id => {
      const iconId = state.achievements[id]?.icon ?? 1100
      return DataUtil.iconIdToClass(iconId)
    },
    getAchievementName: state => id => {
      return DataUtil.getName(state.achievements[id])
    },
    getItemName: state => id => {
      return DataUtil.getName(state.items[id])
    },
    getZoneName: state => id => {
      const fishingSpot = state.fishingSpots[id]
      if (fishingSpot) {
        return DataUtil.getName(
          state.zones[state.weatherRates[fishingSpot.territory_id]?.zone_id]
        )
      } else {
        return ''
      }
    },
    getFishingSpotsName: state => id => {
      if (id != null) {
        return state.fishingSpots[id] && DataUtil.getName(state.fishingSpots[id])
      } else {
        return ''
      }
    },
    getFishingSpots: (_, getters) => locations =>
      locations.map(location => {
        const fishingSpot = getters.getFishingSpot(location)
        return {
          zone: getters.getZoneName(location),
          fishingSpot: fishingSpot,
          fishingSpotName: getters.getFishingSpotsName(location),
          fishingSpotId: location,
          fishSpotPositionText: DataUtil.toPositionText(fishingSpot),
        }
      }),
    getBaits: (state, getters) => (fish, customizedBestCatchPath, customizeFishDict) => {
      const bestCatchPath = customizedBestCatchPath ?? fish.bestCatchPath
      if (bestCatchPath.length < 1) return []
      const baitId = bestCatchPath[bestCatchPath.length - 1]
      const hookset = DataUtil.tugToHookset(fish.tug, fish.hookset)
      const optionalIndices = fish.optional ?? []
      const lastBait = {
        tug: fish.tug,
        tugIcon: DataUtil.TUG_ICON[fish.tug],
        hookset: hookset,
        hooksetIcon: DataUtil.iconIdToClass(DataUtil.HOOKSET_ICON[hookset]),
        hooksetSkillName: DataUtil.HOOKSET_SKILL_NAME_DICT[fish.hookset],
        baitId: baitId,
        baitName: getters.getItemName(baitId),
        baitIcon: getters.getItemIconClass(baitId),
      }
      if (bestCatchPath.length === 1) {
        return [lastBait]
      } else {
        return bestCatchPath.map((baitId, index, arr) => {
          if (index === arr.length - 1) {
            return lastBait
          } else {
            const fishDict = customizeFishDict ?? state.fish
            const baitFish = fishDict[arr[index + 1]]
            const hookset = DataUtil.tugToHookset(baitFish.tug, baitFish.hookset)
            return {
              tug: baitFish.tug,
              tugIcon: DataUtil.TUG_ICON[baitFish.tug],
              hookset: hookset,
              hooksetIcon: DataUtil.iconIdToClass(DataUtil.HOOKSET_ICON[hookset]),
              baitId: baitId,
              baitName: getters.getItemName(baitId),
              baitIcon: getters.getItemIconClass(baitId),
              optional: optionalIndices.includes(index),
            }
          }
        })
      }
    },
    // getWeatherAt: state => id => {
    //   const fishingSpot = this.fishingSpots[id]
    //   if (fishingSpot) {
    //     return DataUtil.getName(state.weatherTypes[EorzeaWeather.weatherAt(fishingSpot.territory_id, new EorzeaTime())])
    //   }
    // },
    getZoneId: state => id => {
      const fishingSpot = state.fishingSpots[id]
      if (fishingSpot) {
        return this.weatherRates[fishingSpot.territory_id].zone_id
      }
    },
    getWeather: state => weatherSet => {
      return weatherSet.map(id => {
        return {
          name: DataUtil.getName(state.weatherTypes[id]),
          icon: DataUtil.iconIdToClass(state.weatherTypes[id].icon),
        }
      })
    },
    getFishingSpot: state => fishingSpotId => {
      return state.fishingSpots[fishingSpotId]
    },
    getFishingSpotFish: (state, getters) => fishingSpotId => {
      if (fishingSpotId == null) return []
      return state.fishingSpotFish[fishingSpotId].map(it => ({
        id: it.fish,
        tug: it.tug,
        icon: getters.getItemIconClass(it.fish),
      }))
    },
    getFishCompleted: state => fishId => {
      return state.userData.completed.includes(fishId)
    },
    allCompletedFish: state => {
      return state.userData.completed
    },
    getFishPinned: state => fishId => {
      return state.userData.pinned.includes(fishId)
    },
    getFishToBeNotified: state => fishId => {
      return state.userData.toBeNotified.includes(fishId)
    },
    filters: state => {
      return state.userData.filters
    },
    pinnedFishIds: state => {
      return state.userData.pinned
    },
    showFilter: state => {
      return state.userData.showFilter
    },
    showBanner: state => {
      return state.userData.showBanner
    },
    opacity: state => {
      return state.userData.opacity
    },
    websiteVersion: state => {
      return state.userData.websiteVersion
    },
    rightPanePercentage: state => {
      return state.userData.rightPanePercentage
    },
    isNormalTabActive: state => {
      return state.activeTabIndex === DataUtil.TAB_INDEX_NORMAL
    },
    notification: state => {
      return state.userData.notification
    },
    detailComponents: state => {
      return state.userData.detailArrangement.components
    },
    isSystemNotificationEnabled: state => {
      return state.userData.notification.isSystemNotificationEnabled
    },
    darkMode: state => {
      return state.userData.theme.dark
    },
    startLight: state => {
      return state.userData.event.startLight
    },
    showOceanFishingWarningDialog: state => {
      return state.userData.oceanFishing.showWarningDialog
    },
  },
  mutations: {
    initialUserData(state) {
      // state.userData = DataUtil.mergeUserData(
      //   _.cloneDeep(DataUtil.USER_DEFAULT_DATA),
      //   LocalStorageUtil.loadAndBackupUserData()
      // )
      LocalStorageUtil.storeAndBackupUserData(state.userData)
    },
    setUserData(state, data) {
      state.userData = { ..._.cloneDeep(DataUtil.USER_DEFAULT_DATA), ...data }
      LocalStorageUtil.storeAndBackupUserData(state.userData)
    },
    setUserDataToDefault(state) {
      state.userData = _.cloneDeep(DataUtil.USER_DEFAULT_DATA)
      LocalStorageUtil.storeUserData(state.userData)
    },
    setFishCompleted(state, { fishId, completed }) {
      state.userData = updateUserDataStateRecords(
        state.userData,
        'completed',
        fishId,
        completed
      )
      if (completed) {
        state.userData = updateUserDataStateRecords(
          state.userData,
          'toBeNotified',
          fishId,
          false
        )
      }
    },
    setFishPinned(state, { fishId, pinned }) {
      state.userData = updateUserDataStateRecords(
        state.userData,
        'pinned',
        fishId,
        pinned
      )
    },
    setFishToBeNotified(state, { fishId, toBeNotified }) {
      state.userData = updateUserDataStateRecords(
        state.userData,
        'toBeNotified',
        fishId,
        toBeNotified
      )
    },
    setFilters(state, filters) {
      state.userData = { ...state.userData, filters }
      LocalStorageUtil.storeUserData(state.userData)
    },
    toggleFilterPanel(state) {
      state.userData = { ...state.userData, showFilter: !state.userData.showFilter }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setShowSearchDialog(state, show) {
      state.showSearchDialog = show
    },
    setShowImportExportDialog(state, show) {
      state.showImportExportDialog = show
    },
    showSnackbar(state, { text, color }) {
      state.snackbar = {
        show: true,
        text,
        color,
      }
    },
    setNotShowBanner(state) {
      state.userData = { ...state.userData, showBanner: false }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setShowFilter(state, showFilter) {
      state.userData = { ...state.userData, showFilter }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setOpacity(state, opacity) {
      state.userData = { ...state.userData, opacity }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setWebsiteVersion(state, websiteVersion) {
      state.userData = { ...state.userData, websiteVersion }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setRightPanePercentage(state, rightPanePercentage) {
      state.userData = { ...state.userData, rightPanePercentage }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setActiveTab(state, activeTabIndex) {
      state.activeTabIndex = activeTabIndex
    },
    setNotification(state, notification) {
      state.userData = { ...state.userData, notification }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setSounds(state, sounds) {
      state.sounds = sounds
    },
    clearToBeNotified(state) {
      state.userData = { ...state.userData, toBeNotified: [] }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setDetailArrangement(state, detailArrangement) {
      state.userData = { ...state.userData, detailArrangement }
      LocalStorageUtil.storeUserData(state.userData)
    },
    enableSystemNotification(state) {
      state.userData = {
        ...state.userData,
        notification: {
          ...state.userData.notification,
          isSystemNotificationEnabled: true,
        },
      }
      LocalStorageUtil.storeUserData(state.userData)
    },
    disableSystemNotification(state) {
      state.userData = {
        ...state.userData,
        notification: {
          ...state.userData.notification,
          isSystemNotificationEnabled: false,
        },
      }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setShowFishPageRightPane(state, show) {
      state.showFishPageRightPane = show
    },
    setDarkMode(state, dark) {
      state.userData = {
        ...state.userData,
        theme: {
          ...state.userData.theme,
          dark: dark,
        },
      }
      LocalStorageUtil.storeUserData(state.userData)
    },
    startLoading(state) {
      state.loading = true
    },
    finishLoading(state) {
      state.loading = false
    },
    setStartLight(state, startLight) {
      state.userData = {
        ...state.userData,
        event: { ...state.userData.event, startLight },
      }
      LocalStorageUtil.storeUserData(state.userData)
    },
    setShowOceanFishingWarningDialog(state, show) {
      state.userData = {
        ...state.userData,
        oceanFishing: { ...state.userData.oceanFishing, showWarningDialog: show },
      }
      LocalStorageUtil.storeUserData(state.userData)
    },
  },
  actions: {},
  modules: {},
})

function updateUserDataStateRecords(userData, type, key, value) {
  const temp = _.cloneDeep(userData)
  if (value) {
    const arr = temp[type]
    if (arr.indexOf(key) === -1 && key != null) {
      arr.push(key)
    }
  } else {
    temp[type] = userData[type].filter(it => it !== key)
  }
  LocalStorageUtil.storeUserData(temp)
  return temp
}
