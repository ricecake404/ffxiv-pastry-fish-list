<template>
  <div style="width: 100%;" @click="onFishClicked()">
    <v-hover v-slot="{ hover }" open-delay="200" close-deplay="500">
      <div style="position: relative">
        <v-divider
          v-if="inPredator"
          class="ml-9"
          style="margin-top: -2px; margin-bottom: 2px; border-color: grey"
        />
        <v-row
          no-gutters
          class="d-flex justify-center align-content-center"
          style="width: 100%"
        >
          <v-col :class="fishColClass">
            <div
              class="d-flex fill-height align-center flex-row px-1"
              style="min-height: 48px"
            >
              <!-- hide pin & complete button for predators in list view -->
              <div
                class="d-flex align-center"
                :style="{
                  visibility: inPredator ? 'hidden' : 'visible',
                  'flex-direction': 'column',
                }"
              >
                <toggle-button
                  :value="transformedFishPart.pinned"
                  @input="setPinned($event)"
                  checked-icon="mdi-pin"
                  unchecked-icon="mdi-pin-outline"
                />
                <toggle-button
                  :value="transformedFishPart.completed"
                  @input="setCompleted($event)"
                />
              </div>

              <!-- show small icon with required count for predators -->
              <v-badge
                v-if="inPredator"
                :content="fish.requiredCnt"
                color="predatorCnt black--text"
                overlap
                bottom
                bordered
              >
                <item-icon
                  :icon-class="fish.icon"
                  small
                  style="min-width: 30px"
                  :hat="fish.showHatCover"
                />
              </v-badge>
              <!-- or show normal icon for fish -->
              <item-icon
                v-else
                :icon-class="fish.icon"
                style="min-width: 40px"
                :hat="fish.showHatCover"
              />

              <div :class="inPredator ? 'ml-4' : 'ml-1'">
                <div class="text-subtitle-1" :title="fish.name + '#' + fish.id">
                  {{ fish.name }}
                </div>
                <div class="d-flex align-center">
                  <v-badge
                    inline
                    bordered
                    :color="fish.isFuturePatch ? 'grey' : 'primary'"
                    :content="fish.patch"
                    :title="fish.isFuturePatch ? '未实装' : ''"
                    class="mr-1"
                  ></v-badge>
                  <div
                    v-if="fish.folklore"
                    :data-ck-item-id="
                      toItemIdIfExisted(fish.folklore.itemId, fish.folklore.name)
                    "
                    class="mr-2"
                  >
                    <v-icon small :title="fish.folklore.name"
                      >mdi-book-open-variant</v-icon
                    >
                  </div>
                  <div v-if="fish.collectable">
                    <i class="xiv collectables" title="收藏品" />
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          <v-col :class="`${countDownColClass} d-flex flex-column justify-center`">
            <!--  1st: end / start count down  -->
            <div class="text-subtitle-1 d-flex">
              <div>
                <v-tooltip right color="secondary">
                  <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on">
                      {{
                        $t(transformedFishTimePart.countDownType, {
                          interval: transformedFishTimePart.countDownTimeText,
                        })
                      }}
                    </div>
                  </template>
                  <div class="d-flex flex-column">
                    <div>{{ transformedFishTimePart.countDownTimePointText }}</div>
                  </div>
                </v-tooltip>
              </div>
              <div
                v-if="fish.addBuffSuffix && transformedFishTimePart.isFishing"
                :title="$t('list.item.countDown.fishShadowHint')"
                :class="fish.predatorsIcon"
                style="margin-left: 2px"
              />
            </div>
            <!--  2nd: next count down / interval & fishing window rate -->
            <div v-if="transformedFishTimePart.hasCountDown" class="d-flex align-center">
              <div>
                <v-tooltip
                  v-if="transformedFishTimePart.isFishing"
                  right
                  color="secondary"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <div
                      v-bind="attrs"
                      v-on="on"
                      class="text-subtitle-2"
                      style="padding-top: 3px"
                    >
                      {{ transformedFishTimePart.countDownNextInterval }}
                    </div>
                  </template>
                  <span>{{ transformedFishTimePart.countDownNextTimePointText }}</span>
                </v-tooltip>
              </div>
              <div v-if="transformedFishTimePart.isWaiting">
                <div class="text-subtitle-2" style="padding-top: 3px">
                  {{ transformedFishTimePart.countDownTotalHint }}
                </div>
              </div>
              <v-btn
                small
                v-if="fish.rate < 1 && !showFishPageRightPane"
                text
                class="pl-2 pr-1"
                @click.stop="onFishClicked(['DetailItemFishWindowTable'])"
              >
                {{ fish.rateText }}
              </v-btn>
            </div>
            <div v-if="fish.rate < 1 && showFishPageRightPane">
              <v-btn
                small
                text
                style="padding: 0 1px;"
                @click.stop="onFishClicked(['DetailItemFishWindowTable'])"
              >
                {{ fish.rateText }}
              </v-btn>
            </div>
          </v-col>
          <v-col :class="`${locationColClass} d-flex flex-column justify-center`">
            <fishing-spot-column
              v-if="!inPredator && !hideSpotColumn"
              :fishing-spots="fish.fishingSpots"
              @click="onFishClicked(['DetailItemMap'])"
            />
          </v-col>
          <v-col
            :class="
              `${timeAndWeatherColClass} d-flex flex-column justify-center align-center`
            "
          >
            <div v-if="fish.hasTimeConstraint">
              {{ fish.startHourText }} - {{ fish.endHourText }}
            </div>
            <div class="d-flex" v-if="fish.hasWeatherConstraint">
              <div style="display: flex">
                <div
                  v-for="(weather, index) in fish.previousWeatherSetDetail"
                  :key="index"
                  class="zoom-in-predator"
                >
                  <div :class="weather.icon" :title="weather.name" />
                </div>
                <v-icon v-if="fish.previousWeatherSet.length > 0" small>
                  mdi-arrow-right
                </v-icon>
                <div
                  v-for="weather in fish.weatherSetDetail"
                  :key="weather.name"
                  class="zoom-in-predator"
                >
                  <div :class="weather.icon" :title="weather.name" />
                </div>
              </div>
            </div>
            <div v-if="!fish.hasTimeConstraint && !fish.hasWeatherConstraint">
              {{ $t('list.item.noConstraint') }}
            </div>
          </v-col>
          <v-col
            :class="`${buffAndBaitColClass} d-flex flex-row align-center justify-center`"
          >
            <div
              v-if="fish.hasFishEyes || fish.hasPredators || fish.hasSnagging"
              class="mr-1"
            >
              <div
                v-if="fish.hasFishEyes"
                style="display: flex; align-items: center"
                data-ck-action-name="鱼眼"
              >
                <div :class="fish.fishEyesIcon" />
                <div class="ml-1">{{ fish.fishEyesText }}</div>
              </div>
              <div v-if="fish.hasPredators">
                <div :class="fish.predatorsIcon" />
              </div>
              <div v-if="fish.hasSnagging">
                <div :class="fish.snaggingIcon" data-ck-action-name="钓组" />
              </div>
            </div>
            <div v-if="fish.type === 'spear'" class="d-flex align-center">
              <item-icon :icon-class="fish.gigIcon" :title="fish.gigText" />
              <div>{{ fish.gigText }}</div>
            </div>
            <div v-else class="d-flex">
              <div class="d-flex align-center">
                <i
                  class="xiv square-a"
                  v-if="fish.baitsExtra.length > 0"
                  title="一种可能情况A"
                />
                <fish-bait-list :baits="fish.baits" />
              </div>
              <template v-if="fish.baitsExtra.length > 0">
                <div class="d-flex align-center">
                  <i class="xiv square-b" title="另一种可能情况B" />
                  <fish-bait-list :baits="fish.baitsExtra" />
                </div>
              </template>
            </div>
          </v-col>
        </v-row>
        <v-expand-transition>
          <div
            v-if="hover"
            style="position: absolute; height: 28px; z-index: 9999; width: 100%"
            class="d-flex align-center primary rounded-b-lg elevation-2"
          >
            <v-row no-gutters>
              <v-col :class="fishColClass">
                <!-- bottom actions line -->
                <div class="d-flex flex-wrap pl-10">
                  <!--                  &lt;!&ndash; completed &ndash;&gt;-->
                  <!--                  <toggle-button-->
                  <!--                    :value="transformedFishPart.completed"-->
                  <!--                    @input="setCompleted($event)"-->
                  <!--                    small-->
                  <!--                  />-->
                  <!--                  &lt;!&ndash; pin &ndash;&gt;-->
                  <!--                  <toggle-button-->
                  <!--                    :value="transformedFishPart.pinned"-->
                  <!--                    @input="setPinned($event)"-->
                  <!--                    checked-icon="mdi-pin"-->
                  <!--                    unchecked-icon="mdi-pin-outline"-->
                  <!--                    small-->
                  <!--                  />-->
                  <!-- copy name -->
                  <click-helper @click.stop :copy-text="fish.name">
                    <v-btn text icon small :title="$t('list.item.copyHint')">
                      <v-icon small>mdi-content-copy</v-icon>
                    </v-btn>
                  </click-helper>
                  <!-- alarm -->
                  <toggle-button
                    v-if="transformedFishTimePart.hasCountDown"
                    :value="transformedFishPart.toBeNotified"
                    :title="transformedFishPart.notificationHint"
                    @input="setToBeNotified($event)"
                    checked-icon="mdi-bell"
                    unchecked-icon="mdi-bell-outline"
                    small
                  />
                  <!-- fish tips link -->
                  <click-helper
                    v-if="fish.hasTips"
                    @click.stop="onFishClicked(['DetailItemTips'])"
                  >
                    <v-btn text icon small :title="$t('list.item.tipHint')">
                      <v-icon small>mdi-book</v-icon>
                    </v-btn>
                  </click-helper>
                  <!-- fish angel link -->
                  <click-helper @click.stop="goToFishAngelPage(fish.anglerFishId)">
                    <v-btn text icon small :title="$t('list.item.linkHint')">
                      <v-icon small>mdi-link-variant</v-icon>
                    </v-btn>
                  </click-helper>
                </div>
              </v-col>
              <v-col :class="countDownColClass">
                <div v-if="fish.rate < 1">
                  <v-btn
                    text
                    icon
                    small
                    style="padding: 0 1px;"
                    @click.stop="onFishClicked(['DetailItemFishWindowTable'])"
                  >
                    <v-icon small>
                      mdi-calendar
                    </v-icon>
                  </v-btn>
                </div>
              </v-col>
              <v-col :class="locationColClass">
                <div v-if="!inPredator && !hideSpotColumn" class="d-flex">
                  <v-btn text small icon @click.stop="onFishClicked(['DetailItemMap'])">
                    <v-icon small>
                      mdi-map
                    </v-icon>
                  </v-btn>
                  <click-helper @click.stop :copy-text="fishingSpotName">
                    <v-btn text icon small :title="$t('list.item.copyHint')">
                      <v-icon small>mdi-content-copy</v-icon>
                    </v-btn>
                  </click-helper>
                  <v-btn
                    text
                    small
                    icon
                    :title="$t('list.item.linkHint')"
                    @click.stop="goToFishingSpotAngelPage"
                  >
                    <v-icon small>mdi-link-variant</v-icon>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </div>
    </v-hover>
  </div>
