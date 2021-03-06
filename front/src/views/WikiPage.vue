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
            <v-btn icon text class="ml-1" @click="collapseAll">
              <v-icon>mdi-arrow-collapse-vertical</v-icon>
            </v-btn>
            <!-- expand all button -->
            <!--            <v-btn icon text class="ml-1" @click="expandAll">-->
            <!--              <v-icon>mdi-arrow-expand-vertical</v-icon>-->
            <!--            </v-btn>-->
            <!-- setting button -->
            <!--            <v-btn v-if="type === 'fish' || type === 'spot'" @click="toggleSettingMode" icon>-->
            <!--              <v-icon>mdi-cog</v-icon>-->
            <!--            </v-btn>-->
          </div>
        </v-sheet>
        <div class="d-flex justify-center">
          <v-btn-toggle
            v-model="mode"
            color="primary"
            class="my-1"
            mandatory
            background-color="transparent"
          >
            <v-btn
              :value="mode.value"
              v-for="(mode, index) in modes"
              :key="index"
              @click="clearCurrentStatus(mode)"
            >
              <div class="d-flex align-center">
                <item-icon :icon-class="mode.icon" />
                <span>{{ mode.title }}</span>
              </div>
            </v-btn>
          </v-btn-toggle>
        </div>
        <v-card-text class="spot-list">
          <v-treeview
            v-show="mode === 'normal'"
            ref="normalSpotMenu"
            v-model="normalCompletedSpotFishIds"
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
          />
          <v-treeview
            v-show="mode === 'spear'"
            ref="spearSpotMenu"
            v-model="spearCompletedSpotFishIds"
            :items="spearRegionTerritorySpots"
            item-key="id"
            hoverable
            dense
            activatable
            selectable
            :search="searchText"
            :filter="spotMenuSearchFn"
            :open.sync="spearOpenedItems"
            selected-color="primary"
            color="select"
            @update:active="onMenuItemActive"
          />
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
    <div style="height: 100%; width: 100%">
      <div
        :class="
          `detail-wrapper ${isMobile ? 'detail-wrapper-mobile' : 'detail-wrapper-pc'}`
        "
      >
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
            :show-fishing-range-helper="mode === 'normal'"
          />
        </div>
        <div
          v-else-if="(type === 'spot' || type === 'fish') && !isOceanFishingSpot"
          class="grid-content"
        >
          <!--  show spot/fish view  -->
          <v-row v-if="currentSpotId" no-gutters>
            <v-col cols="12" class="my-1">
              <v-expansion-panels hover flat tile :value="0">
                <v-expansion-panel class="systemSecondary">
                  <v-expansion-panel-header class="systemSecondary">
                    <div
                      style="display: flex; align-items: center; justify-content: center"
                    >
                      <link-list
                        :id="currentMapInfo.id"
                        :angler-id="currentMapInfo.anglerLocationId"
                        :name="currentMapInfo.name"
                        mode="spot"
                        :spot-mode="mode"
                      >
                        <v-hover v-slot="{ hover }">
                          <div
                            :class="
                              `text-subtitle-1 ${
                                hover ? 'info--text text-decoration-underline' : ''
                              }`
                            "
                          >
                            {{ currentMapInfo.name }}
                          </div>
                        </v-hover>
                      </link-list>
                      <!--                      <div-->
                      <!--                        class="text-subtitle-1"-->
                      <!--                        :title="currentMapInfo.name + '#' + currentMapInfo.id"-->
                      <!--                      >-->
                      <!--                        {{ currentMapInfo.name }}-->
                      <!--                      </div>-->
                      <div class="text-subtitle-1 ml-2">
                        ({{ currentMapInfo.fishSpotPositionText }})
                      </div>
                      <click-helper @click.stop :copy-text="currentMapInfo.name">
                        <v-btn class="my-2" text icon :title="$t('list.item.copyHint')">
                          <v-icon>mdi-content-copy</v-icon>
                        </v-btn>
                      </click-helper>
                      <click-helper
                        @click.stop="
                          goToFishingSpotAngelPage(
                            currentMapInfo.anglerLocationId,
                            currentMapInfo.name
                          )
                        "
                      >
                        <v-btn class="my-2" text icon :title="$t('list.item.linkHint')">
                          <v-icon>mdi-link-variant</v-icon>
                        </v-btn>
                      </click-helper>
                      <!--                    {{ currentMapInfo }}-->
                    </div>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div
                      style="width: 100%; height: 512px"
                      class="d-flex justify-center mt-4"
                    >
                      <div style="width: 100%; max-width: 512px">
                        <eorzea-simple-map
                          ref="simpleMap"
                          :id="currentMapInfo.mapFileId"
                          :size-factor="currentMapInfo.size_factor"
                          :fishing-spots="currentSpotList"
                          :show-fishing-range-helper="mode === 'normal'"
                        />
                      </div>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>

            <v-col cols="12" class="my-1">
              <div>
                <v-card v-if="showSpotPredators" color="info">
                  <v-card-title>
                    {{ $t('gigTip.fishShadow.title') }}
                  </v-card-title>
                  <v-card-text>
                    此处为鱼影，需要刺相应个数的前置鱼才能触发，触发后在小地图上会有鱼影位置提示。<br />
                    当前版本中，鱼影并没有记录在钓鱼笔记中。<br />
                    在5.4版本，所有鱼影会加入钓鱼笔记。此处鱼影的名称以及位置均来自于5.4版本数据。<br />
                    少数位置与当前5.3版本并不一致，请以游戏中的提示为准。<br />
                  </v-card-text>
                  <v-card-subtitle>
                    {{ $t('gigTip.fishShadow.location') }}
                  </v-card-subtitle>
                  <v-card-text>
                    <detail-item-map :fish="currentSpotPredators[0]" />
                  </v-card-text>
                  <v-card-subtitle>
                    {{ $t('gigTip.fishShadow.predators') }}
                  </v-card-subtitle>

                  <v-card-text>
                    <fish-list
                      :fish-list="currentSpotPredators"
                      :fish-list-time-part="fishListTimePart"
                      :fish-list-weather-change-part="fishListWeatherChangePart"
                      :show-fish-divider="false"
                      hide-spot-column
                      @fish-selected="onFishClicked($event)"
                    />
                  </v-card-text>
                </v-card>
              </div>
            </v-col>

            <v-col cols="12" class="my-1">
              <v-card>
                <v-card-text>
                  <fish-list
                    :fish-list="currentFishList"
                    :fish-list-time-part="fishListTimePart"
                    :fish-list-weather-change-part="fishListWeatherChangePart"
                    hide-spot-column
                    hide-predators
                    @fish-selected="onFishClicked($event)"
                  />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" class="my-1">
              <fish-tug-table v-if="mode === 'normal'" :value="currentFishList" />
              <fish-gig-table v-else :value="currentFishList" />
            </v-col>
          </v-row>
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
            :show-fishing-range-helper="mode === 'normal'"
            hide-map
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
import DetailItemMap from '@/components/fish-detail-items/DetailItemMap'
import ItemIcon from '@/components/basic/ItemIcon'
import LinkList from '@/components/basic/LinkList'

