import {
  DefaultGridAlignColumnsDirective,
  DefaultGridAlignDirective,
  DefaultGridAlignRowsDirective,
  DefaultGridAreaDirective,
  DefaultGridAreasDirective,
  DefaultGridAutoDirective,
  DefaultGridColumnDirective,
  DefaultGridColumnsDirective,
  DefaultGridGapDirective,
  DefaultGridRowDirective,
  DefaultGridRowsDirective,
  GridAlignColumnsDirective,
  GridAlignColumnsStyleBuilder,
  GridAlignDirective,
  GridAlignRowsDirective,
  GridAlignRowsStyleBuilder,
  GridAlignStyleBuilder,
  GridAreaDirective,
  GridAreaStyleBuilder,
  GridAreasDirective,
  GridAreasStyleBuiler,
  GridAutoDirective,
  GridAutoStyleBuilder,
  GridColumnDirective,
  GridColumnStyleBuilder,
  GridColumnsDirective,
  GridColumnsStyleBuilder,
  GridGapDirective,
  GridGapStyleBuilder,
  GridModule,
  GridRowDirective,
  GridRowStyleBuilder,
  GridRowsDirective,
  GridRowsStyleBuilder
} from "./chunk-SJVIOXN2.js";
import {
  DefaultFlexAlignDirective,
  DefaultFlexDirective,
  DefaultFlexOffsetDirective,
  DefaultFlexOrderDirective,
  DefaultLayoutAlignDirective,
  DefaultLayoutDirective,
  DefaultLayoutGapDirective,
  FlexAlignDirective,
  FlexAlignStyleBuilder,
  FlexDirective,
  FlexFillDirective,
  FlexFillStyleBuilder,
  FlexModule,
  FlexOffsetDirective,
  FlexOffsetStyleBuilder,
  FlexOrderDirective,
  FlexOrderStyleBuilder,
  FlexStyleBuilder,
  LayoutAlignDirective,
  LayoutAlignStyleBuilder,
  LayoutDirective,
  LayoutGapDirective,
  LayoutGapStyleBuilder,
  LayoutStyleBuilder
} from "./chunk-XUVSOOYP.js";
import "./chunk-M3HR6BUY.js";
import "./chunk-35UKIMUB.js";
import "./chunk-76OEJIFY.js";
import {
  ClassDirective,
  DefaultClassDirective,
  DefaultImgSrcDirective,
  DefaultShowHideDirective,
  DefaultStyleDirective,
  ExtendedModule,
  ImgSrcDirective,
  ImgSrcStyleBuilder,
  ShowHideDirective,
  ShowHideStyleBuilder,
  StyleDirective
} from "./chunk-7NWXMABZ.js";
import "./chunk-GQQUDDDJ.js";
import "./chunk-MDS4VJZ4.js";
import {
  BREAKPOINT,
  BREAKPOINTS,
  BREAKPOINT_PRINT,
  BROWSER_PROVIDER,
  BaseDirective2,
  BreakPointRegistry,
  CLASS_NAME,
  CoreModule,
  DEFAULT_BREAKPOINTS,
  DEFAULT_CONFIG,
  LAYOUT_CONFIG,
  MatchMedia,
  MediaChange,
  MediaMarshaller,
  MediaObserver,
  MediaTrigger,
  MockMatchMedia,
  MockMatchMediaProvider,
  ORIENTATION_BREAKPOINTS,
  PrintHook,
  SERVER_TOKEN,
  ScreenTypes,
  StyleBuilder,
  StyleUtils,
  StylesheetMap,
  coerceArray,
  mergeAlias,
  multiply,
  removeStyles,
  sortAscendingPriority,
  sortDescendingPriority,
  validateBasis
} from "./chunk-LH4HDLHQ.js";
import "./chunk-2AA2HD2T.js";
import "./chunk-MOXYW7FB.js";
import "./chunk-5KFNCZSW.js";
import "./chunk-WONRTEEZ.js";
import "./chunk-PAD7XWD6.js";
import {
  isPlatformServer
} from "./chunk-E3DWXUPZ.js";
import {
  Inject,
  NgModule,
  PLATFORM_ID,
  Version,
  setClassMetadata,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-BQ5UH2I7.js";
import "./chunk-ISM5WLAM.js";
import "./chunk-IC62NIWK.js";
import "./chunk-ZZ67MR3E.js";
import {
  __spreadValues
} from "./chunk-KBUIKKCC.js";

// node_modules/@angular/flex-layout/fesm2020/angular-flex-layout.mjs
var VERSION = new Version("15.0.0-beta.42");
var FlexLayoutModule = class _FlexLayoutModule {
  constructor(serverModuleLoaded, platformId) {
    if (isPlatformServer(platformId) && !serverModuleLoaded) {
      console.warn("Warning: Flex Layout loaded on the server without FlexLayoutServerModule");
    }
  }
  /**
   * Initialize the FlexLayoutModule with a set of config options,
   * which sets the corresponding tokens accordingly
   */
  static withConfig(configOptions, breakpoints = []) {
    return {
      ngModule: _FlexLayoutModule,
      providers: configOptions.serverLoaded ? [{
        provide: LAYOUT_CONFIG,
        useValue: __spreadValues(__spreadValues({}, DEFAULT_CONFIG), configOptions)
      }, {
        provide: BREAKPOINT,
        useValue: breakpoints,
        multi: true
      }, {
        provide: SERVER_TOKEN,
        useValue: true
      }] : [{
        provide: LAYOUT_CONFIG,
        useValue: __spreadValues(__spreadValues({}, DEFAULT_CONFIG), configOptions)
      }, {
        provide: BREAKPOINT,
        useValue: breakpoints,
        multi: true
      }]
    };
  }
};
FlexLayoutModule.ɵfac = function FlexLayoutModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || FlexLayoutModule)(ɵɵinject(SERVER_TOKEN), ɵɵinject(PLATFORM_ID));
};
FlexLayoutModule.ɵmod = ɵɵdefineNgModule({
  type: FlexLayoutModule,
  imports: [FlexModule, ExtendedModule, GridModule],
  exports: [FlexModule, ExtendedModule, GridModule]
});
FlexLayoutModule.ɵinj = ɵɵdefineInjector({
  imports: [FlexModule, ExtendedModule, GridModule, FlexModule, ExtendedModule, GridModule]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FlexLayoutModule, [{
    type: NgModule,
    args: [{
      imports: [FlexModule, ExtendedModule, GridModule],
      exports: [FlexModule, ExtendedModule, GridModule]
    }]
  }], function() {
    return [{
      type: void 0,
      decorators: [{
        type: Inject,
        args: [SERVER_TOKEN]
      }]
    }, {
      type: Object,
      decorators: [{
        type: Inject,
        args: [PLATFORM_ID]
      }]
    }];
  }, null);
})();
export {
  BREAKPOINT,
  BREAKPOINTS,
  BREAKPOINT_PRINT,
  BROWSER_PROVIDER,
  BaseDirective2,
  BreakPointRegistry,
  CLASS_NAME,
  ClassDirective,
  CoreModule,
  DEFAULT_BREAKPOINTS,
  DEFAULT_CONFIG,
  DefaultClassDirective,
  DefaultFlexAlignDirective,
  DefaultFlexDirective,
  DefaultFlexOffsetDirective,
  DefaultFlexOrderDirective,
  DefaultGridAlignColumnsDirective,
  DefaultGridAlignDirective,
  DefaultGridAlignRowsDirective,
  DefaultGridAreaDirective,
  DefaultGridAreasDirective,
  DefaultGridAutoDirective,
  DefaultGridColumnDirective,
  DefaultGridColumnsDirective,
  DefaultGridGapDirective,
  DefaultGridRowDirective,
  DefaultGridRowsDirective,
  DefaultImgSrcDirective,
  DefaultLayoutAlignDirective,
  DefaultLayoutDirective,
  DefaultLayoutGapDirective,
  DefaultShowHideDirective,
  DefaultStyleDirective,
  ExtendedModule,
  FlexAlignDirective,
  FlexAlignStyleBuilder,
  FlexDirective,
  FlexFillDirective,
  FlexFillStyleBuilder,
  FlexLayoutModule,
  FlexModule,
  FlexOffsetDirective,
  FlexOffsetStyleBuilder,
  FlexOrderDirective,
  FlexOrderStyleBuilder,
  FlexStyleBuilder,
  GridAlignColumnsDirective,
  GridAlignColumnsStyleBuilder,
  GridAlignDirective,
  GridAlignRowsDirective,
  GridAlignRowsStyleBuilder,
  GridAlignStyleBuilder,
  GridAreaDirective,
  GridAreaStyleBuilder,
  GridAreasDirective,
  GridAreasStyleBuiler,
  GridAutoDirective,
  GridAutoStyleBuilder,
  GridColumnDirective,
  GridColumnStyleBuilder,
  GridColumnsDirective,
  GridColumnsStyleBuilder,
  GridGapDirective,
  GridGapStyleBuilder,
  GridModule,
  GridRowDirective,
  GridRowStyleBuilder,
  GridRowsDirective,
  GridRowsStyleBuilder,
  ImgSrcDirective,
  ImgSrcStyleBuilder,
  LAYOUT_CONFIG,
  LayoutAlignDirective,
  LayoutAlignStyleBuilder,
  LayoutDirective,
  LayoutGapDirective,
  LayoutGapStyleBuilder,
  LayoutStyleBuilder,
  MediaChange,
  MediaMarshaller,
  MediaObserver,
  MediaTrigger,
  ORIENTATION_BREAKPOINTS,
  PrintHook,
  SERVER_TOKEN,
  ScreenTypes,
  ShowHideDirective,
  ShowHideStyleBuilder,
  StyleBuilder,
  StyleDirective,
  StyleUtils,
  StylesheetMap,
  VERSION,
  coerceArray,
  mergeAlias,
  removeStyles,
  sortAscendingPriority,
  sortDescendingPriority,
  validateBasis,
  MatchMedia as ɵMatchMedia,
  MockMatchMedia as ɵMockMatchMedia,
  MockMatchMediaProvider as ɵMockMatchMediaProvider,
  multiply as ɵmultiply
};
/*! Bundled license information:

@angular/flex-layout/fesm2020/angular-flex-layout.mjs:
  (**
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.io/license
   *)
*/
//# sourceMappingURL=@angular_flex-layout.js.map
