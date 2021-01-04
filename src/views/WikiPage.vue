<template>
  <div style="height: 100%" class="d-flex">
    <v-navigation-drawer v-model="showMapMenu" bottom :fixed="isMobile" width="20vw">
      <v-card>
        <v-sheet class="pa-1 primary">
          <div class="d-flex align-center">
            <v-text-field
              v-model="searchText"
              :label="$t('wiki.searchTitle')"
              flat
              solo-inverted
              hide-details
              clearable
            ></v-text-field>
            <v-btn icon class="ml-1" @click="collapseAll">
              <v-icon>mdi-arrow-collapse-vertical</v-icon>
            </v-btn>
            <!-- expand all button -->
            <!--            <v-btn icon class="ml-1" @click="expandAll">-->
            <!--              <v-icon>mdi-arrow-expand-vertical</v-icon>-->
            <!--            </v-btn>-->
            <!-- setting button -->
            <!--            <v-btn v-if="type === 'fish' || type === 'spot'" @click="toggleSettingMode" icon>-->
            <!--              <v-icon>mdi-cog</v-icon>-->
            <!--            </v-btn>-->
          </div>
        </v-sheet>
        <v-card-text class="spot-list">
          <v-treeview
            ref="spotMenu"
            v-model="completedSpotFishIds"
            :items="regionTerritorySpots"
            item-key="id"
            hoverable
            dense
            activatable
            selectable
            :search="searchText"
            :filter="spotMenuSearchFn"
            :open.sync="openedItems"
            selected-color="primary"
            color="select"
            @update:active="onMenuItemActive"
          >
          </v-treeview>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
    <div style="height: 100%; width: 100%">
      <div
        :class="
          `detail-wrapper ${isMobile ? 'detail-wrapper-mobile' : 'detail-wrapper-pc'}`
        "
      >
        <!--        <code>{{ expandAllInSearching }}</code>-->
        <!--        <code>{{ searchResults }}</code>-->
        <!--        <code>{{ openedItems }}</code>-->
        <!--        <code>{{ normalOpenedItems }}</code>-->
        <!--        <code>{{ searchOpenedItems }}</code>-->
        <!--          <code>{{ currentTerritoryId }}</code>-->
        <!--          <code>{{ currentSpotId }}</code>-->
        <!--          <code>{{ currentFishId }}</code>-->
        <div
          v-if="
            !type ||
              type === 'region' ||
              (type === 'territory' && isOceanFishingTerritory)
          "
          class="d-flex justify-center align-center fill-height"
        >
          <!--  show empty / region view  -->
          <v-icon size="200">mdi-book-open-page-variant</v-icon>
        </div>
        <div v-else-if="type === 'territory'" style="width: 100%; height: 100%">
          <!--  show territory view  -->
          <eorzea-simple-map
            ref="simpleMap"
            :id="currentMapInfo.mapFileId"
            :size-factor="currentMapInfo.size_factor"
            :fishing-spots="currentSpotList"
          />
        </div>
        <div v-else-if="(type === 'spot' || type === 'fish') && !isOceanFishingSpot">
          <!--  show spot/fish view  -->
          <grid-layout
            v-if="currentSpotId"
            :layout.sync="layout"
            :col-num="12"
            :row-height="32"
            :is-draggable="isSettingMode"
            :is-resizable="isSettingMode"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            :use-css-transforms="true"
            style="z-index: 0"
          >
            <grid-item
              :static="mapLayout.static"
              :x="mapLayout.x"
              :y="mapLayout.y"
              :w="mapLayout.w"
              :h="mapLayout.h"
              @resized="onMapCardResized"
              :i="mapLayout.i"
            >
              <eorzea-simple-map
                ref="simpleMap"
                :id="currentMapInfo.mapFileId"
                :size-factor="currentMapInfo.size_factor"
                :fishing-spots="currentSpotList"
              />
            </grid-item>

            <grid-item
              :static="fishListLayout.static"
              :x="fishListLayout.x"
              :y="fishListLayout.y"
              :w="fishListLayout.w"
              :h="fishListLayout.h"
              :i="fishListLayout.i"
            >
              <div class="grid-content">
                <fish-list
                  :fish-list="currentFishList"
                  :fish-list-time-part="fishListTimePart"
                  :fish-list-weather-change-part="fishListWeatherChangePart"
                  hide-spot-column
                  @fish-selected="onFishClicked($event)"
                />
                <!--                <div style="overflow: hidden" class="rounded-lg inner elevation-4">-->
                <!--                  <div-->
                <!--                    v-for="(fish, index) in currentFlattenFishList"-->
                <!--                    :key="`${currentSpotId}-${fish._id}-${fish.isPredator ? 'p' : ''}`"-->
                <!--                    style="position: relative"-->
                <!--                  >-->
                <!--                    <fish-list-item-->
                <!--                      :fish="fish"-->
                <!--                      :fish-time-part="fishListTimePart[fish._id]"-->
                <!--                      :position="toPos(index)"-->
                <!--                      hide-spot-column-->
                <!--                      @click="onFishClicked(fish._id)"-->
                <!--                      :color="['waiting', 'waitingSecondary'][index % 2]"-->
                <!--                    />-->
                <!--                  </div>-->
                <!--                </div>-->
              </div>
            </grid-item>

            <grid-item
              :static="baitTableLayout.static"
              :x="baitTableLayout.x"
              :y="baitTableLayout.y"
              :w="baitTableLayout.w"
              :h="baitTableLayout.h"
              :i="baitTableLayout.i"
            >
              <div class="grid-content">
                <fish-tug-table v-if="mode === 'normal'" :value="currentFishList" />
                <fish-gig-table v-else :value="currentFishList" />
              </div>
            </grid-item>
          </grid-layout>
        </div>
        <div v-else-if="isOceanFishingSpot">
          <ocean-fishing-fish-list :fish-list="currentFishList" class="ml-2" />
          <!--          <pre>{{ JSON.stringify(currentFishList, null, 2) }}</pre>-->
        </div>
      </div>
      <div v-if="isMobile" style="position: absolute; top: 4px; left: 0; right: 0">
        <v-btn @click="showMapMenu = !showMapMenu" block color="primary" tile>
          点击选择地图
        </v-btn>
      </div>
    </div>
    <v-dialog
      v-model="isDetailFishWindowOpen"
      max-width="70vh"
      :fullscreen="isMobile"
      scrollable
    >
      <v-card>
        <v-card-text>
          <fish-detail
            :fish="currentFish"
            :now="now"
            :forceShowComponents="forceShowComponents"
          />
        </v-card-text>
        <v-card-actions>
          <div class="d-flex flex-column flex-fill">
            <click-helper @click="isDetailFishWindowOpen = false">
              <v-btn class="mt-2" color="default" block text>
                {{ $t('general.dialog.close') }}
              </v-btn>
            </click-helper>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import normSpots from '@/store/fishingSpots.json'
