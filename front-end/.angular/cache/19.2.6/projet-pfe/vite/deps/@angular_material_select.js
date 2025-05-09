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
} from "./chunk-NPGP7U45.js";
import "./chunk-4FVTXZZM.js";
import "./chunk-JMNRDFPY.js";
import "./chunk-B34WWRBM.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-2JPRKJFO.js";
import "./chunk-AAHVJKRH.js";
import "./chunk-DON524FE.js";
import "./chunk-7BNQ6ESY.js";
import "./chunk-OIZAD6NR.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-SQNXIMYA.js";
import "./chunk-FFL4657A.js";
import "./chunk-GF6YI4UC.js";
import "./chunk-SA4PQ26I.js";
import "./chunk-X3YRDU3Q.js";
import "./chunk-SZS4RJEH.js";
import "./chunk-J4764EOD.js";
import "./chunk-OKN26JP6.js";
import "./chunk-HXX6ZPSJ.js";
import "./chunk-BOXKJXXN.js";
import "./chunk-MGSBZER5.js";
import "./chunk-O5O2MMCC.js";
import "./chunk-F5YF3NDX.js";
import "./chunk-4RTR5ZGN.js";
import "./chunk-FTX4ZMEV.js";
import "./chunk-TRES2BGH.js";
import "./chunk-B7PGFC6G.js";
import "./chunk-64OZWSNK.js";
import "./chunk-UEKKPHTE.js";
import "./chunk-ZTYKJ4DJ.js";
import "./chunk-EAY3H47J.js";
import "./chunk-M2NBRYP2.js";
import "./chunk-6CFITZRG.js";
import "./chunk-SR3VEXE3.js";
import "./chunk-OX42BNUF.js";
import "./chunk-LE5FXKQ4.js";
import "./chunk-6PBVBKNM.js";
import "./chunk-INKKGWHP.js";
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
