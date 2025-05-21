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
} from "./chunk-ZQWRSZDP.js";
import "./chunk-GF6YI4UC.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-NOMII7YY.js";
import "./chunk-EUNGKNGI.js";
import "./chunk-4FVTXZZM.js";
import "./chunk-EE5UNK4Q.js";
import "./chunk-MQTSKLJA.js";
import "./chunk-K36M6R4S.js";
import "./chunk-X3YRDU3Q.js";
import "./chunk-SZS4RJEH.js";
import "./chunk-UQTJCWJ7.js";
import "./chunk-OIZAD6NR.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-HH2SV5HS.js";
import "./chunk-FFL4657A.js";
import "./chunk-SFXJRZX3.js";
import "./chunk-J4764EOD.js";
import "./chunk-OKN26JP6.js";
import "./chunk-CWTNI5AJ.js";
import "./chunk-6GKDYRLD.js";
import "./chunk-FTX4ZMEV.js";
import "./chunk-O5O2MMCC.js";
import "./chunk-F5YF3NDX.js";
import "./chunk-4RTR5ZGN.js";
import "./chunk-64OZWSNK.js";
import "./chunk-TRES2BGH.js";
import "./chunk-W3X7UHEN.js";
import "./chunk-ZTYKJ4DJ.js";
import "./chunk-HZB4SWLE.js";
import "./chunk-Q3DFFBJD.js";
import "./chunk-UEKKPHTE.js";
import "./chunk-AR56M6O2.js";
import "./chunk-B7K2NU42.js";
import "./chunk-5XOTK4BZ.js";
import "./chunk-OX42BNUF.js";
import "./chunk-6PBVBKNM.js";
import "./chunk-LE5FXKQ4.js";
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