import placeNames from '@/store/placeNames.json'
import { mapGetters, mapMutations, mapState } from 'vuex'
import EorzeaSimpleMap from '@/components/basic/EorzeaSimpleMap'
import VueGridLayout from 'vue-grid-layout'
import _ from 'lodash'
import PinyinMatch from 'pinyin-match'
import DataUtil from '@/utils/DataUtil'
import FishDetail from '@/components/FishDetail'
import TreeModel from 'tree-model'
import ClickHelper from '@/components/basic/ClickHelper'
import FishList from '@/components/FishList'
import OceanFishingFishList from '@/components/OceanFishingFishList/OceanFishingFishList'
import FIX from '@/store/fix'
import FishGigTable from '@/components/FishingGigTable'
import FishTugTable from '@/components/FishingTugTable'

export default {
  name: 'WikiPage',
  components: {
    FishTugTable,
    FishGigTable,
    OceanFishingFishList,
    FishList,
    ClickHelper,
    FishDetail,
    EorzeaSimpleMap,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
  },
  props: [
    'lazyTransformedFishDict',
    'fishListTimePart',
    'now',
    'fishListWeatherChangePart',
    'extraFishListTimePart',
    'lazyFishSourceList',
    'lazyTransformedFishList',
  ],
  data: () => ({
    type: undefined,
    currentTerritoryId: -1,
    currentSpotId: -1,
    currentFishId: -1,
    completedSpots: [],
    // regionTerritorySpots: [],
    openedItems: undefined,
    normalOpenedItems: [],
    searchOpenedItems: [],
    spotDict: {},
    territoryDict: {},
    isSettingMode: false,
    searching: false,
    lazySearchText: '',
    activeItem: undefined,
    preActiveItem: undefined,
    isDetailFishWindowOpen: false,
    showMapMenu: true,
    root: undefined,
    searchResults: { text: '', nodeIds: [] },
    forceShowComponents: undefined,
    mode: 'spear', //'normal',
  }),
  computed: {
    currentSpotsData() {
      return this.mode === 'normal' ? normSpots : FIX.SPEAR_REGION_TERRITORY_POINT
    },
    regionTerritorySpots() {
      if (
        this.lazyTransformedFishDict &&
        Object.keys(this.lazyTransformedFishDict).length > 0
      ) {
        return this.currentSpotsData
          .filter(region => region.id != null)
          .map(region => {
            // output += `region,${region.id},${placeNames[region.id]}\n`
            return {
              id: 'region-' + region.id,
              name: placeNames[region.id],
              // TODO: arrange region & territory according to order
              children: region.territories.map(territory => {
                // output += `territory,${territory.id},${placeNames[territory.id]}\n`
                this.territoryDict[territory.id] = territory.spots.map(spot => spot.id)
                return {
                  id: 'territory-' + territory.id,
                  name: placeNames[territory.id],
                  children: territory.spots.map(spot => {
                    // output += `spot,${spot.id},${this.getFishingSpotsName(spot.id)}\n`
                    // console.log(Object.keys(this.lazyTransformedFishDict))
                    const fishList = spot.fishList.filter(fishId => {
                      const fish = this.lazyTransformedFishDict[fishId]
                      if (!fish) {
                        console.warn('fish data missing for', fishId)
                      }
                      return fish
                    })
                    this.spotDict[spot.id] = {
                      spotId: spot.id,
                      territoryId: territory.id,
                      regionId: region.id,
                      // [NOTE][VERSION]
                      // filter future version fish out
                      fishList,
                    }
                    return {
                      id: 'spot-' + spot.id,
                      name:
                        this.mode === 'normal'
                          ? this.getFishingSpotsName(spot.id)
                          : placeNames[
                              FIX.SPEAR_FISH_GATHERING_POINTS[spot.id].placeNameId
                            ],
                      children: fishList.map(fishId => {
                        return {
                          id: 'spot-' + spot.id + '-fish-' + fishId,
                          name: this.lazyTransformedFishDict[fishId].name,
                        }
                      }),
                    }
                  }),
                }
              }),
            }
          })
      }
      return []
    },
    isOceanFishingTerritory() {
      return this.currentTerritoryId === 3477
    },
    isOceanFishingSpot() {
      return this.territoryDict[3477]?.includes(this.currentSpotId)
    },
    // [TODO-TREE-PATH-AUTO-OPEN]
    // expandAllInSearching() {
    //   return this.searching && this.searchResults.nodeIds.length > 0 && this.searchResults.nodeIds.length < 10
    // },
    layout() {
      if (this.isMobile) {
        return [
          { x: 0, y: 0, w: 12, h: 10, i: 'map' },
          {
            x: 0,
            y: 20,
            w: 12,
            h: 30,
            i: 'fishList',
          },
          { x: 0, y: 10, w: 12, h: 6, i: 'fishTugList' },
        ]
      } else {
        return [
          { x: 7, y: 0, w: 5, h: 17, i: 'map' },
          {
            x: 0,
            y: 5.5,
            w: 7,
            h: 18,
            i: 'fishList',
          },
          { x: 0, y: 0, w: 7, h: 5.5, i: 'fishTugList' },
        ]
      }
    },
    searchText: {
      get() {
        return this.lazySearchText
      },
      set(newSearchText) {
        this.debouncedSearchTextUpdater(newSearchText)
      },
    },
    mapLayout() {
      return this.layout[0]
    },
    fishListLayout() {
      return this.layout[1]
    },
    baitTableLayout() {
      return this.layout[2]
    },
    currentMapInfo() {
      const currentSpot = _.first(this.currentSpotList)
      return {
        size_factor: currentSpot.size_factor,
        mapFileId: currentSpot.mapFileId,
      }
    },
    currentSpotList() {
      switch (this.type) {
        case 'territory':
          return this.territoryDict[this.currentTerritoryId].map(this.assembleSpot)
        case 'fish':
        case 'spot':
          return [this.assembleSpot(this.currentSpotId)]
        default:
          return []
      }
    },
    currentFishList() {
      return this.spotDict?.[this.currentSpotId]?.fishList?.map(
        fishId => this.lazyTransformedFishDict[fishId]
      )
    },
    currentFlattenFishList() {
      return (
        this.currentFishList?.flatMap(fish => {
          return [fish, ...fish.predators]
        }) ?? []
      )
    },
    completedSpotFishIds: {
      get() {
        return this.allCompletedFish.flatMap(
          fishId =>
            this.lazyTransformedFishDict[fishId]?.fishingSpots.map(
              spot => `spot-${spot.fishingSpotId}-fish-${fishId}`
            ) ?? []
        )
      },
      set(newSpotFishIds) {
        const oldSpotFishIds = this.completedSpotFishIds

        if (_.isEqual(_.sortBy(oldSpotFishIds), _.sortBy(newSpotFishIds))) {
          return
        }

        const removed = _.difference(oldSpotFishIds, newSpotFishIds).map(it =>
          this.extractFishId(it)
        )
        const added = _.difference(newSpotFishIds, oldSpotFishIds).map(it =>
          this.extractFishId(it)
        )
        if (removed.length > 0) {
          removed.forEach(id => this.setFishCompleted({ fishId: id, completed: false }))
        } else if (added.length > 0) {
          added.forEach(id => this.setFishCompleted({ fishId: id, completed: true }))
        }
      },
    },
    currentFish() {
      return DataUtil.assembleFishForDetail(
        this.currentFishId,
        this.allFish,
        this.lazyTransformedFishDict,
        this.fishListTimePart,
        this.extraFishListTimePart,
        this.fishListWeatherChangePart
      )
    },
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
    ...mapState({ allFish: 'fish' }),
    ...mapGetters([
      'getFishingSpotsName',
      'getFishingSpot',
      'getFishCompleted',
      'allCompletedFish',
    ]),
  },
  watch: {
    regionTerritorySpots(regionTerritorySpots) {
      if (regionTerritorySpots && regionTerritorySpots.length > 0) {
        this.root = new TreeModel().parse({
          name: 'root',
          children: this.regionTerritorySpots,
        })
        this.updateCompletedSpot(this.allCompletedFish)
      }
    },
    // lazyTransformedFishDict: {
    //   handler(lazyTransformedFishDict) {
    //     if (lazyTransformedFishDict && lazyTransformedFishDict.length > 0) {
    //       this.regionTerritorySpots = regionTerritorySpots
    //         .filter(region => region.id != null)
    //         .map(region => {
    //           // output += `region,${region.id},${placeNames[region.id]}\n`
    //           return {
    //             id: 'region-' + region.id,
    //             name: placeNames[region.id],
    //             // TODO: arrange region & territory according to order
    //             children: region.territories.map(territory => {
    //               // output += `territory,${territory.id},${placeNames[territory.id]}\n`
    //               this.territoryDict[territory.id] = territory.spots.map(spot => spot.id)
    //               return {
    //                 id: 'territory-' + territory.id,
    //                 name: placeNames[territory.id],
    //                 children: territory.spots.map(spot => {
    //                   // output += `spot,${spot.id},${this.getFishingSpotsName(spot.id)}\n`
    //                   // console.log(Object.keys(this.lazyTransformedFishDict))
    //                   const fishList = spot.fishList.filter(fishId => {
    //                     const fish = this.lazyTransformedFishDict[fishId]
    //                     if (!fish) {
    //                       console.warn('fish data missing for', fishId)
    //                     }
    //                     return fish
    //                   })
    //                   this.spotDict[spot.id] = {
    //                     spotId: spot.id,
    //                     territoryId: territory.id,
    //                     regionId: region.id,
    //                     // [NOTE][VERSION]
    //                     // filter future version fish out
    //                     fishList,
    //                   }
    //                   return {
    //                     id: 'spot-' + spot.id,
    //                     name: this.getFishingSpotsName(spot.id),
    //                     children: fishList.map(fishId => {
    //                       // output += `fish,${fishId},${this.lazyTransformedFishDict[fishId].name}\n`
    //                       return {
    //                         id: 'spot-' + spot.id + '-fish-' + fishId,
    //                         name: this.lazyTransformedFishDict[fishId].name,
    //                       }
    //                     }),
    //                   }
    //                 }),
    //               }
    //             }),
    //           }
    //         })
    //
    //       this.root = new TreeModel().parse({
    //         name: 'root',
    //         children: this.regionTerritorySpots,
    //       })
    //       this.updateCompletedSpot(this.allCompletedFish)
    //     }
    //   },
    //   immediate: true,
    // },
    // [TODO-TREE-PATH-AUTO-OPEN]
    // expandAllInSearching(expand) {
    //   if (expand) {
    //     this.$nextTick(() => {
    //       this.openedItems = _.uniq(
    //         this.searchResults.nodeIds.flatMap(id => {
    //           // console.log(id, this.getPathNodesOf(id))
    //           return this.getPathNodesOf(id)
    //         })
    //       )
    //     })
    //   }
    // },
    // TODO resize map in simple map correctly
    currentSpotId(currentSpotId) {
      if (currentSpotId !== -1) {
        setTimeout(() => this.$refs.simpleMap?.resize(), 500)
      }
    },
    // allCompletedFish(allCompletedFish) {
    //   this.updateCompletedSpot(allCompletedFish)
    // },
    completedSpots(newSpots, oldSpots) {
      // console.log(newSpots, oldSpots)
      const removed = _.difference(oldSpots, newSpots).map(
        it => +it.substring('spot-'.length)
      )
      const added = _.difference(newSpots, oldSpots).map(
        it => +it.substring('spot-'.length)
      )
      if (removed.length > 0) {
        _.uniq(removed.flatMap(it => this.spotDict[it].fishList)).forEach(it => {
          this.setFishCompleted({ fishId: it, completed: false })
        })
      } else if (added.length > 0) {
        _.uniq(added.flatMap(it => this.spotDict[it].fishList)).forEach(it => {
          this.setFishCompleted({ fishId: it, completed: true })
        })
      }
    },
    currentFishId(fishId) {
      if (fishId > 0) {
        this.isDetailFishWindowOpen = true
        this.$emit('fish-selected', fishId)
      }
    },
    isDetailFishWindowOpen(isOpen) {
      if (!isOpen) {
        this.currentFishId = -1
      }
    },
  },
  created() {
    this.openedItems = this.normalOpenedItems
    this.detailWindowLeft = window.innerWidth * 0.7 - 100
    this.detailWindowHeight = window.innerHeight * 0.7
    this.detailWindowWidth = window.innerWidth * 0.25
    this.debouncedSearchTextUpdater = _.debounce(text => {
      const t = text == null ? '' : text
      this.updateOpenItems(t, this.lazySearchText)
      this.lazySearchText = t
    }, 500)

    // let output = ''
  },
  methods: {
    toPos(index) {
      return index === 0
        ? 'first'
        : index === this.currentFlattenFishList.length - 1
        ? 'last'
        : 'inside'
    },
    getPathNodesOf(id) {
      return (
        this.root
          ?.first(node => {
            return id != null && node.model.id === id
          })
          ?.getPath()
          ?.map(it => it.model.id)
          ?.filter(it => it != null) ?? []
      )
    },
    updateOpenItems(search, oldSearch) {
      if (search === '' && oldSearch !== '') {
        const activeNodes = this.getPathNodesOf(this.activeItem)

        this.openedItems = _.uniq([...this.normalOpenedItems, ...activeNodes])
        this.searchOpenedItems = []
        this.searching = false
      } else if (search !== '' && oldSearch === '') {
        this.normalOpenedItems = this.openedItems
        this.openedItems = this.searchOpenedItems
        this.searching = true
      }
    },
    onFishClicked({ fishId, components }) {
      this.currentFishId = fishId
      this.forceShowComponents = components
    },
    onMapCardResized() {
      setTimeout(() => this.$refs.simpleMap?.resize(), 300)
    },
    toggleSettingMode() {
      this.isSettingMode = !this.isSettingMode
    },
    updateCompletedSpot(allCompletedFish) {
      const completedSpots = []
      Object.values(this.spotDict).forEach(spot => {
        if (
          spot.fishList.length > 0 &&
          spot.fishList.every(fishId => allCompletedFish.includes(fishId))
        ) {
          completedSpots.push('spot-' + spot.spotId)
        }
      })
      // console.log(_.isEqual(this.completedSpots, completedSpots))
      if (!_.isEqual(_.sortBy(this.completedSpots), _.sortBy(completedSpots))) {
        this.completedSpots = completedSpots
      }
    },
    onMenuItemActive(items) {
      if (items.length === 0) {
        if (this.preActiveItem != null) {
          this.openedItems.splice(this.openedItems.indexOf(this.preActiveItem), 1)
        }
        return
      }

      this.activeItem = items[0]

      const parts = this.activeItem.split('-')
      if (parts.length === 4) {
        this.type = parts[2]
      } else {
        this.type = parts[0]
      }
      switch (this.type) {
        case 'region':
          break
        case 'territory':
          this.currentTerritoryId = +parts[1]
          break
        case 'spot':
          this.currentSpotId = +parts[1]
          break
        case 'fish':
          this.currentSpotId = +parts[1]
          this.currentFishId = +parts[3]
          break
        default:
          console.error('not supported')
      }

      if (this.type !== 'spot') {
        if (!this.openedItems.includes(this.activeItem)) {
          this.openedItems.push(this.activeItem)
        }
        this.preActiveItem = this.activeItem
      } else {
        this.preActiveItem = null
      }
    },
    extractFishId(spotFishId) {
      return +spotFishId.split('-')[3]
    },
    spotMenuSearchFn(item, searchText, textKey) {
      const itemText = item[textKey]
      let result
      if (this.$i18n.locale === 'zh-CN') {
        if (itemText == null) {
          console.log(item.id)
        }
        result = PinyinMatch.match(itemText ?? '', searchText) !== false
      } else {
        result = itemText.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      }

      // [TODO-TREE-PATH-AUTO-OPEN]
      // const nodeIds = result ? [item.id] : []
      // if (this.searchResults.text === searchText) {
      //   this.searchResults = { text: searchText, nodeIds: [...this.searchResults.nodeIds, ...nodeIds] }
      // } else {
      //   this.searchResults = { text: searchText, nodeIds: nodeIds }
      // }
      return result
    },
    expandAll() {
      this.$refs.spotMenu.updateAll(true)
    },
    collapseAll() {
      this.$refs.spotMenu.updateAll(false)
    },
    assembleSpot(spotId) {
      if (this.mode === 'normal') {
        const spot = this.getFishingSpot(spotId)
        return { ...spot, name: DataUtil.getName(spot) }
      } else {
        const gatheringPoint = FIX.SPEAR_FISH_GATHERING_POINTS[spotId]
        // console.log('gp', spotId, {
        //   ...gatheringPoint,
        //   name: DataUtil.getName(gatheringPoint),
        // })
        return { ...gatheringPoint, name: DataUtil.getName(gatheringPoint) }
      }
    },
    ...mapMutations(['setFishCompleted']),
  },
}
</script>

