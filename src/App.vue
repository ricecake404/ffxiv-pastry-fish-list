<template>
  <v-app :style="`opacity: ${opacity}`" :class="{ 'min-page': collapse }">
    <v-app-bar
      height="56px"
      app
      :collapse="collapse"
      :class="{
        'fish-app-bar': true,
        'rounded-pill': collapse,
        'fish-app-bar--collapsed': collapse,
      }"
      dense
      color="system"
    >
      <v-app-bar-nav-icon v-if="isMobile && !collapse" @click.stop="showNavi">
        <v-img v-if="!isMobile" :src="fisher" height="42" width="42" />
      </v-app-bar-nav-icon>
      <click-helper
        @click="onFishIconClicked"
        :style="`margin-left: ${collapse || isMobile ? 0 : -12}px`"
      >
        <v-tooltip bottom z-index="10">
          <template v-slot:activator="{ on, attrs }">
            <div class="d-flex">
              <v-avatar size="36" v-bind="attrs" v-on="on">
                <img :src="fisher" />
              </v-avatar>
              <div class="d-flex flex-column" v-if="collapse">
                <v-chip
                  v-for="(notification, index) in listFishCntForMini"
                  :key="index"
                  x-small
                  color="transparent"
                  @click="setActiveTabLater(index)"
                >
                  <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                      <click-helper v-on="on" v-bind="attrs">
                        <div>
                          <v-icon left small disabled>
                            {{ TABS[index].icon }}
                          </v-icon>
                          {{ notification.cnt }}
                        </div>
                      </click-helper>
                    </template>
                    <span>{{ $t(TABS[index].title) }}</span>
                  </v-tooltip>
                </v-chip>
              </div>
            </div>
          </template>
          <span>{{ $t('top.collapseHint') }}</span>
        </v-tooltip>
      </click-helper>
      <v-toolbar-title
        v-if="!isMobile"
        style="min-width: 145px !important"
        class="ml-1"
        :title="$t('top.navBarTitle', { title, version })"
      >
        {{ $t('top.navBarTitle', { title, version }) }}
      </v-toolbar-title>
      <template v-if="!collapse">
        <v-spacer />
        <v-tabs
          v-if="isListPage && !isMobile"
          :value="activeTabIndex"
          @change="setActiveTab"
          center-active
          show-arrows
          centered
        >
          <v-tab
            v-for="(notification, index) in listFishCnt"
            :key="index"
            :class="{ 'primary--text': activeTabIndex === index }"
          >
            <v-badge
              color="error"
              :value="notification.cnt"
              :content="notification.cnt"
              style="z-index: 10"
            >
              <div class="d-flex">
                <v-icon
                  left
                  small
                  :color="activeTabIndex === index ? 'primary-text' : ''"
                >
                  {{ TABS[index].icon }}
                </v-icon>
                <div v-if="!isMobile" style="font-size: 16px">
                  {{ $t(TABS[index].title) }}
                </div>
              </div>
            </v-badge>
          </v-tab>
        </v-tabs>
        <div v-if="inStartLight">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                <v-switch
                  v-model="showHatCover"
                  inset
                  class="theme-switch"
                  color="pink darken-3"
                />
              </div>
            </template>
            <div>
              点击切换星芒节天气模式<br />
              在星芒节期间，三大主城以及四个住宅区的天气固定为小雪。<br />
              此开关开启时，将会以星芒节的小雪作为窗口期天气计算的条件。<br />
              关闭时，以地图区域的默认天气转换进行计算。
            </div>
          </v-tooltip>
        </div>

        <v-btn icon v-if="isListPage" @click="toggleFilterPanel">
          <v-icon>mdi-filter</v-icon>
        </v-btn>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <click-helper @click="setShowSearchDialog(true)">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </click-helper>
          </template>
          <span>按<kbd>/</kbd>键直接搜索</span>
        </v-tooltip>

        <div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                <v-switch v-model="dark" inset class="theme-switch" />
              </div>
            </template>
            <div>点击切换浅色/深色模式</div>
          </v-tooltip>
        </div>

        <div v-if="!isMobile" class="d-flex flex-column ml-1">
          <div><i class="xiv local-time-chs mr-1"></i>{{ earthTime }}</div>
          <div><i class="xiv eorzea-time-chs mr-1"></i>{{ eorzeaTime }}</div>
        </div>
      </template>
    </v-app-bar>

    <v-main>
      <v-navigation-drawer
        v-if="!collapse"
        v-model="drawer"
        :mini-variant.sync="mini"
        bottom
        :absolute="!isMobile"
        :fixed="isMobile"
        color="system"
        :expand-on-hover="!isMobile"
        style="z-index: 10"
      >
        <v-list dense>
          <v-list-item
            v-for="(notification, index) in listFishCnt"
            :key="index"
            @click="toPageSubList(index)"
          >
            <v-list-item-icon>
              <v-badge
                color="error"
                :value="notification.cnt"
                :content="notification.cnt"
                style="z-index: 10"
                overlap
              >
                <v-icon>
                  {{ TABS[index].icon }}
                </v-icon>
              </v-badge>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t(TABS[index].title) }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="toPage('WikiPage')" link>
            <v-list-item-icon>
              <v-icon>mdi-notebook</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t('top.fishWiki') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="toPage('OceanFishingPage')" link>
            <v-list-item-icon>
              <v-icon>mdi-ferry</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t('top.oceanFishing') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="toPage('DiademPage')" link>
            <v-list-item-icon>
              <v-img
                :src="dark ? diademDark : diademLight"
                height="24"
                width="24"
              ></v-img>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t('top.diadem') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <template v-slot:append>
          <v-list nav dense>
            <v-spacer />
            <v-divider />
            <v-list-group prepend-icon="mdi-cog" active-class="white--text">
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>{{ $t('top.setting') }}</v-list-item-title>
                </v-list-item-content>
              </template>
              <!--        <v-list-item-group active-class="primary--text">-->

              <click-helper @click="setShowImportExportDialog(true)">
                <v-list-item @click="noOp">
                  <v-list-item-icon>
                    <v-icon>mdi-database</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ $t('top.menu') }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </click-helper>
              <click-helper @click="showSettingDialog = true">
                <v-list-item @click="noOp">
                  <v-list-item-icon>
                    <v-icon>mdi-tune</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ $t('top.uiConfig') }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </click-helper>
              <click-helper @click="showHelpDialog = true">
                <v-list-item @click="noOp">
                  <v-list-item-icon>
                    <v-icon>mdi-help-circle</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ $t('top.help') }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </click-helper>
              <click-helper @click="showPatchNoteDialog = true">
                <v-list-item @click="noOp">
                  <v-list-item-icon>
                    <v-icon>mdi-tag</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ $t('top.patchNote') }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </click-helper>
              <click-helper @click="showAboutDialog = true">
                <v-list-item @click="noOp">
                  <v-list-item-icon>
                    <v-icon>mdi-information</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ $t('top.about') }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </click-helper>
              <!--        </v-list-item-group>-->
            </v-list-group>
          </v-list>
        </template>
      </v-navigation-drawer>
      <div
        :class="{ 'py-0': true, 'ml-14': !isMobile }"
        style="height: 100%"
        v-show="!collapse"
      >
        <v-overlay :value="loading || showJumpingOverlay" opacity="0.9" z-index="9999">
          <div class="d-flex flex-column align-center">
            <v-progress-circular indeterminate size="64" />
            <div>{{ $t('list.loading') }}</div>
          </div>
        </v-overlay>
        <router-view
          :now="now"
          :lazyFishSourceList="lazyFishSourceList"
          :lazyTransformedFishList="lazyTransformedFishList"
          :lazyTransformedFishDict="lazyTransformedFishDict"
          :fishListTimePart="fishListTimePart"
          :extraFishListTimePart="extraFishListTimePart"
          :fishListWeatherChangePart="fishListWeatherChangePart"
          :pinnedFishList="pinnedFishList"
          :sortedFilteredFishList="sortedFilteredFishList"
          :toBeNotifiedFishList="toBeNotifiedFishList"
          :selectedFish="selectedFish"
          @fish-selected="selectedFishId = $event"
        />
        <!--                @fishCntUpdated="listFishCnt = $event"     -->
      </div>
      <!--      <v-container class="py-0" v-if="!collapse">-->
      <!--        <v-row>-->
      <!--          <v-col class="d-flex flex-row justify-end">-->
      <!--            <span>FINAL FANTASY XIV © 2010 - 2020 SQUARE ENIX CO., LTD. All Rights Reserved.</span>-->
      <!--          </v-col>-->
      <!--        </v-row>-->
      <!--      </v-container>-->
    </v-main>

    <fish-search
      v-model="showSearch"
      :fish-data="lazyFishSourceList"
      :fish-dict="lazyTransformedFishDict"
      :fish-list-time-part="fishListTimePart"
      :extraFishListTimePart="extraFishListTimePart"
      :fish-list-weather-change-part="fishListWeatherChangePart"
      :now="now"
      @change="searchedFishId = $event"
    />

    <v-footer app style="font-size: small; max-height: 31px" v-if="!collapse">
      <div class="d-flex" style="width: 100%">
        <div class="text-truncate mr-2" :title="$t('footer.contact')">
          {{ $t('footer.contact') }}
        </div>
        <v-spacer />
        <div class="text-truncate" :title="$t('footer.ffRights')">
          {{ $t('footer.ffRights') }}
        </div>
      </div>
      <div class="resize-indicator" />
    </v-footer>

    <fish-setting-dialog v-model="showSettingDialog" />

    <v-dialog
      :value="showPatchNoteDialog && !inMigrationPage"
      max-width="600px"
      scrollable
    >
      <v-card>
        <v-card-title>
          {{ $t('top.patchNote') }}
        </v-card-title>
        <v-divider />
        <v-card-text style="max-height: 600px;">
          <div class="text-h6">Version 0.5.1</div>
          <ul>
            <li>
              固定列表鱼默认列表合并，显示在同一页面中。
            </li>
            <li>
              列表中增加传承录，收藏品信息。
            </li>
            <li>
              修正多条鱼数据。
            </li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.5.0</div>
          <div>
            <div class="text-h5 text-center">
              新增出海垂钓攻略支持
            </div>
            <div class="text-h6 text-center">
              钓鱼图鉴也已同步更新
            </div>
            <div>
              页面中攻略与资料参考：
              <div class="d-flex align-center">
                <div class="text-subtitle-1">
                  <a :href="oceanFishTipReference.link" target="_blank">
                    {{ oceanFishTipReference.title }}
                  </a>
                </div>
                <v-spacer />
                <div>
                  {{ oceanFishTipReference.author }}
                </div>
              </div>
              <p />
              <div></div>
            </div>
          </div>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.4.3</div>
          <div>
            <div class="text-h5 text-center">
              新增云冠群岛支持
            </div>
            <div class="text-h6 text-center">
              包括第二期以及即将更新的第三期重建
            </div>
            <div>
              页面中攻略与资料参考：
              <div class="text-subtitle-1">
                <a :href="diademTips[0].reference.link" target="_blank">
                  {{ diademTips[0].reference.title }}
                </a>
              </div>
              <div class="text-subtitle-1">
                <a :href="diademTips[1].reference.link" target="_blank">
                  {{ diademTips[1].reference.title }}
                </a>
              </div>
              <div>
                {{ diademTips[0].reference.author }}
              </div>
              <p />
              <div>
                <div class="d-flex justify-center">
                  <div>
                    <v-img
                      :src="dark ? diademDark : diademLight"
                      height="24"
                      width="24"
                    />
                  </div>
                </div>
                感谢
                <span style="font-weight: bold">煋月丶幻神@琥珀原</span>
                友情绘制的云冠群岛图标！
              </div>
            </div>
          </div>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.4.2</div>
          <div>
            <div class="text-h5 text-center">
              星芒节快乐！
            </div>
            <div>
              在星芒节期间，三大主城以及四个住宅区的天气变为了
              <span style="font-weight: bold">小雪</span>。<br />
              根据饿猫的招雨王的小雪上钩记录，<br />
              以及游戏内天气预报员处天气也显示为小雪为前提，<br />
              有理由相信，实际游戏判断的天气为小雪。因此对相应天气鱼的时间进行了修正。<br />
              <em>*星芒节时段外的窗口期计算没有改变</em><br />
              当然，也可以通过右上角的红色切换按钮切换成普通模式。<br />
              <em>*此模式将依旧按照原先的天气算法计算窗口期</em><br />
              <p />
              受影响鱼：<br />
              星芒节期间全勤奖普通鱼：求雨鱼<br />
              星芒节期间窗口期变长：招雨王<br />
              星芒节期间无窗口期：倔强鲫鱼、抽须王、枪鼻头、芳香蝾螈
              (<s>我们放寒假了~</s>）
            </div>
          </div>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.4.1</div>
          <ul>
            <li>
              更新列表中所有按钮的位置，增加操作栏，所有按钮移动至操作栏中。
            </li>
            <li>
              列表中增加版本号，未实装的鱼的版本底色为灰色。
            </li>
            <li>
              修正多条鱼数据。
            </li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.4.0</div>
          <ul>
            <li>
              增加海钓时间表。点击左侧图标
              <v-icon small>mdi-ferry</v-icon>
              即可查看。
              <div>之后会增加更多海钓相关功能，敬请期待~</div>
            </li>
            <li>
              修正多条鱼数据。
            </li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.3.2</div>
          <ul>
            <li>
              增加攻略支持：（感谢攻略作者的授权与支持！）
              <div>
                在详情界面或直接点击
                <v-icon small>mdi-book</v-icon>
                按钮即可查看。
              </div>
              <ul>
                <li>
                  <a
                    class="text-subtitle-1"
                    href="https://ngabbs.com/read.php?tid=18484723"
                    target="_blank"
                  >
                    [烟波钓徒]红莲之狂潮&苍穹之禁城 钓场之皇捕获指南
                  </a>
                  <div>月咏泠音@摩杜纳</div>
                </li>
                <li>
                  <a
                    class="text-subtitle-1"
                    href="https://ngabbs.com/read.php?tid=23672580"
                    target="_blank"
                  >
                    [烟波钓徒][我本烟波一钓徒][5.x]烟波204鱼王心得攻略
                  </a>
                  <div>谈清若风柔@神拳痕</div>
                </li>
              </ul>
            </li>
            <li>
              修正多条鱼数据。
            </li>
            <li>
              修正界面问题。
            </li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.3.1</div>
          <ul>
            <li>
              界面颜色调整：
              <ul>
                <li>
                  窗口期中的颜色从
                  <v-chip small color="#572746"></v-chip>
                  调整为
                  <v-chip small color="#183027"></v-chip>
                </li>
                <li>
                  已完成的颜色从
                  <v-chip small color="#214040"></v-chip>
                  调整为
                  <v-chip small color="#0c2242"></v-chip>
                </li>
              </ul>
            </li>
            <li>增加浅色模式，点击右上角开关切换。</li>
            <li>
              更新
              <v-chip x-small>5.3</v-chip>
              和
              <v-chip x-small>5.35</v-chip>
              数据。
              <div class="error--text text-h6">
                为了便于查看，5.3以及5.35的普通鱼仍会显示在默认列表中。
                之前版本没有任何时间天气限制的普通鱼请在图鉴中查找或直接搜索。
              </div>
            </li>
            <li>
              更新官方攻略本数据（涵盖4.2前数据）。
              <ul>
                <li>
                  <a
                    href="https://store.jp.square-enix.com/item/9784757556898.html"
                    target="_blank"
                  >
                    FINAL FANTASY XIV Crafter and Gatherer Official Guide
                  </a>
                </li>
              </ul>
            </li>
            <li>
              界面各部分都有所调整。
            </li>
            <li>修复部分鱼的窗口期计算的错误。</li>
            <li>修复部分鱼倒计时没有及时更新的错误。</li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.3.0</div>
          <ul>
            <li>增加图鉴功能。</li>
            <li>
              增加系统提示支持。
              <ul>
                <li>需要在浏览器授权，地址栏弹框时选择“允许”。</li>
                <li>在Windows10系统中的“设置-通知和操作”中授权。</li>
                <li>系统管理员会有一系列问题，请使用普通用户。</li>
                <li>请关闭Windows的“专注助手”，以正常跳出通知。</li>
              </ul>
            </li>
            <li>增加窗口期列表的加载更多功能。</li>
            <li>增加按窗口期稀有度排序的功能。</li>
            <li>增加按键 ' / ' 可以直接搜索，以及打开搜索界面自动开始搜索输入的功能。</li>
            <li>增加部分钓鱼技能的悬浮提示。</li>
            <li>
              更新界面，由于增加了新的图鉴界面，所以原先右上角设置类的功能与新的页面切换一起整合至左侧侧边栏中。
            </li>
            <li>
              更新地图范围提示完成。感谢
              <span class="font-weight-bold">轩辕十四@沃仙曦染</span> 的大力支持。
            </li>
            <li>
              更新地图控件，现在可以点击“锁”图标自由拖动放大地图，以及切换显示文本以及钓场提示。
            </li>
            <li>
              更新时间文本，增加“今天”，“明天”，“周一”等的文本。
            </li>
            <li>
              更新列表中的前置鱼，隐去了“固定”和“完成”的勾选按钮，详细界面中不变。
            </li>
            <li>
              更新详细界面的倒计时，现在会显示2个时间单位，如“10分09秒”。
            </li>
            <li>
              更新图标。
            </li>
            <li>
              修复“复制道具名”按钮。
            </li>
            <li>
              修复详细页面的前置鱼图标。
            </li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.2.3</div>
          <ul>
            <li>
              增加闹钟列表，点击列表中时间或详细列表中铃铛即可添加，详细设置在设置对话框中。
            </li>
            <li>更新列表：在CD中的鱼显示下一次窗口期时间。</li>
            <li>
              更新设置
              <ul>
                <li>现在点击“应用”按钮才会生效。</li>
                <li>添加闹钟相关选项。</li>
                <li>添加详情页面的自定义布局功能。</li>
              </ul>
            </li>
            <li>
              更新地图范围提示，增加地图：翻云雾海，龙堡内陆低地，基拉巴尼亚山区，安慕·艾兰，伊尔美格，黑风海。（持续更新中）
            </li>
            <li>修复详细列表中的前置鱼列表。</li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.2.2</div>
          <ul>
            <li>修复列表固定鱼完成按钮的问题。</li>
            <li>更新地图范围提示：延夏，高脚孤丘，魔大陆阿济兹拉。（持续更新中）</li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.2.1</div>
          <ul>
            <li>提升页面流畅度。</li>
            <li>更新地图，增加水晶和部分地图的钓点范围提示，持续更新中。</li>
            <li>
              范围都是
              <span class="font-weight-bold">轩辕十四@沃仙曦染</span>
              大佬的标的，万分感谢！
            </li>
            <li>修复了一些复制的问题。</li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.2.0</div>
          <ul>
            <li>界面更新，原先扩展列表变为右侧详细界面。</li>
            <li>固定和默认列表变为选项卡的形式。</li>
            <li>ACT界面（即较小的界面下），详细列表将全屏显示。</li>
            <li>ACT缩小模式更新。</li>
            <li>增加常驻（即全天可以钓）鱼王的筛选项。</li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.1.6</div>
          <ul>
            <li>修复等待状态，倒计时与持续时长乱序的问题。</li>
            <li>修复ACT下按钮有时没有相应的问题。</li>
            <li>修复道具提示框错位，被对话框遮挡的问题</li>
            <li>增加 猎手鱼 信息，咬钩：中杆，提钩：强力提钩。</li>
            <li>更新缩小模式，现在只显示鱼图标。</li>
            <li>搜索选项增加了鱼的图标。</li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.1.5</div>
          <ul>
            <li>更新帮助文档，ACT相关。现在通过配置ACT可以正常输入了。</li>
            <li>更新所有对话框的滚动条，以及一些样式更新。</li>
            <li>更新透明度滚动条，调整粒度变为0.01，可直接输入。</li>
            <li>调整复制、链接按钮大小。</li>
            <li>更新页脚。</li>
            <li>
              更新窗口期计算逻辑，现在窗口期正确地计算最长可能的时长（原先部分鱼的第一个和最后一个窗口期少计算了一部分时间）。
            </li>
            <li>更新倒计时和时长的显示位置。</li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.1.4</div>
          <ul>
            <li>更新后台算法，解决长时间后，倒计时出错的问题。</li>
            <li>增加ACT下使用的缩小功能，点击左上角，钓鱼时钟旁的鱼图标切换。</li>
            <li>更新帮助文档（ACT相关）。</li>
            <li>固定列表也按时间排序（和默认列表相同）。</li>
            <li>
              当一条鱼的界面处于展开模式时，以任意的形式从当前列表移除后，下一条鱼不会继承打开的状态。
            </li>
            <li>
              更新了 不朽巨鱼 的天气和咬钩 天气：从 阴云 修正为 晴朗/碧空 转
              阴云/薄雾，补充了 咬钩 为 鱼王竿。
            </li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.1.3</div>
          <ul>
            <li>向关于页面增加了重置按钮。</li>
            <li>修复了对导入数据的检测。</li>
            <li>更新了 冥河灯 的ET时间：0-4 修正为 23-4。</li>
            <li>在默认列表中不再显示固定的鱼。</li>
          </ul>
          <p />
          <v-divider />

          <div class="text-h6">Version 0.1.2</div>
          <p>更新了 众神之爱 的ET时间：5-7 修正为 5:30-6:30。</p>
          <v-divider />

          <div class="text-h6">Version 0.1.1</div>
          <ul>
            <li>修正了FishTracker导入的问题。</li>
            <li>显示没有钓场的鱼。</li>
            <li>调整行间距更紧凑。</li>
            <li>调整整体配色更暗。</li>
            <li>将鱼的背景色也根据状态进行了调整</li>
            <li>将鱼饵，前置鱼，天气图标的大小调整的更小。</li>
            <li>更新了通知栏的文本。</li>
            <li>更新鱼，鱼饵，钓场的提示文本。</li>
            <li>
              增加“配置”功能，目前支持调整透明度。原先默认0.8，现在默认1.0（即不透明）。透明度功能主要为ACT悬浮窗提供支持。
            </li>
            <li>增加时间提示，当鼠标悬停在倒计时文字上时，显示具体的时刻。</li>
            <li>增加“更新笔记”功能，当版本更新时显示。</li>
            <li>
              给等待中的鱼加上下次窗口期的持续时间（简易显示一个时间单位，鼠标悬停显示全部）。
            </li>
          </ul>
          <p />
          <v-divider />
          <div class="text-h6">Version 0.1.0</div>
          <p>初始版本</p>
        </v-card-text>
        <v-card-actions>
          <div class="d-flex flex-column flex-fill">
            <click-helper @click="onConfirmPatchNote">
              <v-btn color="primary" block>
                {{ $t('general.dialog.confirm') }}
              </v-btn>
            </click-helper>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="showHelpDialog"
      :fullscreen="isMobile"
      max-width="1264px"
      scrollable
    >
      <v-card>
        <v-card-title>
          {{ $t('top.help') }}
        </v-card-title>
        <v-card-text v-html="helpHTML" />
        <v-card-actions>
          <div class="d-flex flex-column flex-fill">
            <click-helper @click="showHelpDialog = false">
              <v-btn color="default" block text>{{ $t('general.dialog.close') }}</v-btn>
            </click-helper>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="showAboutDialog"
      :fullscreen="isMobile"
      max-width="600px"
      scrollable
    >
      <v-card>
        <v-card-text class="contact-area">
          <div>ID：红豆年糕 @ 海猫茶屋</div>
          <div>群：1153646847</div>
          <div>欢迎使用本站</div>
          <div>
            钓场的范围提示由 <span class="font-weight-bold">轩辕十四@沃仙曦染</span> 提供
          </div>
          <div>感谢来自于各个开源作者的支持：</div>
          <ul>
            <li>钓鱼数据：</li>
            <ul>
              <li>
                <a @click="goTo('https://ff14fish.carbuncleplushy.com/')"
                  >FFX|V Fish Tracker App</a
                >
              </li>
              <li><a @click="goTo('http://garlandtools.org/db/')">Garland Data</a></li>
              <li><a @click="goTo('https://cn.ff14angler.com/')">饥饿的猫</a></li>
            </ul>
            <li>
              游戏内相关数据(英文)：<a @click="goTo('https://xivapi.com/')"
                >A FINAL FANTASY XIV: Online REST API</a
              >
            </li>
            <li>
              游戏内相关数据(中文)：<a
                @click="goTo('https://github.com/thewakingsands/ffxiv-datamining-cn')"
                >ffxiv-datamining-cn</a
              >
            </li>
            <li>
              道具悬浮提示框：<a
                @click="goTo('https://github.com/thewakingsands/cafe-kit')"
                >cafe-kit</a
              >
            </li>
            <li>
              FF XIV 字体：<a
                @click="goTo('https://github.com/thewakingsands/ffxiv-axis-font-icons')"
                >ffxiv-axis-font-icons</a
              >
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <div class="d-flex flex-column flex-fill">
            <reset-button />
            <click-helper @click="showAboutDialog = false">
              <v-btn class="mt-2" color="default" block text>
                {{ $t('general.dialog.close') }}
              </v-btn>
            </click-helper>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <import-export-dialog v-model="showImportExport" />
    <v-snackbar
      :timeout="2000"
      v-model="snackbar.show"
      :color="snackbar.color"
      centered
      elevation="24"
    >
      <div class="text-center">{{ snackbar.text }}</div>
    </v-snackbar>
  </v-app>
</template>

<script>
import EorzeaTime, { WEATHER_CHANGE_INTERVAL_EARTH } from '@/utils/Time'
import '@thewakingsands/axis-font-icons'
import { mapGetters, mapMutations, mapState } from 'vuex'
import helpHTML from '@/assets/doc/help.html'
import { version } from '../package.json'
import ResetButton from '@/components/ResetButton'
import ClickHelper from '@/components/basic/ClickHelper'
import DataUtil from '@/utils/DataUtil'
import FishSettingDialog from '@/components/FishSettingDialog'
import NotificationUtil from '@/utils/NotificationUtil'
import DevelopmentModeUtil from '@/utils/DevelopmentModeUtil'
import ClipboardJS from 'clipboard'
import hotkeys from 'hotkeys-js'
import { Howl } from 'howler'
import sortBy from 'lodash/sortBy'
import _ from 'lodash'
import FishWindow from '@/utils/FishWindow'
import FishSearch from '@/components/FishSearch'
import ImportExportDialog from '@/components/ImportExportDialog'
import ImgUtil from '@/utils/ImgUtil'
import FIX from '@/store/fix'
import DIADEM from '@/store/diadem'
import placeNames from '@/store/placeNames.json'

export default {
  name: 'App',
  components: {
    ImportExportDialog,
    FishSearch,
    FishSettingDialog,
    ClickHelper,
    ResetButton,
  },
  data: vm => ({
    achievementScore40: ImgUtil.getImgUrl('ocean-fishing-score-achievement-40x40.png'),
    showJumpingOverlay: false,
    now: Date.now(),
    fisher: ImgUtil.getImgUrl('pastry-fish.png'),
    version,
    helpHTML,
    noOp: DataUtil.noOp,
    showHelpDialog: false,
    showAboutDialog: false,
    showSettingDialog: false,
    showPatchNoteDialog: false,
    collapse: false,
    // listFishCnt: [{ cnt: 0 }, { cnt: 0 }, { cnt: 0 }],
    TABS: DataUtil.TABS,
    title:
      vm.$t('top.systemBarTitle') +
      (DevelopmentModeUtil.isTest() ? vm.$t('top.testSuffix') : ''),
    drawer: true,
    mini: true,
    lazyFishSourceList: [],
    lazyImportantFishSourceList: [],
    lazyTransformedFishList: [],
    lazyTransformedFishDict: {},
    weatherChangeTrigger: 1,
    sortedFishIds: [],
    fishListTimePart: {},
    notifiedBefore: 0,
    searchedFishId: undefined,
    selectedFishId: undefined,
    fishListWeatherChangePart: {},
    extraFishListTimePart: {},
    lazyFishWindowRates: {},
    diademDark: ImgUtil.getImgUrl('diadem-dark-24x24.png'),
    diademLight: ImgUtil.getImgUrl('diadem-light-24x24.png'),
    diademTips: DIADEM.SIMPLE_TIPS,
    oceanFishTipReference: FIX.OCEAN_FISHING_TIPS.tip1,
  }),
  computed: {
    // TODO: CHECK different with real eorzea time of 1 minute
    eorzeaTime() {
      return new EorzeaTime(EorzeaTime.toEorzeaTime(this.now))
    },
    earthTime() {
      return DataUtil.formatDateTime(this.now, 'HH:mm')
    },
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
    listFishCntForMini() {
      return this.listFishCnt.slice(0, 2)
    },
    allFish() {
      return this.fish
    },
    filteredFishIdSet() {
      const idSet = new Set()
      this.lazyTransformedFishList
        .filter(fish => {
          return (
            this.filters.patches.includes(DataUtil.toFishFilterPatch(fish.patch)) &&
            (this.filters.completeType === 'ALL' ||
              (this.filters.completeType === 'COMPLETED' &&
                this.getFishCompleted(fish.id)) ||
              (this.filters.completeType === 'UNCOMPLETED' &&
                !this.getFishCompleted(fish.id))) &&
            (this.filters.bigFishType === 'ALL' ||
              (this.filters.bigFishType === 'BIG_FISH' &&
                this.bigFish.includes(fish.id)) ||
              (this.filters.bigFishType === 'ALL_AVAILABLE_BIG_FISH' &&
                this.bigFish.includes(fish.id) &&
                this.fishListTimePart[fish.id]?.countDown?.type ===
                  DataUtil.ALL_AVAILABLE) ||
              (this.filters.bigFishType === 'NOT_BIG_FISH' &&
                !this.bigFish.includes(fish.id)))
          )
        })
        .forEach(it => idSet.add(it._id))
      return idSet
    },
    sortedFilteredFishList() {
      const idSet = this.filteredFishIdSet
      let countdownSortedFishList = this.sortedFishIds
        .filter(id => idSet.has(id))
        .map(id => this.lazyTransformedFishDict[id])
        .filter(it => !this.getFishPinned(it.id))
        .filter((it, index) => this.filters.fishN === -1 || index < this.filters.fishN)

      if (this.filters.sorterType === 'RATE') {
        const firstWaitingFishLongerThanTwoHoursIndex = countdownSortedFishList.findIndex(
          fish => {
            const countDownType =
              this.fishListTimePart[fish._id]?.countDown.type ?? DataUtil.ALL_AVAILABLE
            if (countDownType === DataUtil.FISHING) {
              return false
            }
            const countDownTime =
              this.fishListTimePart[fish._id]?.countDown?.time ??
              DataUtil.INTERVAL_HOUR * 2
            if (countDownTime >= DataUtil.INTERVAL_HOUR * 2) {
              return true
            }
          }
        )

        const rateSortExcludedFish =
          firstWaitingFishLongerThanTwoHoursIndex === -1
            ? []
            : countdownSortedFishList.splice(
                firstWaitingFishLongerThanTwoHoursIndex,
                countdownSortedFishList.length - firstWaitingFishLongerThanTwoHoursIndex
              )

        countdownSortedFishList = sortBy(countdownSortedFishList, [
          fish =>
            this.fishListTimePart[fish._id]?.countDown.type ?? DataUtil.ALL_AVAILABLE,
          fish => this.lazyFishWindowRates[fish._id],
        ]).concat(rateSortExcludedFish)
      }

      return countdownSortedFishList
    },
    pinnedFishList() {
      const fishSourceList = this.lazyTransformedFishList
      const sortedFishIds = this.sortedFishIds
      return sortBy(
        fishSourceList.filter(it => this.getFishPinned(it.id)),
        [
          fish => {
            if (this.filters.sorterType === 'COUNTDOWN') {
              return 1
            } else {
              return this.lazyFishWindowRates[fish.id]
            }
          },
          fish => {
            const index = sortedFishIds.indexOf(fish.id)
            if (index === -1) {
              return sortedFishIds.length
            } else {
              return index
            }
          },
          fish => fish.id,
        ]
      )
    },
    listFishCnt() {
      const fishListTimePart = this.fishListTimePart
      const doFullCountSearch = [true, false, true]
      const allListCnt = [
        this.pinnedFishList,
        this.sortedFilteredFishList,
        this.toBeNotifiedFishList,
      ].map((list, index) => {
        if (Object.keys(fishListTimePart).length === 0) {
          return {
            type: DataUtil.COUNT_DOWN_TYPE[DataUtil.FISHING],
            cnt: 0,
          }
        }

        if (doFullCountSearch[index]) {
          return {
            type: DataUtil.COUNT_DOWN_TYPE[DataUtil.FISHING],
            cnt: list.reduce((cnt, fish) => {
              return (
                cnt +
                (fishListTimePart[fish.id]?.countDown?.type === DataUtil.FISHING ? 1 : 0)
              )
            }, 0),
          }
        } else {
          const firstNotFishingIndex = list.findIndex(
            it => fishListTimePart[it.id]?.countDown?.type !== DataUtil.FISHING
          )
          return {
            type: DataUtil.COUNT_DOWN_TYPE[DataUtil.FISHING],
            cnt: firstNotFishingIndex === -1 ? list.length : firstNotFishingIndex,
          }
        }
      })
      return [
        { type: allListCnt[1].type, cnt: allListCnt[0].cnt + allListCnt[1].cnt },
        allListCnt[2],
      ]
    },
    toBeNotifiedFishList() {
      const fishSourceList = this.lazyTransformedFishList
      const sortedFishIds = this.sortedFishIds
      return sortBy(
        fishSourceList.filter(it => this.getFishToBeNotified(it.id)),
        [
          fish => {
            if (this.filters.sorterType === 'COUNTDOWN') {
              return 1
            } else {
              return this.lazyFishWindowRates[fish.id]
            }
          },
          fish => sortedFishIds.indexOf(fish.id),
        ]
      )
    },
    selectedFish() {
      const fish = this.allFish[this.selectedFishId]
      if (fish) {
        return {
          ...fish,
          parts: {
            fishTimePart: this.extraFishListTimePart[this.selectedFishId],
            fishWeatherChangePart: this.fishListWeatherChangePart[this.selectedFishId],
            predators: DataUtil.getPredators(
              fish,
              this.lazyTransformedFishDict,
              this.fishListTimePart,
              this.fishListWeatherChangePart
            ),
          },
        }
      } else {
        return undefined
      }
    },
    isListPage() {
      return this.$route.name === 'ListPage'
    },
    showSearch: {
      get() {
        return this.showSearchDialog
      },
      set(showSearch) {
        this.setShowSearchDialog(showSearch)
      },
    },
    showImportExport: {
      get() {
        return this.showImportExportDialog
      },
      set(show) {
        this.setShowImportExportDialog(show)
      },
    },
    dark: {
      get() {
        return this.darkMode
      },
      set(dark) {
        this.$vuetify.theme.dark = dark
        this.setDarkMode(dark)
      },
    },
    showHatCover: {
      get() {
        return this.startLight
      },
      set(startLight) {
        this.setStartLight(startLight)
        this.showJumpingOverlay = true
        this.$nextTick(() => window.location.reload())
      },
    },
    inMigrationPage() {
      return this.$route.name === 'MigrationPage'
    },
    inStartLight() {
      return (
        this.now >= FIX.STARLIGHT_CELEBRATION.startTime &&
        this.now <= FIX.STARLIGHT_CELEBRATION.endTime
      )
    },
    ...mapState([
      'loading',
      'snackbar',
      'activeTabIndex',
      'showSearchDialog',
      'fish',
      'items',
      'fishingSpots',
      'zones',
      'bigFish',
      'sounds',
      'showSearchDialog',
      'showImportExportDialog',
      'newPatchFish',
      'folklore',
    ]),
    ...mapGetters([
      'opacity',
      'websiteVersion',
      'getFishToBeNotified',
      'getFishCompleted',
      'filters',
      'showFilter',
      'showBanner',
      'getFishPinned',
      'rightPanePercentage',
      'getItemName',
      'getItemIconClass',
      'getZoneName',
      'getFishingSpotsName',
      'getBaits',
      'getWeather',
      'getFishToBeNotified',
      'notification',
      'getItemIconUrl',
      'isSystemNotificationEnabled',
      'getFishingSpots',
      'darkMode',
      'startLight',
      'getAchievementName',
      'getAchievementIconClass',
    ]),
  },
  watch: {
    isMobile: {
      handler(isMobile) {
        if (isMobile) {
          this.mini = false
        }
      },
      immediate: true,
    },
    fishListTimePart: {
      handler: function(fishListTimePart) {
        const newSortedFishIds = sortBy(fishListTimePart, [
          'countDown.type',
          'countDown.time',
        ]).map(it => it.id)
        if (!_.isEqual(this.sortedFishIds, newSortedFishIds)) {
          this.sortedFishIds = newSortedFishIds
        }
      },
      deep: true,
    },
    listFishCnt(listFishCnt) {
      this.$emit('fishCntUpdated', listFishCnt)
    },
    weatherChangeTrigger() {
      this.updateWeatherChangePart(this.now)
    },
  },
  created() {
    this.startLoading()
    this.drawer = !this.isMobile

    hotkeys('/', event => {
      if (!this.showSearchDialog) {
        this.setShowSearchDialog(true)
      }
      event.preventDefault()
    })
  },
  async mounted() {
    // setTimeout(async () => {
    this.initialUserData()

    this.$vuetify.theme.dark = this.dark
    if (
      this.toComparableVersion(this.version) >
      this.toComparableVersion(this.websiteVersion)
    ) {
      this.showPatchNoteDialog = true
    }
    this.cafeKitTooltipCopyPatch()

    this.now = Date.now()
    this.lazyFishSourceList = Object.values(this.allFish).filter(
      it => it.patch == null || it.patch <= DataUtil.PATCH_MAX
    )
    this.lazyImportantFishSourceList = this.lazyFishSourceList.filter(
      it =>
        this.bigFish.includes(it._id) ||
        this.newPatchFish.includes(it._id) ||
        !DataUtil.isAllAvailableFish(it)
    )
    this.updateWeatherChangePart(this.now)

    this.lazyTransformedFishList = this.assembleFish(this.lazyFishSourceList).concat(
      this.assembleOceanFishList()
    )
    this.lazyTransformedFishDict = DataUtil.toMap(
      this.lazyTransformedFishList,
      fish => fish.id
    )
    const sounds = await this.loadingSounds()
    this.setSounds(DataUtil.toMap(sounds, it => it.key))

    setInterval(() => {
      const now = Date.now()
      this.now = now
      this.updateFishListTimePart(now)
      this.checkNotification(now)
      if (this.loading) {
        this.finishLoading()
      }
    }, 1000)

    // this.weatherChangeTrigger *= -1
    setInterval(() => {
      this.weatherChangeTrigger *= -1
    }, WEATHER_CHANGE_INTERVAL_EARTH)
    // }, 200)
  },
  methods: {
    updateWeatherChangePart(now) {
      this.fishListWeatherChangePart = this.lazyImportantFishSourceList.reduce(
        (fish2WeatherPart, fish) => {
          fish2WeatherPart[fish._id] = {
            fishWindows: this.getFishWindow(fish, now),
          }
          return fish2WeatherPart
        },
        {}
      )

      if (Object.keys(this.lazyFishWindowRates).length === 0) {
        this.lazyImportantFishSourceList.forEach(fish => {
          const fishWindows = this.fishListWeatherChangePart[fish._id]?.fishWindows
          this.lazyFishWindowRates[fish._id] = DataUtil.computeRate(fishWindows)
        })
      }
    },
    loadingSounds() {
      return Promise.all(
        DataUtil.NOTIFICATION_SOUNDS.map(sound => {
          if (sound.filename == null)
            return Promise.resolve({ key: sound.key, player: null })
          return import(`@/assets/sound/${sound.filename}`).then(it => {
            return {
              key: sound.key,
              player: new Howl({ src: it?.default, preload: true }),
            }
          })
        })
      )
    },
    updateFishListTimePart(now) {
      this.lazyImportantFishSourceList.forEach(fish => {
        const countDown = this.fishListTimePart[fish._id]?.countDown
        if (countDown?.type === DataUtil.ALL_AVAILABLE) return

        const lazyStartTime = countDown?.timePoint
        const currentInterval = countDown?.time
        if (
          (this.selectedFishId != null && fish._id === this.selectedFishId) ||
          (this.searchedFishId != null && fish._id === this.searchedFishId)
        ) {
          this.$set(this.extraFishListTimePart, fish._id, {
            id: fish._id,
            countDown: this.getCountDown(fish, now),
          })
        }

        if (
          !lazyStartTime ||
          !currentInterval ||
          DataUtil.shouldUpdate(lazyStartTime - now, currentInterval)
        ) {
          this.$set(this.fishListTimePart, fish._id, {
            id: fish._id,
            countDown: this.getCountDown(fish, now),
          })
        }
      })
    },
    checkNotification(now) {
      const rangeToEnsureAlarm = DataUtil.INTERVAL_SECOND * 2
      let notifications = []
      this.toBeNotifiedFishList.forEach(fish => {
        const countDown = this.fishListTimePart[fish.id]?.countDown
        if (countDown?.type === DataUtil.ALL_AVAILABLE) return false

        this.notification.settings.forEach(setting => {
          if (setting.enabled) {
            const fishWindows = this.fishListWeatherChangePart[fish.id]?.fishWindows ?? []
            fishWindows
              .map(fishWindow => fishWindow[0] - now)
              .filter((it, index) => it > 0 && index < 2)
              .some(interval => {
                // console.log(fish.id)
                const notifyMin = setting.before * DataUtil.INTERVAL_MINUTE
                const notifyMax = notifyMin + rangeToEnsureAlarm

                // let d = new Date(interval)
                // console.log(d.getUTCMinutes(), d.getUTCSeconds())
                // d = new Date(notifyMax)
                // console.log(d.getUTCMinutes(), d.getUTCSeconds())
                // console.log(interval < notifyMax && interval > notifyMin)
                if (interval < notifyMax && interval > notifyMin) {
                  // soundsToPlay.add(setting.sound)
                  notifications.push({ fish, setting })
                  return true
                } else {
                  return false
                }
              })
          }
        })
      })
      const toRingBell = notifications.length > 0

      if (toRingBell && this.notifiedBefore === 0) {
        this.ringBell(notifications.map(it => it.setting.sound))
        if (this.isSystemNotificationEnabled) {
          NotificationUtil.showFishNotification(notifications)
        }
        this.notifiedBefore = 3
      } else if (this.notifiedBefore > 0) {
        this.notifiedBefore--
      }
    },
    ringBell(soundsToPlay) {
      soundsToPlay.forEach(key => {
        this.sounds[key]?.player?.volume(this.notification.volume).play()
      })
    },
    assembleOceanFishList() {
      const fishList = Object.values(FIX.OCEAN_FISHING_FISH)
      return fishList.map(fish => this.assembleOceanFish(fish))
    },
    assembleOceanFish(fish) {
      const hasPredators = fish.predators && Object.keys(fish.predators).length > 0
      const bonus = FIX.OCEAN_FISHING_BONUS[fish.bonus]
      const realNotAvailableWeatherSet = this.getRealNotAvailableWeatherSet(fish._id)
      return {
        ...fish,
        id: fish._id,
        name: this.getItemName(fish._id),
        icon: this.getItemIconClass(fish._id),
        hasFishingSpot: fish.locations.length !== 0,
        fishingSpots: this.getFishingSpots(fish.locations),
        baitId: fish.bait,
        bait: {
          id: fish.bait,
          name: this.getItemName(fish.bait),
          icon: this.getItemIconClass(fish.bait),
        },
        baitExtraId: fish.baitExtra,
        baitExtra: fish.baitExtra
          ? {
              id: fish.baitExtra,
              name: this.getItemName(fish.baitExtra),
              icon: this.getItemIconClass(fish.baitExtra),
            }
          : null,
        baits: this.getBaits(fish, undefined, FIX.OCEAN_FISHING_FISH),
        tug: fish.tug,
        tugIcon: DataUtil.TUG_ICON[fish.tug],
        biteTimeForSort: fish.biteTimeMin * 100 + (fish.biteTimeMax ?? 0),
        hasWeatherConstraint: fish.notAvailableWeatherSet.length > 0,
        hasRealWeatherConstraint:
          realNotAvailableWeatherSet.length > fish.notAvailableWeatherSet.length,
        notAvailableWeatherSetDetail: this.getWeather(realNotAvailableWeatherSet),
        notAvailableWeatherSet: realNotAvailableWeatherSet,
        time: fish.time,
        timeText: DataUtil.timeId2TimeText(fish.time),
        timeIcon: DataUtil.timeId2TimeIcon(fish.time),
        hasPredators: hasPredators,
        predatorsIcon: DataUtil.iconIdToClass(DataUtil.ICON_PREDATORS),
        predators: hasPredators ? this.getOceanFishPredators(fish.predators) : [],
        bonusId: fish.bonus,
        bonus: {
          name: bonus.objective,
          icon: DataUtil.iconIdToClass(bonus.icon),
        },
      }
    },
    getRealNotAvailableWeatherSet(fishId) {
      const fish = FIX.OCEAN_FISHING_FISH[fishId]
      if (fish == null) return []

      const predatorIds = fish.predators ? Object.keys(fish.predators) : []
      return _.union(
        fish.notAvailableWeatherSet,
        fish.bestCatchPathExtra.length === 0
          ? fish.bestCatchPath.flatMap(fishId => {
              return this.getRealNotAvailableWeatherSet(fishId)
            })
          : _.intersection(
              fish.bestCatchPath.flatMap(fishId => {
                return this.getRealNotAvailableWeatherSet(fishId)
              }),
              fish.bestCatchPathExtra.flatMap(fishId => {
                return this.getRealNotAvailableWeatherSet(fishId)
              })
            ),
        predatorIds.flatMap(fishId => this.getRealNotAvailableWeatherSet(fishId))
      )
    },
    getOceanFishPredators(predators) {
      if (predators == null || Object.keys(predators).length === 0) {
        return []
      } else {
        return Object.entries(predators).map(([predatorId, count]) => {
          return {
            ...this.assembleOceanFish(FIX.OCEAN_FISHING_FISH[predatorId]),
            requiredCnt: count,
          }
        })
      }
    },
    assembleSpearFish(fish, isPredator = false) {
      const hasPredators = Object.keys(fish.predators).length > 0
      const rate = this.lazyFishWindowRates[fish._id]
      const folklore = fish.folklore && this.folklore[fish.folklore]
      return {
        _id: fish._id,
        id: fish._id,
        type: 'spear',
        icon: this.getItemIconClass(fish._id),
        iconRemoteUrl: null,
        showHatCover: false,
        name: this.getItemName(fish._id),
        hasFishingSpot: true,
        fishingSpots: fish.locations.map(location => {
          const gatheringPoint = FIX.SPEAR_FISH_GATHERING_POINTS[location]
          return {
            zone: placeNames[gatheringPoint.territoryPlaceNameId],
            fishingSpot: gatheringPoint,
            fishingSpotName: DataUtil.getName(gatheringPoint),
            fishingSpotId: location,
            fishSpotPositionText: DataUtil.toPositionText(gatheringPoint),
          }
        }),
        baitsExtra: [],
        baits: [],
        hasFishEyes: false,
        hasPredators: hasPredators,
        hasSnagging: false,
        startHourText: DataUtil.formatET(fish.startHour),
        endHourText: DataUtil.formatET(fish.endHour),
        hasTimeConstraint: fish.startHour !== 0 || fish.endHour !== 24,
        requiredCnt: fish.requiredCnt ?? 0, // TODO
        addBuffSuffix: false,
        hasWeatherConstraint:
          fish.previousWeatherSet.length > 0 || fish.weatherSet.length > 0,
        previousWeatherSet: fish.previousWeatherSet,
        weatherSet: fish.weatherSet,
        previousWeatherSetDetail: this.getWeather(fish.previousWeatherSet),
        weatherSetDetail: this.getWeather(fish.weatherSet),
        patch: fish.patch, // TODO
        folklore: folklore && {
          id: folklore._id,
          itemId: folklore.itemId,
          name: this.getItemName(folklore.itemId),
          icon: this.getItemIconClass(folklore.itemId),
        }, // TODO
        collectable: false, //TODO
        isFuturePatch: fish.patch > DataUtil.PATCH_AVAILABLE_MAX,
        rate: rate,
        rateText: this.$t('countDown.rate', {
          rate: ((rate ?? 1) * 100).toPrecision(2),
        }),
        isPredator: isPredator, // TODO
        anglerFishId: fish.anglerFishId, // TODO
        hasTips: DataUtil.hasTips(fish._id),
        predators: [], // TODO

        gig: DataUtil.GIG_DICT[fish.gig],
      }
    },
    assembleFish(fishSourceList, isPredator = false) {
      return fishSourceList.map(fish => {
        if (fish.gig != null) {
          // console.log('spear fish', fish)
          return this.assembleSpearFish(fish)
        }
        const hasPredators = Object.keys(fish.predators).length > 0
        const rate = this.lazyFishWindowRates[fish._id]
        const bestCatchPathExtra = fish.bestCatchPathExtra ?? []
        const folklore = fish.folklore && this.folklore[fish.folklore]
        return {
          // TODO remove _id
          _id: fish._id,
          id: fish._id,
          icon: this.getItemIconClass(fish._id),
          iconRemoteUrl: this.getItemIconUrl(fish._id),
          showHatCover:
            this.inStartLight &&
            this.showHatCover &&
            FIX.STARLIGHT_CELEBRATION.fish.includes(fish._id),
          name: this.getItemName(fish._id),
          hasFishingSpot: fish.locations.length !== 0,
          // zone: this.getZoneName(fish.location),
          // fishingSpot: this.getFishingSpotsName(fish.location),
          fishingSpots: this.getFishingSpots(fish.locations),
          // .map(location => {
          // return {
          //   zone: this.getZoneName(location),
          //   fishingSpotName: this.getFishingSpotsName(location),
          //   fishingSpotId: location,
          // }
          // }),
          baitsExtra:
            bestCatchPathExtra.length > 0 ? this.getBaits(fish, bestCatchPathExtra) : [],
          baits: this.getBaits(fish),
          hasFishEyes: fish.fishEyes !== false,
          fishEyesIcon: DataUtil.iconIdToClass(DataUtil.ICON_FISH_EYES),
          fishEyesText: DataUtil.secondsToFishEyesString(fish.fishEyes),
          fishEyesSeconds: fish.fishEyes,
          hasPredators: hasPredators,
          predatorsIcon: DataUtil.iconIdToClass(DataUtil.ICON_PREDATORS),
          hasSnagging: fish.snagging,
          snaggingIcon: DataUtil.iconIdToClass(DataUtil.ICON_SNAGGING),
          startHourText: fish.startHourText ?? DataUtil.formatET(fish.startHour),
          endHourText: fish.endHourText ?? DataUtil.formatET(fish.endHour),
          hasTimeConstraint: fish.startHour !== 0 || fish.endHour !== 24,
          requiredCnt: fish.requiredCnt ?? 0,
          addBuffSuffix: hasPredators && DataUtil.isAllAvailableFish(fish),
          hasWeatherConstraint:
            fish.previousWeatherSet.length > 0 || fish.weatherSet.length > 0,
          previousWeatherSet: fish.previousWeatherSet,
          weatherSet: fish.weatherSet,
          previousWeatherSetDetail: this.getWeather(fish.previousWeatherSet),
          weatherSetDetail: this.getWeather(fish.weatherSet),
          patch: fish.patch,
          folklore: folklore && {
            id: folklore._id,
            itemId: folklore.itemId,
            name: this.getItemName(folklore.itemId),
            icon: this.getItemIconClass(folklore.itemId),
          },
          collectable: fish.collectable,
          isFuturePatch: fish.patch > DataUtil.PATCH_AVAILABLE_MAX,
          rate: rate,
          rateText: this.$t('countDown.rate', {
            rate: ((rate ?? 1) * 100).toPrecision(2),
          }),
          isPredator: isPredator,
          anglerFishId: fish.anglerFishId,
          hasTips: DataUtil.hasTips(fish._id),
          predators: this.assembleFish(DataUtil.getPredators(fish, this.allFish), true),
        }
      })
    },
    getCountDown(fish, now) {
      // utilize 8 hours fish windows computed if exists
      // and not out of time(use 2 fish window cached if necessary)
      const fishingSpot = fish.gig != null ? null : this.fishingSpots[fish.locations[0]]
      if (fishingSpot || fish.gig != null) {
        const fishWindowsComputed =
          this.fishListWeatherChangePart[fish._id]?.fishWindows ??
          FishWindow.getNextNFishWindows(
            fishingSpot?.territory_id,
            new EorzeaTime(EorzeaTime.toEorzeaTime(now)),
            fish.startHour,
            fish.endHour,
            fish.previousWeatherSet,
            fish.weatherSet,
            2
          )

        let targetFishWindow
        let nextTargetFishWindow

        for (let i = 0; i < fishWindowsComputed.length; i++) {
          if (fishWindowsComputed[i][1] >= now) {
            targetFishWindow = fishWindowsComputed[i]
            if (i + 1 < fishWindowsComputed.length) {
              nextTargetFishWindow = fishWindowsComputed[i + 1]
            }
            break
          }
        }

        if (targetFishWindow == null) {
          return { type: DataUtil.ALL_AVAILABLE }
        }
        if (now <= targetFishWindow[0]) {
          return {
            type: DataUtil.WAITING,
            time: targetFishWindow[0] - now,
            timePoint: targetFishWindow[0],
            fishWindowTotal: targetFishWindow[1] - targetFishWindow[0],
          }
        } else if (now <= targetFishWindow[1]) {
          return {
            type: DataUtil.FISHING,
            time: targetFishWindow[1] - now,
            timePoint: targetFishWindow[1],
            fishWindowTotal: targetFishWindow[1] - targetFishWindow[0],
            nextInterval: nextTargetFishWindow
              ? nextTargetFishWindow[0] - now
              : undefined,
            nextTimePoint: nextTargetFishWindow ? nextTargetFishWindow[0] : undefined,
          }
        }
      } else {
        return { type: DataUtil.ALL_AVAILABLE }
      }
    },
    getFishWindow(fish, now) {
      return DataUtil.getFishWindow(fish, now, this.allFish, this.fishingSpots)
    },
    mergeConstraints(fish1, fish2) {
      const mergedFish = {
        ...fish1,
        previousWeatherSet: _.union(fish1.previousWeatherSet, fish2.previousWeatherSet),
        weatherSet: _.union(fish1.weatherSet, fish2.weatherSet),
        // TODO: actually some ranges are [20-8] but since we checked all fish with predators.
        // So just ignore those impossible cases here...
        startHour: Math.max(fish1.startHour, fish2.startHour),
        endHour: Math.min(fish1.endHour, fish2.endHour),
      }
      console.log(mergedFish)
      return mergedFish
    },
    toComparableVersion(version) {
      return version
        .split('.')
        .map(it => it.padStart('0', 5))
        .join('')
    },
    goTo(href) {
      window.open(href)
    },
    onConfirmPatchNote() {
      this.setWebsiteVersion(version)
      this.showPatchNoteDialog = false
    },
    toggleCollapse() {
      this.collapse = !this.collapse
    },
    setActiveTabLater(index) {
      setTimeout(() => this.setActiveTab(index), 500)
    },
    cafeKitTooltipCopyPatch() {
      new ClipboardJS('.cafekit.ck-popup .ck-container button', {
        text: trigger => {
          if (trigger.innerText === '已复制') {
            this.showSnackbar({
              text: this.$t('importExport.dialog.message.copySuccess'),
              color: 'success',
            })
            return window.document
              .getElementsByClassName('ck-item-name-name')[0]
              .innerText.trim()
          }
        },
      })
    },
    toPage(page) {
      if (this.$route.name !== page) {
        this.$router.push({ name: page })
      }
    },
    toPageSubList(tabIndex) {
      this.toPage('ListPage')
      this.setActiveTab(tabIndex)
    },
    toggleNavMini() {
      this.mini = !this.mini
    },
    showNavi() {
      if (this.isMobile) {
        this.drawer = !this.drawer
      }
    },
    onFishIconClicked() {
      this.toggleCollapse()
    },
    ...mapMutations([
      'toggleFilterPanel',
      'setShowSearchDialog',
      'setShowImportExportDialog',
      'setWebsiteVersion',
      'setActiveTab',
      'showSnackbar',
      'setSounds',
      'setDarkMode',
      'startLoading',
      'finishLoading',
      'setStartLight',
      'initialUserData',
    ]),
  },
}
</script>

<style>
@import './assets/css/fish_icons.css';
@import './assets/css/keys.css';

@font-face {
  font-family: 'FFXIV';
  src: url('./assets/font/FFXIV_Lodestone_SSF.ttf') format('truetype'),
    url('./assets/font/FFXIV_Lodestone_SSF.woff') format('woff');
  unicode-range: U+E020-E0DB;
}

.cafekit.ck-popup {
  z-index: 9999 !important;
}

/* Hide scrollbar for Chrome, Safari and Opera */
body::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
html,
body {
  /*overflow-y: hidden !important;*/
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.bscroll-vertical-scrollbar {
  z-index: 9998;
}

.resize-indicator {
  width: 0;
  height: 0;
  position: absolute;
  right: 0;
  bottom: 0;
  border-bottom: 8px solid #ffffff;
  border-left: 8px solid transparent;
}

.v-expansion-panel-header {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.min-page {
  background: rgba(255, 255, 255, 0) !important;
  /*height: 64px;*/
}

#write {
  margin: 0 !important;
  padding: 0 !important;
}

/*.fish-app-bar.v-toolbar.v-toolbar--collapsed {*/

/*  max-width: 64px !important;*/
/*}*/

.v-application .fish-app-bar.fish-app-bar--collapsed {
  background-color: #004d4066 !important;
  border: 2px solid;
}

/* scroller setting start */
/* The emerging W3C standard
   that is currently Firefox-only */

* {
  scrollbar-width: thin;
  scrollbar-color: #ffffff66 #00000061;
}

/* Works on Chrome/Edge/Safari */

*::-webkit-scrollbar {
  width: 6px;
}

*::-webkit-scrollbar-track {
  background: #00000061;
}

*::-webkit-scrollbar-thumb {
  background-color: #ffffff66;
  border-radius: 10px;
  border: 1px solid #ffffff1f;
}

/* scroller setting end */

.splitpanes--vertical .splitpanes__pane {
  -webkit-transition: unset !important;
  transition: unset !important;
  /*transition-property: width;*/
  /*transition-duration: 0.2s;*/
  /*transition-timing-function: ease-out;*/
  /*transition-delay: 0s;*/
}

.theme-switch .v-messages {
  display: none !important;
}

.theme-switch .v-input__slot {
  margin-bottom: 0;
}
</style>
