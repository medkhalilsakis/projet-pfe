import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatOptgroup,
  MatOption,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-3LEHWTGX.js";
import "./chunk-QTMXNZOC.js";
import "./chunk-MGYG53CU.js";
import "./chunk-5NSNDALY.js";
import "./chunk-ESZMZSSW.js";
import "./chunk-ISNGNNBY.js";
import "./chunk-F76C7FSR.js";
import "./chunk-A4S2E6F4.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-OACOBN7I.js";
import "./chunk-3GY2WA63.js";
import "./chunk-M3GGAECP.js";
import "./chunk-AEVW6JXZ.js";
import "./chunk-S7AA4VUV.js";
import "./chunk-HMZU562N.js";
import "./chunk-UOWVZSGW.js";
import "./chunk-YEJILVHX.js";
import "./chunk-Q5BITV6E.js";
import "./chunk-TESDHES6.js";
import "./chunk-XSHXRMQE.js";
import "./chunk-SWVF6GUU.js";
import "./chunk-KKIF25KL.js";
import "./chunk-YXSG6ISY.js";
import "./chunk-I7V6ZGPU.js";
import "./chunk-6UBQ3CO5.js";
import "./chunk-UFTIKIU3.js";
import "./chunk-W5GJLPPS.js";
import "./chunk-UWVGUKEP.js";
import "./chunk-RS45677F.js";
import "./chunk-EFG7GNFH.js";
import "./chunk-OS5UTTE2.js";
import "./chunk-MD4MEXAA.js";
import "./chunk-CGJMYSBH.js";
import "./chunk-TYOVXHQK.js";
import "./chunk-EIB7IA3J.js";

// ../../../node_modules/@angular/material/fesm2022/select.mjs
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