export default {
  name: 'WikiPage',
  components: {
    LinkList,
    ItemIcon,
    DetailItemMap,
    FishTugTable,
    FishGigTable,
    OceanFishingFishList,
    FishList,
    ClickHelper,
    FishDetail,
    EorzeaSimpleMap,
    // GridLayout: VueGridLayout.GridLayout,
    // GridItem: VueGridLayout.GridItem,
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
  data: vm => ({
    modes: [
      { title: vm.$t('wiki.mode.normal'), icon: 'bg-060027', value: 'normal' },
      { title: vm.$t('wiki.mode.spear'), icon: 'bg-060037', value: 'spear' },
    ],
    type: undefined,
    currentTerritoryId: -1,
    currentSpotId: -1,
    currentFishId: -1,
    // completedSpots: [],
    // regionTerritorySpots: [],
    openedItems: [],
    normalOpenedItems: [],
    searchOpenedItems: [],
    spearOpenedItems: [],
    spearNormalOpenedItems: [],
    spearSearchOpenedItems: [],
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
    mode: 'normal',
    FISH_ID_TO_WIKI_IDS: DataUtil.generateFishId2WikiId(FIX.FISH),
  }),
  computed: {
    showSpotPredators() {
      return (
        this.mode === 'spear' && this.currentFishList.some(it => it.predators.length > 0)
      )
    },
    currentSpotPredators() {
      return this.currentFishList.find(fish => fish.predators.length > 0)?.predators ?? []
    },
    currentRegionTerritorySpots() {
      return this.mode === 'normal'
        ? this.regionTerritorySpots
        : this.spearRegionTerritorySpots
    },
    regionTerritorySpots() {
      return this.loadWikiDataOfType('normal')
    },
    spearRegionTerritorySpots() {
      return this.loadWikiDataOfType('spear')
    },
    isOceanFishingTerritory() {
      return this.currentTerritoryId >= 3444 && this.currentTerritoryId <= 3447
    },
    isOceanFishingSpot() {
      return this.currentSpotId >= 237 && this.currentSpotId <= 244
    },
    // [TODO-TREE-PATH-AUTO-OPEN]
    // expandAllInSearching() {
    //   return this.searching && this.searchResults.nodeIds.length > 0 && this.searchResults.nodeIds.length < 10
    // },
    searchText: {
      get() {
        return this.lazySearchText
      },
      set(newSearchText) {
        this.debouncedSearchTextUpdater(newSearchText)
      },
    },
    currentMapInfo() {
      const currentSpot = _.first(this.currentSpotList)
      console.debug('Current Spot', currentSpot)
      return {
        ...currentSpot,
        id: currentSpot._id,
        fishSpotPositionText: DataUtil.toPositionText(currentSpot),
        size_factor: currentSpot.size_factor,
        mapFileId: currentSpot.mapFileId,
      }
    },
    currentSpotList() {
      if (this.currentSpotId === -1 && this.currentTerritoryId === -1) {
        return []
      }
      switch (this.type) {
        case 'territory':
          return this.territoryDict[`${this.mode}-${this.currentTerritoryId}`].map(
            this.assembleSpot
          )
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
    normalCompletedSpotFishIds: {
      get() {
        return this.getSpotsOfType('normal')
      },
      set(newSpotFishIds) {
        const oldSpotFishIds = this.normalCompletedSpotFishIds
        this.updateCompleted(oldSpotFishIds, newSpotFishIds)
      },
    },
    spearCompletedSpotFishIds: {
      get() {
        return this.getSpotsOfType('spear')
      },
      set(newSpotFishIds) {
        const oldSpotFishIds = this.spearCompletedSpotFishIds
        this.updateCompleted(oldSpotFishIds, newSpotFishIds)
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
    currentRegionTerritorySpots(regionTerritorySpots) {
      if (regionTerritorySpots && regionTerritorySpots.length > 0) {
        this.root = new TreeModel().parse({
          name: 'root',
          children: this.regionTerritorySpots,
        })
        // this.updateCompletedSpot(this.allCompletedFish)
      }
    },
    currentSpotId(currentSpotId) {
      if (currentSpotId !== -1) {
        setTimeout(() => this.$refs.simpleMap?.resize(), 500)
      }
    },
    // completedSpots(newSpots, oldSpots) {
    //   console.debug('not used')
    //   // console.log(newSpots, oldSpots)
    //   const removed = _.difference(oldSpots, newSpots).map(
    //     it => +it.substring('spot-'.length)
    //   )
    //   const added = _.difference(newSpots, oldSpots).map(
    //     it => +it.substring('spot-'.length)
    //   )
    //   if (removed.length > 0) {
    //     _.uniq(removed.flatMap(it => this.spotDict[it].fishList)).forEach(it => {
    //       this.setFishCompleted({ fishId: it, completed: false })
    //     })
    //   } else if (added.length > 0) {
    //     _.uniq(added.flatMap(it => this.spotDict[it].fishList)).forEach(it => {
    //       this.setFishCompleted({ fishId: it, completed: true })
    //     })
    //   }
    // },
    currentFishId(fishId) {
      if (fishId > 0 && !this.isOceanFishingSpot) {
        this.isDetailFishWindowOpen = true
        this.$emit('fish-selected', { fishId })
      }
    },
    isDetailFishWindowOpen(isOpen) {
      if (!isOpen) {
        this.currentFishId = -1
      }
    },
    '$route.query': {
      handler(query) {
        console.debug('watch query', query)
        this.mode = query.mode ?? 'normal'
        this.currentSpotId = +(query.spotId ?? -1)
        this.type = this.currentSpotId !== -1 ? 'spot' : undefined
      },
      immediate: true,
    },
  },
  created() {
    console.debug('nav with query', this.$route.query)
    // this.mode = this.$route.query.mode ?? 'normal'
    // this.currentSpotId = +(this.$route.query.spotId ?? -1)
    // this.type = this.currentSpotId !== -1 ? 'spot' : undefined
    this.openedItems = this.normalOpenedItems
    this.spearOpenedItems = this.spearNormalOpenedItems
    this.debouncedSearchTextUpdater = _.debounce(text => {
      const t = text == null ? '' : text
      this.updateOpenItems(t, this.lazySearchText)
      this.lazySearchText = t
    }, 500)
  },
  methods: {
    clearCurrentStatus(mode) {
      if (mode !== this.mode) {
        this.type = undefined
        this.currentTerritoryId = -1
        this.currentSpotId = -1
        this.currentFishId = -1
        this.openedItems = this.normalOpenedItems = []
        this.searchOpenedItems = []
        this.spearOpenedItems = this.spearNormalOpenedItems = []
        this.spearSearchOpenedItems = []
      }
    },
    getSpotsOfType(type) {
      return this.allCompletedFish.flatMap(fishId => {
        const wikiIds = this.FISH_ID_TO_WIKI_IDS[fishId]
        if (wikiIds) {
          const spotFishId = wikiIds[0].split('-')[3]
          const fishType = this.lazyTransformedFishDict[spotFishId].type
          if (fishType === type) {
            return wikiIds
          } else {
            return []
          }
        } else {
          const fish = this.lazyTransformedFishDict[fishId]
          if (fish?.type === type) {
            return (
              fish?.fishingSpots.map(
                spot => `spot-${spot.fishingSpotId}-fish-${fishId}`
              ) ?? []
            )
          } else {
            return []
          }
        }
      })
    },
    updateCompleted(oldSpotFishIds, newSpotFishIds) {
      // const oldSpotFishIds = this.normalCompletedSpotFishIds

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
        this.batchSetFishCompleted({ fishIds: removed, completed: false })
      } else if (added.length > 0) {
        this.batchSetFishCompleted({ fishIds: added, completed: true })
      }
    },
    loadWikiDataOfType(type) {
      if (
        this.lazyTransformedFishDict &&
        Object.keys(this.lazyTransformedFishDict).length > 0
      ) {
        return (type === 'normal' ? normSpots : FIX.SPEAR_REGION_TERRITORY_POINT)
          .filter(region => region.id != null)
          .map(region => {
            // output += `region,${region.id},${placeNames[region.id]}\n`
            return {
              id: 'region-' + region.id,
              name: placeNames[region.id],
              // TODO: arrange region & territory according to order
              children: region.territories.map(territory => {
                // output += `territory,${territory.id},${placeNames[territory.id]}\n`
                this.territoryDict[`${type}-${territory.id}`] = territory.spots.map(
                  spot => spot.id
                )
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
                        type === 'normal'
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
    goToFishingSpotAngelPage(anglerId, name) {
      DataUtil.goToFishingSpotAngelPage(anglerId, name, this.isMobile, this.showSnackbar)
    },
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

        if (this.mode === 'normal') {
          this.openedItems = _.uniq([...this.normalOpenedItems, ...activeNodes])
          this.searchOpenedItems = []
        } else {
          this.spearOpenedItems = _.uniq([...this.spearNormalOpenedItems, ...activeNodes])
          this.spearSearchOpenedItems = []
        }
        this.searching = false
      } else if (search !== '' && oldSearch === '') {
        if (this.mode === 'normal') {
          this.normalOpenedItems = this.openedItems
          this.openedItems = this.searchOpenedItems
        } else {
          this.spearNormalOpenedItems = this.spearOpenedItems
          this.spearOpenedItems = this.spearSearchOpenedItems
        }
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
    // updateCompletedSpot(allCompletedFish) {
    //   console.debug('not used')
    //   const completedSpots = []
    //   Object.values(this.spotDict).forEach(spot => {
    //     if (
    //       spot.fishList.length > 0 &&
    //       spot.fishList.every(fishId => allCompletedFish.includes(fishId))
    //     ) {
    //       completedSpots.push('spot-' + spot.spotId)
    //     }
    //   })
    //   // console.log(_.isEqual(this.completedSpots, completedSpots))
    //   if (!_.isEqual(_.sortBy(this.completedSpots), _.sortBy(completedSpots))) {
    //     this.completedSpots = completedSpots
    //   }
    // },
    onMenuItemActive(items) {
      const targetOpenedItems =
        this.mode === 'normal' ? this.openedItems : this.spearOpenedItems
      if (items.length === 0) {
        if (this.preActiveItem != null) {
          targetOpenedItems.splice(targetOpenedItems.indexOf(this.preActiveItem), 1)
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
        if (!targetOpenedItems.includes(this.activeItem)) {
          targetOpenedItems.push(this.activeItem)
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
      this.$refs.normalSpotMenu?.updateAll(true)
      this.$refs.spearSpotMenu?.updateAll(true)
    },
    collapseAll() {
      this.$refs.normalSpotMenu?.updateAll(false)
      this.$refs.spearSpotMenu?.updateAll(false)
    },
    assembleSpot(spotId) {
      if (this.mode === 'normal') {
        const spot = this.getFishingSpot(spotId)
        return {
          ...spot,
          name: DataUtil.getName(spot),
          zone: placeNames[spot.territoryId],
        }
      } else {
        const gatheringPoint = FIX.SPEAR_FISH_GATHERING_POINTS[spotId]
        // console.log('gp', spotId, {
        //   ...gatheringPoint,
        //   name: DataUtil.getName(gatheringPoint),
        // })
        return {
          ...gatheringPoint,
          name: DataUtil.getName(gatheringPoint),
          zone: placeNames[gatheringPoint.regionPlaceNameId],
        }
      }
    },
    ...mapMutations(['setFishCompleted', 'batchSetFishCompleted', 'showSnackbar']),
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
  height: calc(100vh - #{ $top-bars-padding + $footer-padding + 56 + 56})
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
