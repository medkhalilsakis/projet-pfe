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
} from "./chunk-R7IVL57E.js";
import "./chunk-3ER6CCPW.js";
import "./chunk-IQGKCD3P.js";
import "./chunk-V6F642EU.js";
import "./chunk-NC4AK3NL.js";
import "./chunk-NBONYJLV.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-3XE33G4Y.js";
import "./chunk-SAMJJKBZ.js";
import "./chunk-WNG6JGKW.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-F3VKZ75R.js";
import "./chunk-4B7MR3CB.js";
import "./chunk-4BR7NGDR.js";
import "./chunk-EH53XPPE.js";
import "./chunk-2E72TDDM.js";
import "./chunk-JDZRO6XO.js";
import "./chunk-POLDOCW2.js";
import "./chunk-CKH52ADW.js";
import "./chunk-UJVNNRKP.js";
import "./chunk-L7XR6SHA.js";
import "./chunk-NHNHQPQ2.js";
import "./chunk-PIGFQPHT.js";
import "./chunk-HL4OBYZU.js";
import "./chunk-GYFJVWTC.js";
import "./chunk-ZTAOYD4V.js";
import "./chunk-CRJ3UGH2.js";
import "./chunk-JMTV72V4.js";
import "./chunk-PFJWMSKA.js";
import "./chunk-OZCUGIYM.js";
import "./chunk-CV4GIMOM.js";
import "./chunk-MDVZNTXX.js";
import "./chunk-CL5PO4BE.js";
import "./chunk-BQJA6DLE.js";
import "./chunk-QNSSTPYH.js";
import "./chunk-W2EZSZM7.js";
import "./chunk-4JNB55KF.js";
import "./chunk-XD556UDT.js";
import "./chunk-PDQ4YO6Y.js";
import "./chunk-HQIOFWNL.js";
import "./chunk-XJ5GNUPQ.js";
import "./chunk-7FTWXQ5T.js";
import "./chunk-7AJXV5U5.js";
import "./chunk-3NZL6B4S.js";
import "./chunk-EIB7IA3J.js";

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
