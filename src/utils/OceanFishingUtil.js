const HOUR = 60 * 60 * 1000

// code to generate routeSeq
// -------------------------
// const placeSeq = [
//   0,1,0,1,0,1,0,1,0,1,0,1,
//   1,0,1,0,1,0,1,0,1,0,1,0
// ]
// const shiftSeq = [
//   0,0,1,1,2,2,0,0,1,1,2,2,
//   0,0,1,1,2,2,0,0,1,1,2,2,
//   1,1,2,2,0,0,1,1,2,2,0,0,
//   1,1,2,2,0,0,1,1,2,2,0,0,
//   2,2,0,0,1,1,2,2,0,0,1,1,
//   2,2,0,0,1,1,2,2,0,0,1,1,
// ]
// const routeSeq = shiftSeq.map((it, i) => (it << 1) + placeSeq[i%placeSeq.length])
// console.log(JSON.stringify(routeSeq))
// -------------------------

// const placeNames = ['m', 'l']
// const shiftNames = ['morning', 'noon', 'night']
// const index2Name = []
// for (let i = 0; i < 6; i++) {
//   index2Name.push(placeNames[i & 1]+'-'+shiftNames[i >> 1])
// }
// console.log(index2Name)
const ROUTE_TYPES = [0, 1, 2, 3, 4, 5]
// 梅早, 罗早, 梅午, 罗午, 梅晚, 罗晚
// const index2Name = ['m-morning', 'l-morning', 'm-noon', 'l-noon', 'm-night', 'l-night']
const routeSeq = [
  0,
  1,
  2,
  3,
  4,
  5,
  0,
  1,
  2,
  3,
  4,
  5,
  1,
  0,
  3,
  2,
  5,
  4,
  1,
  0,
  3,
  2,
  5,
  4,
  2,
  3,
  4,
  5,
  0,
  1,
  2,
  3,
  4,
  5,
  0,
  1,
  3,
  2,
  5,
  4,
  1,
  0,
  3,
  2,
  5,
  4,
  1,
  0,
  4,
  5,
  0,
  1,
  2,
  3,
  4,
  5,
  0,
  1,
  2,
  3,
  5,
  4,
  1,
  0,
  3,
  2,
  5,
  4,
  1,
  0,
  3,
  2,
]

function getRoutes(time, routeN, targets = ROUTE_TYPES) {
  const MAGIC_OFFSET = 64
  const routeOffset = Math.floor(Math.floor(time / HOUR) / 2)
  const startCheckPoint = time - (time % (2 * HOUR))
  const routes = []
  for (let i = 0; routes.length < routeN; i++) {
    const routeType = routeSeq[(routeOffset + MAGIC_OFFSET + i) % routeSeq.length]
    if (targets.includes(routeType)) {
      routes.push({
        time: startCheckPoint + i * 2 * HOUR,
        routeType: routeType,
      })
    }
  }
  return routes
}

// console.log(getRoutes(new Date('2020-12-03 00:00:00').getTime(), 25, [0, 1])) // .map((route) => index2Name[route.routeType])
// .join("\n"))

// 加拉迪翁湾外海(夜) - 梅尔托尔海峡南(日) - 罗塔诺海海面(夕)
// 梅尔托尔海峡南(夜) - 加拉迪翁湾外海(日) - 梅尔托尔海峡北(夕)
// 梅早, 罗早, 梅午, 罗午, 梅晚, 罗晚
// const ROUTE_NAMES = [
//   '梅尔托尔海峡北航线（早班）',
//   '罗塔诺海航线（早班）',
//   '梅尔托尔海峡北航线（午班）',
//   '罗塔诺海航线（午班）',
//   '梅尔托尔海峡北航线（晚班）',
//   '罗塔诺海航线（晚班）',
// ]

const PLACES = ['梅尔托尔海峡北', '罗塔诺海海面', '加拉迪翁湾外海', '梅尔托尔海峡南']

const SHIFTS = ['早', '午', '晚']

const ROUTE_LOCATIONS = [
  [3, 2, 0],
  [2, 3, 1],
]

const tips = {
  '4': {
    routeSimpleName: '梅晚',
    target: '海龙成就 + ※珊瑚蝠鲼',
    comment: '蝠鲼可以1区跳跳乐',
    routeDetail: '梅尔托尔海峡南(夜) - 加拉迪翁湾外海(日) - 梅尔托尔海峡北(夕)',
  },
  '5': {
    routeSimpleName: '罗晚',
    target: '※索蒂斯 + ※石骨鱼',
    comment: '索蒂斯可以1区跳跳乐，2区可以冲海龙成就',
    routeDetail: '加拉迪翁湾外海(夜) - 梅尔托尔海峡南(日) - 罗塔诺海海面(夕)',
  },
  '0': {
    routeSimpleName: '梅早',
    target: '章鱼成就',
    comment: '也比较适合冲分',
    routeDetail: '梅尔托尔海峡南(日) - 加拉迪翁湾外海(夕) - 梅尔托尔海峡北(夜)',
  },
  '1': {
    routeSimpleName: '罗早',
    target: '水母成就 + 冲分推荐',
    comment: '由于水母成就相对简单，更建议梅午1区跳跳乐',
    routeDetail: '加拉迪翁湾外海(日) - 梅尔托尔海峡南(夕) - 罗塔诺海海面(夜)',
  },
  '2': {
    routeSimpleName: '梅午',
    target: '※索蒂斯 + ※依拉丝莫龙',
    comment: '1区可以水母成就跳跳乐',
    routeDetail: '梅尔托尔海峡南(夕) - 加拉迪翁湾外海(夜) - 梅尔托尔海峡北(日)',
  },
  '3': {
    routeSimpleName: '罗午',
    target: '鲨鱼成就 + ※珊瑚蝠鲼',
    comment: '可以和鲨鱼队一起冲分',
    routeDetail: '加拉迪翁湾外海(夕) - 梅尔托尔海峡南(夜) - 罗塔诺海海面(日)',
  },
}

