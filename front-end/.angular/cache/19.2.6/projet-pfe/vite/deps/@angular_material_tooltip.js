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
} from "./chunk-H4YAUVYX.js";
import "./chunk-A5FYI75V.js";
import "./chunk-4BR7NGDR.js";
import "./chunk-XUL36GCJ.js";
import "./chunk-S3SPKAXS.js";
import "./chunk-6GVZNFY7.js";
import "./chunk-L7XR6SHA.js";
import "./chunk-CL5PO4BE.js";
import "./chunk-HL4OBYZU.js";
import "./chunk-MEPKY7E4.js";
import "./chunk-2CR37OBE.js";
import "./chunk-CRJ3UGH2.js";
import "./chunk-MDVZNTXX.js";
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
