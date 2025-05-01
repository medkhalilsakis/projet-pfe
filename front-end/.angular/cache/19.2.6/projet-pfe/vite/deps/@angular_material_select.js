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
} from "./chunk-JTG7HNYP.js";
import "./chunk-PQFXWTMM.js";
import "./chunk-K7LSE7NY.js";
import "./chunk-OIZAD6NR.js";
import "./chunk-UUU5Y7CJ.js";
import "./chunk-WHEY3V6U.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-OHG5YRVU.js";
import "./chunk-L2NP5MZP.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-NLMIARAN.js";
import "./chunk-3JZBTBBT.js";
import "./chunk-LDO5QN22.js";
import "./chunk-SZS4RJEH.js";
import "./chunk-IEHWHGF3.js";
import "./chunk-INR4MFGU.js";
import "./chunk-ZD6VDJ2Y.js";
import "./chunk-5DM6PMI5.js";
import "./chunk-F5YF3NDX.js";
import "./chunk-TRES2BGH.js";
import "./chunk-KOL5O2LZ.js";
import "./chunk-IIFJJURR.js";
import "./chunk-UDU42JBG.js";
import "./chunk-LNM4UB6J.js";
import "./chunk-IWMXQNEG.js";
import "./chunk-CIGKH54X.js";
import "./chunk-HNVHM5KX.js";
import "./chunk-IR3DEEEC.js";
import "./chunk-SXUFKUMM.js";
import "./chunk-TS5AS7EZ.js";
import "./chunk-TI5DDNAW.js";
import "./chunk-M3HR6BUY.js";
import "./chunk-IIYS6WIB.js";
import "./chunk-4CP5SG2U.js";
import "./chunk-DZBF2YG3.js";
import "./chunk-MOXYW7FB.js";
import "./chunk-77DJFO7O.js";
import "./chunk-6JKX2N6V.js";
import "./chunk-24KVZAYN.js";
import "./chunk-7SGOSYYL.js";
import "./chunk-WPM5VTLQ.js";
import "./chunk-PEBH6BBU.js";
import "./chunk-4S3KYZTJ.js";
import "./chunk-EIB7IA3J.js";

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
