<template>
  <div>
    <v-expansion-panels hover flat tile v-model="lazyExpansionValue">
      <v-expansion-panel class="systemSecondary">
        <v-expansion-panel-header class="systemSecondary">
          <div style="display: flex; align-items: center; justify-content: center">
            <div v-if="multiple">
              <v-menu v-model="showSpotMenu" offset-x top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon text v-bind="attrs" v-on="on">
                    <v-icon>mdi-view-list</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="(spot, index) in fishingSpots"
                    :key="index"
                    @click.stop="currentSpotIndex = index"
                  >
                    <v-list-item-title class="d-flex align-center">
                      <link-list
                        :id="spot.fishingSpotId"
                        :angler-id="spot.fishingSpot.anglerLocationId"
                        :name="spot.fishingSpotName"
                        mode="spot"
                        :spot-mode="fish.type"
                        @click="showSpotMenu = false"
                        :disabled="showSpotLink"
                      >
                        <v-hover v-slot="{ hover }">
                          <div
                            :class="
                              `text-subtitle-1 ${
                                hover && !showSpotLink ? 'text-decoration-underline' : ''
                              }`
                            "
                          >
                            {{ spot.fishingSpotName }}
                          </div>
                        </v-hover>
                      </link-list>
                      <v-spacer />
                      <div class="ml-2 subtitle-2">{{ spot.zone }}</div>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <div
              class="text-subtitle-1"
              :title="currentSpot.fishingSpotName + '#' + currentSpot.fishingSpotId"
            >
              <link-list
                :id="currentSpot.fishingSpotId"
                :angler-id="currentSpot.fishingSpot.anglerLocationId"
                :name="currentSpot.fishingSpotName"
                mode="spot"
                :spot-mode="fish.type"
                :disabled="showSpotLink"
              >
                <v-hover v-slot="{ hover }">
                  <div
                    :class="
                      `text-subtitle-1 ${
                        hover && !showSpotLink
                          ? 'info--text text-decoration-underline'
                          : ''
                      }`
                    "
                  >
                    {{ currentSpot.fishingSpotName }}
                  </div>
                </v-hover>
              </link-list>
            </div>
            <div class="text-subtitle-2 ml-2">
              {{ currentSpot.zone }}
            </div>
            <div class="text-subtitle-1 ml-2">
              ({{ currentSpot.fishSpotPositionText }})
            </div>
            <click-helper @click.stop :copy-text="currentSpot.fishingSpotName">
              <v-btn class="my-2" text icon :title="$t('list.item.copyHint')">
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </click-helper>
            <click-helper
              @click.stop="
                goToFishingSpotAngelPage(
                  currentSpot.fishingSpot.anglerLocationId,
                  currentSpot.fishingSpotName
                )
              "
            >
              <v-btn class="my-2" text icon :title="$t('list.item.linkHint')">
                <v-icon>mdi-link-variant</v-icon>
              </v-btn>
            </click-helper>
          </div>
        </v-expansion-panel-header>
      </v-expansion-panel>
    </v-expansion-panels>
    <div
      v-if="lazyExpansionValue === 0"
      style="width: 100%; height: 512px"
      class="d-flex justify-center mt-4"
    >
      <div style="width: 100%; max-width: 512px">
        <eorzea-simple-map
          ref="simpleMap"
          :id="currentSpot.fishingSpot.mapFileId"
          :size-factor="currentSpot.fishingSpot.size_factor"
          :fishing-spots="fishingSpotsForMap"
          :show-fishing-range-helper="showFishingRangeHelper"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ClickHelper from '@/components/basic/ClickHelper'
import EorzeaSimpleMap from '@/components/basic/EorzeaSimpleMap'
import DataUtil from '@/utils/DataUtil'
import { mapGetters, mapMutations } from 'vuex'
import LinkList from '@/components/basic/LinkList'

export default {
  name: 'DetailItemMap',
  components: { LinkList, ClickHelper, EorzeaSimpleMap },
  props: {
    fish: {
      type: Object,
      default: undefined,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    showFishingRangeHelper: {
      type: Boolean,
      default: true,
    },
    showSpotLink: {
      type: Boolean,
      default: false,
    },
  },
  data: vm => ({
    currentSpotIndex: 0,
    lazyExpansionValue: vm.expanded ? 0 : undefined,
    showSpotMenu: false,
  }),
  computed: {
    fishingSpots() {
      return this.fish.fishingSpots
    },
    currentSpot() {
      // { zone, fishingSpot, fishingSpotName, fishingSpotId, fishSpotPositionText }
      return this.fishingSpots[this.currentSpotIndex]
    },
    fishingSpotsForMap() {
      return [{ ...this.currentSpot.fishingSpot, name: this.currentSpot.fishingSpotName }]
    },
    multiple() {
      return this.fishingSpots.length > 1
    },
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
    ...mapGetters(['getFishingSpot']),
  },
  created() {
    this.lazyExpansionValue = this.expanded ? 0 : undefined
  },
  watch: {
    expanded(expanded) {
      this.lazyExpansionValue = expanded ? 0 : undefined
    },
    'fish.id': function() {
      this.lazyExpansionValue = this.expanded ? 0 : undefined
      this.currentSpotIndex = 0
    },
  },
  methods: {
    goToFishingSpotAngelPage(anglerId, name) {
      DataUtil.goToFishingSpotAngelPage(
        anglerId,
        name,
        this.isMobile || this.showSpotLink,
        this.showSnackbar
      )
    },
    getName: DataUtil.getName,
    ...mapMutations(['showSnackbar']),
  },
}
</script>

<style scoped></style>