</template>

<script>
import ToggleButton from '@/components/basic/ToggleButton'
import FishBaitList from '@/components/FishBaitList'
import FishingSpotColumn from '@/components/FishingSpotColumn'
import ItemIcon from '@/components/basic/ItemIcon'
import fishInfoRowMixin from '@/components/FishInfoRow/FishInfoRowMixin'
import ClickHelper from '@/components/basic/ClickHelper'

export default {
  name: 'FishInfoRowLarge',
  components: { ClickHelper, ItemIcon, FishingSpotColumn, FishBaitList, ToggleButton },
  mixins: [fishInfoRowMixin],
  computed: {
    fishColClass() {
      return this.hideSpotColumn
        ? 'col-3'
        : this.showFishPageRightPane
        ? 'col-3'
        : 'col-2'
    },
    countDownColClass() {
      return this.hideSpotColumn
        ? 'col-3'
        : this.showFishPageRightPane
        ? 'col-2'
        : 'col-3'
    },
    locationColClass() {
      return this.hideSpotColumn ? 'col-0' : 'col-2'
    },
    timeAndWeatherColClass() {
      return this.hideSpotColumn ? 'col-2' : 'col-2'
    },
    buffAndBaitColClass() {
      return this.hideSpotColumn ? 'col-4' : 'col-3'
    },
    fishingSpotName() {
      return this.fish.fishingSpots[0].fishingSpotName
    },
  },
}
</script>

<style scoped>
.zoom-in-predator {
  zoom: 0.75;
  -moz-transform: scale(0.75);
  -moz-transform-origin: 50% 50%;
}
</style>
