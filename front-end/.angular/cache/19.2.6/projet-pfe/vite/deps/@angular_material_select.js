import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-NSLIXTVA.js";
import "./chunk-6F2PJR7Y.js";
import "./chunk-QB3QHFHA.js";
import "./chunk-H43JCN6U.js";
import "./chunk-D6N32B6Z.js";
import "./chunk-OIZAD6NR.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-CEBA3LZU.js";
import "./chunk-POQBJ3C5.js";
import "./chunk-TV5E5VMI.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-UYRFIDWB.js";
import "./chunk-NEPUS25E.js";
import "./chunk-SZS4RJEH.js";
import "./chunk-BH7GL7IW.js";
import "./chunk-K6BFXPSN.js";
import "./chunk-77J6457W.js";
import "./chunk-M65FI7UY.js";
import "./chunk-WIBQYMVU.js";
import "./chunk-F5YF3NDX.js";
import "./chunk-TRES2BGH.js";
import "./chunk-I2QKOSL2.js";
import "./chunk-UDU42JBG.js";
import "./chunk-6EMLWD5W.js";
import "./chunk-LOKXEHNQ.js";
import "./chunk-CIGKH54X.js";
import "./chunk-JLQWHJC7.js";
import "./chunk-E7WFP7VC.js";
import "./chunk-JOW2CDHF.js";
import "./chunk-OGIWWRK5.js";
import "./chunk-I4PCH24K.js";
import "./chunk-M3HR6BUY.js";
import "./chunk-35UKIMUB.js";
import "./chunk-76OEJIFY.js";
import "./chunk-2AA2HD2T.js";
import "./chunk-MOXYW7FB.js";
import "./chunk-5KFNCZSW.js";
import "./chunk-WONRTEEZ.js";
import "./chunk-E3DWXUPZ.js";
import "./chunk-BQ5UH2I7.js";
import "./chunk-ISM5WLAM.js";
import "./chunk-IC62NIWK.js";
import "./chunk-ZZ67MR3E.js";
import "./chunk-KBUIKKCC.js";

// node_modules/@angular/material/fesm2022/select.mjs
var matSelectAnimations = {
  // Represents
  // trigger('transformPanelWrap', [
  //   transition('* => void', query('@transformPanel', [animateChild()], {optional: true})),
  // ])
  /**
   * This animation ensures the select's overlay panel animation (transformPanel) is called when
   * closing the select.
   * This is needed due to https://github.com/angular/angular/issues/23302
   */
  transformPanelWrap: {
    type: 7,
    name: "transformPanelWrap",
    definitions: [{
      type: 1,
      expr: "* => void",
      animation: {
        type: 11,
        selector: "@transformPanel",
        animation: [{
          type: 9,
          options: null
        }],
        options: {
          optional: true
        }
      },
      options: null
    }],
    options: {}
  },
  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])
  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: "transformPanel",
    definitions: [{
      type: 0,
      name: "void",
      styles: {
        type: 6,
        styles: {
          opacity: 0,
          transform: "scale(1, 0.8)"
        },
        offset: null
      }
    }, {
      type: 1,
      expr: "void => showing",
      animation: {
        type: 4,
        styles: {
          type: 6,
          styles: {
            opacity: 1,
            transform: "scale(1, 1)"
          },
          offset: null
        },
        timings: "120ms cubic-bezier(0, 0, 0.2, 1)"
      },
      options: null
    }, {
      type: 1,
      expr: "* => void",
      animation: {
        type: 4,
        styles: {
          type: 6,
          styles: {
            opacity: 0
          },
          offset: null
        },
        timings: "100ms linear"
      },
      options: null
    }],
    options: {}
  }
};
export {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatOptgroup,
  MatOption,
  MatPrefix,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger,
  MatSuffix,
  matSelectAnimations
};
//# sourceMappingURL=@angular_material_select.js.map
