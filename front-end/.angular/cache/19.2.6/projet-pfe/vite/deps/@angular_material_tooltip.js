import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MatTooltip,
  MatTooltipModule,
  SCROLL_THROTTLE_MS,
  TOOLTIP_PANEL_CLASS,
  TooltipComponent,
  getMatTooltipInvalidPositionError
} from "./chunk-L6YZLJDG.js";
import "./chunk-IQGKCD3P.js";
import "./chunk-XUL36GCJ.js";
import "./chunk-V6F642EU.js";
import "./chunk-4BR7NGDR.js";
import "./chunk-UJVNNRKP.js";
import "./chunk-L7XR6SHA.js";
import "./chunk-PIGFQPHT.js";
import "./chunk-HL4OBYZU.js";
import "./chunk-GYFJVWTC.js";
import "./chunk-ZTAOYD4V.js";
import "./chunk-CRJ3UGH2.js";
import "./chunk-JMTV72V4.js";
import "./chunk-PFJWMSKA.js";
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

// ../../../../node_modules/@angular/material/fesm2022/tooltip.mjs
var matTooltipAnimations = {
  // Represents:
  // trigger('state', [
  //   state('initial, void, hidden', style({opacity: 0, transform: 'scale(0.8)'})),
  //   state('visible', style({transform: 'scale(1)'})),
  //   transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
  //   transition('* => hidden', animate('75ms cubic-bezier(0.4, 0, 1, 1)')),
  // ])
  /** Animation that transitions a tooltip in and out. */
  tooltipState: {
    type: 7,
    name: "state",
    definitions: [{
      type: 0,
      name: "initial, void, hidden",
      styles: {
        type: 6,
        styles: {
          opacity: 0,
          transform: "scale(0.8)"
        },
        offset: null
      }
    }, {
      type: 0,
      name: "visible",
      styles: {
        type: 6,
        styles: {
          transform: "scale(1)"
        },
        offset: null
      }
    }, {
      type: 1,
      expr: "* => visible",
      animation: {
        type: 4,
        styles: null,
        timings: "150ms cubic-bezier(0, 0, 0.2, 1)"
      },
      options: null
    }, {
      type: 1,
      expr: "* => hidden",
      animation: {
        type: 4,
        styles: null,
        timings: "75ms cubic-bezier(0.4, 0, 1, 1)"
      },
      options: null
    }],
    options: {}
  }
};
export {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MatTooltip,
  MatTooltipModule,
  SCROLL_THROTTLE_MS,
  TOOLTIP_PANEL_CLASS,
  TooltipComponent,
  getMatTooltipInvalidPositionError,
  matTooltipAnimations
};
//# sourceMappingURL=@angular_material_tooltip.js.map
