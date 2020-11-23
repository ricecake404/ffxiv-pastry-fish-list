import fisher from '@/assets/fisher.png'
import DataUtil from '@/utils/DataUtil'
import { mapGetters, mapMutations } from 'vuex'

export default {
  props: {
    fish: {
      type: Object,
      default: () => ({}),
    },
    fishTimePart: {
      type: Object,
      default: undefined,
    },
    predators: {
      type: Array,
      default: () => [],
    },
    inPredator: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '',
    },
    showDivider: {
      type: Boolean,
      default: false,
    },
    // HEADER or CONTENT
    mode: {
      type: String,
      default: 'CONTENT',
    },
    showConstraintsInstead: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    fisher: fisher,
    rootPath: process.env.ASSET_PATH,
  }),
  computed: {
    transformedFishPart() {
      return {
        completed: this.getFishCompleted(this.fish.id),
        pinned: this.getFishPinned(this.fish.id),
        toBeNotified: this.getFishToBeNotified(this.fish.id),
      }
    },
    transformedFishTimePart() {
      const fishTimePart = this.fishTimePart ?? { id: this.fish.id, countDown: { type: DataUtil.ALL_AVAILABLE } }
      return {
        countDownType: DataUtil.getCountDownTypeName(fishTimePart.countDown?.type),
        countDownTime: fishTimePart.countDown?.time,
        countDownTimeText: this.printCountDownTime(fishTimePart.countDown?.time),
        countDownTimePoint: fishTimePart.countDown?.timePoint,
        countDownTimePointText: this.$t('countDown.timePointHint', {
          timePoint: DataUtil.formatDateTime(fishTimePart.countDown?.timePoint),
        }),
        countDownTotal: this.printCountDownTime(fishTimePart.countDown?.fishWindowTotal, 1, false),
        countDownTotalHint: this.$t('countDown.intervalHint', {
          interval: this.printCountDownTime(fishTimePart.countDown?.fishWindowTotal, 2),
        }),
        countDownNextInterval: this.$t('countDown.nextInterval', {
          nextInterval: this.printCountDownTime(fishTimePart.countDown?.nextInterval, 1, false),
        }),
        countDownNextTimePointText: this.$t('countDown.timePointHint', {
          timePoint: DataUtil.formatDateTime(fishTimePart.countDown?.nextTimePoint),
        }),
        hasCountDown: DataUtil.hasCountDown(fishTimePart.countDown),
        isWaiting: fishTimePart.countDown?.type === DataUtil.WAITING,
        isFishing: fishTimePart.countDown?.type === DataUtil.FISHING,
      }
    },
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
    ...mapGetters([
      'getWeather',
      'getItemIconClass',
      'getItemName',
      'getZoneName',
      'getFishingSpotsName',
      'getBaits',
      'getFishCompleted',
      'getFishPinned',
      'getFishToBeNotified',
    ]),
  },
  methods: {
    printCountDownTime: DataUtil.printCountDownTime,
    goToFishAngelPage(anglerFishId) {
      window.open(`https://cn.ff14angler.com/fish/${anglerFishId}`)
    },
    setCompleted(completed) {
      this.setFishCompleted({ fishId: this.fish.id, completed })
    },

    setPinned(pinned) {
      this.setFishPinned({ fishId: this.fish.id, pinned })
    },

    setToBeNotified(toBeNotified) {
      this.setFishToBeNotified({ fishId: this.fish.id, toBeNotified })
    },
    ...mapMutations(['setFishCompleted', 'setFishPinned', 'setFishToBeNotified']),
  },
}