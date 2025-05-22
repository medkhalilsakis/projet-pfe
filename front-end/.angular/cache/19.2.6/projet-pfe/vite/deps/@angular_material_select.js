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
} from "./chunk-2KXJIHXH.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-ZDOTPSJN.js";
import "./chunk-3NBCEUDY.js";
import "./chunk-A5FYI75V.js";
import "./chunk-2TTTAD5E.js";
import "./chunk-KBWXQVIC.js";
import "./chunk-NBONYJLV.js";
import "./chunk-4BR7NGDR.js";
import "./chunk-EH53XPPE.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-66YS4LWA.js";
import "./chunk-PF7SKCH7.js";
import "./chunk-S3SPKAXS.js";
import "./chunk-XZP2LARO.js";
import "./chunk-BJAEETM5.js";
import "./chunk-HSPIDV7K.js";
import "./chunk-LY4FRZ52.js";
import "./chunk-WY4OEECB.js";
import "./chunk-6GVZNFY7.js";
import "./chunk-L7XR6SHA.js";
import "./chunk-CL5PO4BE.js";
import "./chunk-OZCUGIYM.js";
import "./chunk-HL4OBYZU.js";
import "./chunk-MEPKY7E4.js";
import "./chunk-2CR37OBE.js";
import "./chunk-CRJ3UGH2.js";
import "./chunk-MDVZNTXX.js";
import "./chunk-NHNHQPQ2.js";
import "./chunk-ULRJ55HP.js";
import "./chunk-BQJA6DLE.js";
import "./chunk-W2EZSZM7.js";
import "./chunk-WQR4C6P2.js";
import "./chunk-7CYPKUFL.js";
import "./chunk-JHKC6GFS.js";
import "./chunk-4DUXHB66.js";
import "./chunk-5VNGECB6.js";
import "./chunk-HLW64XJ2.js";
import "./chunk-RMAPZK7J.js";
import "./chunk-E7SVHDR4.js";
import "./chunk-IE2UKDNC.js";
import "./chunk-7AJXV5U5.js";
import "./chunk-7FTWXQ5T.js";
import "./chunk-3NZL6B4S.js";
import "./chunk-KBUIKKCC.js";

// ../../../../node_modules/@angular/material/fesm2022/select.mjs
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
