import Vue from 'vue'
import Vuex from 'vuex'
import { DATA } from '@/store/data'
import DATA_CN from '@/store/translation'
import merge from 'lodash/merge'
import DataUtil from '@/utils/DataUtil'
import EorzeaWeather from '@/utils/Weather'
import EorzeaTime from '@/utils/Time'
import { cloneDeep, groupBy } from 'lodash'
import store from 'store2'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fish: merge(DATA.FISH, DATA_CN.FISH_ANGLER_ID),
    fishingSpots: merge(DATA.FISHING_SPOTS, DATA_CN.FISHING_SPOTS),
    spearFishingSports: DATA.SPEARFISHING_SPOTS,
    items: merge(DATA.ITEMS, DATA_CN.ITEMS),
    weatherRates: DATA.WEATHER_RATES,
    weatherTypes: merge(DATA.WEATHER_TYPES, DATA_CN.WEATHER_TYPES),
    regions: DATA.REGIONS,
    zones: merge(DATA.ZONES, DATA_CN.ZONES),
    folklore: DATA.FOLKLORE,
    bigFish: DATA.BIG_FISH,
    fishingSpotFish: groupBy(DATA_CN.FISHING_SPOT_FISH, 'fishingSpot'),
    userData: store.get('userData') ?? {
      completed: [],
      pinned: [],
      filters: {
        patches: [
          // eslint-disable-next-line
          2.0, 2.1, 2.2, 2.3, 2.4, 2.5,
          // eslint-disable-next-line
          3.0, 3.1, 3.2, 3.3, 3.4, 3.5,
          // eslint-disable-next-line
          4.0, 4.1, 4.2, 4.3, 4.4, 4.5,
          // eslint-disable-next-line
          5.0, 5.1, 5.2
        ],
        completeType: 'UNCOMPLETED',
        bigFishType: 'BIG_FISH',
        fishN: 10,
      },

      // page settings
      showFilter: true,
    },
  },
  getters: {
    getItemIconUrl: state => id => {
      const iconId = state.items[id].icon
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
      const iconId = state.items[id].icon
      // const localImg = require(`../assert/${iconId}.png`)
      // if (localImg) {
      //   return localImg
      // } else {
      return DataUtil.iconIdToClass(iconId)
      // }
    },
    getItemName: state => id => {
      return DataUtil.getName(state.items[id])
    },
    getZoneName: state => id => {
      const fishingSpot = state.fishingSpots[id]
      if (fishingSpot) {
        return DataUtil.getName(state.zones[state.weatherRates[fishingSpot.territory_id].zone_id])
      }
    },
    getFishingSpotsName: state => id => {
      return state.fishingSpots[id] && DataUtil.getName(state.fishingSpots[id])
    },
    getBaits: (state, getters) => fish => {
      if (fish.bestCatchPath.length < 1) return []
      const baitId = fish.bestCatchPath[fish.bestCatchPath.length - 1]
      const lastBait = {
        tug: fish.tug,
        tugIcon: DataUtil.TUG_ICON[fish.tug],
        hookset: fish.hookset,
        hooksetIcon: DataUtil.iconIdToClass(DataUtil.HOOKSET_ICON[fish.hookset]),
        baitId: baitId,
        baitName: getters.getItemName(baitId),
        baitIcon: getters.getItemIconClass(baitId),
      }
      if (fish.bestCatchPath.length === 1) {
        return [lastBait]
      } else {
        return fish.bestCatchPath.map((baitId, index, arr) => {
          if (index === arr.length - 1) {
            return lastBait
          } else {
            const baitFish = state.fish[arr[index + 1]]
            return {
              tug: baitFish.tug,
              tugIcon: DataUtil.TUG_ICON[fish.tug],
              hookset: baitFish.hookset,
              hooksetIcon: DataUtil.iconIdToClass(DataUtil.HOOKSET_ICON[fish.hookset]),
              baitId: baitId,
              baitName: getters.getItemName(baitId),
              baitIcon: getters.getItemIconClass(baitId),
            }
          }
        })
      }
    },
    getWeatherAt: state => id => {
      const fishingSpot = this.fishingSpots[id]
      if (fishingSpot) {
        return DataUtil.getName(state.weatherTypes[EorzeaWeather.weatherAt(fishingSpot.territory_id, new EorzeaTime())])
      }
    },
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
      return state.fishingSpotFish[fishingSpotId].map(it => ({
        id: it.fish,
        tug: it.tug,
        icon: getters.getItemIconClass(it.fish),
      }))
    },
    getFishCompleted: state => fishId => {
      return state.userData.completed.includes(fishId)
    },
    getFishPinned: state => fishId => {
      return state.userData.pinned.includes(fishId)
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
  },
  mutations: {
    setUserData(state, data) {
      state.userData = data
      store.set('userData', data)
    },
    setFishCompleted(state, { fishId, completed }) {
      state.userData = updateUserDataStateRecords(state.userData, 'completed', fishId, completed)
    },
    setFishPinned(state, { fishId, pinned }) {
      state.userData = updateUserDataStateRecords(state.userData, 'pinned', fishId, pinned)
    },
    setFilters(state, filters) {
      state.userData = { ...state.userData, filters }
      store.set('userData', state.userData)
    },
    toggleFilterPanel(state) {
      state.userData = { ...state.userData, showFilter: !state.userData.showFilter }
      store.set('userData', state.userData)
    },
  },
  actions: {},
  modules: {},
})

function updateUserDataStateRecords(userData, type, key, value) {
  const temp = cloneDeep(userData)
  if (value) {
    temp[type].push(key)
  } else {
    temp[type] = userData[type].filter(it => it !== key)
  }
  store.set('userData', temp)
  return temp
}