<style lang="sass" scoped>
@import "../styles/RcVariables"

//.wiki-map
//  width: 100%
//  height: calc(100vh - #{ $top-bars-padding + $footer-padding})

//.vue-grid-layout
  //background: #eee


//.vue-grid-item:not(.vue-grid-placeholder)
//background: #ccc
//border: 1px solid black

.vue-grid-item .resizing
  opacity: 0.9


.vue-grid-item .text
  font-size: 24px
  text-align: center
  position: absolute

  top: 0
  bottom: 0
  left: 0
  right: 0
  margin: auto
  height: 100%
  width: 100%

.grid-content
  height: 100%
  overflow-scrolling: auto
  overflow-y: auto
  padding: 0 4px
  margin: 0 0 4px 0

.spot-list
  height: calc(100vh - #{ $top-bars-padding + $footer-padding + 56})
  overflow-scrolling: auto
  overflow-y: scroll

.detail-wrapper
  width: 100%
  height: 100%
  overflow-scrolling: auto
  overflow-y: scroll
  overflow-x: hidden

  &-mobile
    max-height: calc(100vh - #{ $top-bars-padding + $footer-padding + 40})
    margin-top: 40px

  &-pc
    max-height: calc(100vh - #{ $top-bars-padding + $footer-padding})
</style>