const ROUTE_TIPS = [
  // 梅早
  {
    achievements: [2562, 2563],
    comment: '最佳冲分航线，同时适合钓章鱼成就',
  },
  // 罗早
  {
    achievements: [2562, 2565],
    comment: '次佳冲分路线，同时适合钓水母成就',
  },
  // 梅午
  {
    achievements: [],
    comment: '航线上有两条蓝鱼，没起蓝鱼的话冲分有些困难',
  },
  // 罗午
  {
    achievements: [2562, 2564],
    comment: '还不错的冲分航线，同时适合钓鲨鱼成就',
  },
  // 梅晚
  {
    achievements: [2566],
    comment: '比较一般的航线，同时适合钓海马成就',
  },
  // 罗晚
  {
    achievements: [],
    comment: '航线上有两条蓝鱼，除非欧皇小队起3条蓝鱼否则冲分会很困难',
  },
]

// // place 4, shift 3
// for (let i = 0; i < 12; i++) {
//     console.log(i, PLACES[i % 4], SHIFTS[i >> 2])
// }

const ITEMS = {
  '29791': {
    _id: 29791,
    name_chs: '依拉丝莫龙',
    icon: 28012,
  },
  '29790': {
    _id: 29790,
    name_chs: '石骨鱼',
    icon: 28011,
  },
  '29788': {
    _id: 29788,
    name_chs: '索蒂斯',
    icon: 28009,
  },
  '29789': {
    _id: 29789,
    name_chs: '珊瑚蝠鲼',
    icon: 28010,
  },
}

const PLACE_TIPS = [
  // 0 梅尔托尔海峡北(早)
  {
    blueFish: 29791,
  },
  // 1 罗塔诺海海面(早)
  {
    blueFish: null,
  },
  // 2 加拉迪翁湾外海(早)
  {
    blueFish: null,
  },
  // 3 梅尔托尔海峡南(早)
  {
    blueFish: null,
  },
  // 4 梅尔托尔海峡北(午)
  {
    blueFish: null,
  },
  // 5 罗塔诺海海面(午)
  {
    blueFish: 29790,
  },
  // 6 加拉迪翁湾外海(午)
  {
    blueFish: null,
  },
  // 7 梅尔托尔海峡南(午)
  {
    blueFish: null,
  },
  // 8 梅尔托尔海峡北(晚)
  {
    blueFish: null,
  },
  // 9 罗塔诺海海面(晚)
  {
    blueFish: null,
  },
  // 10 加拉迪翁湾外海(晚)
  {
    blueFish: 29788,
  },
  // 11 梅尔托尔海峡南(晚)
  {
    blueFish: 29789,
  },
]

// shift * 2 + place
function routeToShift(route) {
  return route >> 1
}

function routeToPlace(route) {
  return route % 2
}

function placeTipIndexOf(place, time) {
  return (time << 2) + place
}

function routesWithTipOf(time = Date.now(), routeN = 13, targets = ROUTE_TYPES) {
  return getRoutes(time, routeN, targets).map(route => {
    const routeType = route.routeType
    const locations = ROUTE_LOCATIONS[routeToPlace(routeType)]
    let shiftStart = routeToShift(routeType)
    const locationTips = locations.map((placeIndex, i) => {
      const shiftIndex = (shiftStart + i) % 3
      return {
        locationName: PLACES[placeIndex] + '(' + SHIFTS[shiftIndex] + ')',
        blueFish: PLACE_TIPS[placeTipIndexOf(placeIndex, shiftIndex)].blueFish,
      }
    })
    return {
      ...route,
      ...tips[route.routeType],
      routeTip: ROUTE_TIPS[routeType],
      locationTips,
      shift: {
        type: shiftStart,
        name: PLACES[locations[2]],
      },
    }
  })
}

// console.log(
//   JSON.stringify(toTips(new Date('2020-12-03 00:00:00').getTime(), 13), null, 2)
// )

//https://ngabbs.com/read.php?tid=20553241

// export default {
//   routesWithTipOf,
// }

// module.exports = routesWithTipOf

function simpleTipsOf(time = Date.now(), routeN = 13, targets = ROUTE_TYPES) {
  return routesWithTipOf(time, routeN, targets).map(tip => {
    return {
      time: new Intl.DateTimeFormat('zh-Hans-CN', {
        formatMatcher: 'basic',
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(tip.time)),
      name: tip.routeSimpleName,
      blueFish: tip.locationTips
        .map(it => ITEMS[it.blueFish])
        .filter(it => it)
        .map(it => it.name_chs)
        .join('，'),
      achievements: tip.routeTip.comment,
    }
  })
}

// console.log(simpleOutput())

export default {
  routesWithTipOf,
  simpleTipsOf,
}