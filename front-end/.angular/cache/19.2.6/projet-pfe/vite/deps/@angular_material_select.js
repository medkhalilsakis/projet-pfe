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
} from "./chunk-4LB7AAQD.js";
import "./chunk-GZYTFLPE.js";
import "./chunk-HQH2YOAR.js";
import "./chunk-JDHLUT2H.js";
import "./chunk-LHKW7GME.js";
import "./chunk-R77UGSZ6.js";
import "./chunk-NBONYJLV.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-DIMEC3AK.js";
import "./chunk-RVLXO3ZP.js";
import "./chunk-23BCR4ZP.js";
import "./chunk-HL4OBYZU.js";
import "./chunk-ZHR6Q7CV.js";
import "./chunk-QWI4VU44.js";
import "./chunk-V4VEXKX4.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-7JROEPP7.js";
import "./chunk-PUOFX3M5.js";
import "./chunk-4BR7NGDR.js";
import "./chunk-7FRSKMFS.js";
import "./chunk-HEL2DVTX.js";
import "./chunk-4ASKT4AX.js";
import "./chunk-5PS55DPC.js";
import "./chunk-7TNMODQY.js";
import "./chunk-L7XR6SHA.js";
import "./chunk-I4LF2DCS.js";
import "./chunk-CRJ3UGH2.js";
import "./chunk-NHNHQPQ2.js";
import "./chunk-5JX4UFB6.js";
import "./chunk-CXQEK6GQ.js";
import "./chunk-W2EZSZM7.js";
import "./chunk-ILFL7PVG.js";
import "./chunk-3DXSIXS2.js";
import "./chunk-KLF5MC5X.js";
import "./chunk-W4IFAEUS.js";
import "./chunk-ACK7LRGH.js";
import "./chunk-UDPLCEPO.js";
import "./chunk-6VRWDFGJ.js";
import "./chunk-Z35OHFZB.js";
import "./chunk-7A7NUGWB.js";
import "./chunk-D4EDHXFA.js";
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
