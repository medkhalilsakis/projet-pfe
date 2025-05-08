import {
  MatFormFieldModule
} from "./chunk-43KOODV3.js";
import "./chunk-NBONYJLV.js";
import {
  MAT_ERROR,
  MAT_FORM_FIELD,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MAT_PREFIX,
  MAT_SUFFIX,
  MatError,
  MatFormField,
  MatFormFieldControl,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix,
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  getMatFormFieldPlaceholderConflictError
} from "./chunk-FCKI5K6A.js";
import "./chunk-RVLXO3ZP.js";
import "./chunk-7TNMODQY.js";
import "./chunk-L7XR6SHA.js";
import "./chunk-VHYMS3AZ.js";
import "./chunk-CRJ3UGH2.js";
import "./chunk-I552KFIZ.js";
import "./chunk-5ZCS3XSW.js";
import "./chunk-ILFL7PVG.js";
import "./chunk-CL5PO4BE.js";
import "./chunk-BQJA6DLE.js";
import "./chunk-MP6WR3IJ.js";
import "./chunk-W2EZSZM7.js";
import "./chunk-KLF5MC5X.js";
import "./chunk-W4IFAEUS.js";
import "./chunk-ACK7LRGH.js";
import "./chunk-UDPLCEPO.js";
import "./chunk-6VRWDFGJ.js";
import "./chunk-7A7NUGWB.js";
import "./chunk-Z35OHFZB.js";
import "./chunk-D4EDHXFA.js";
import "./chunk-EIB7IA3J.js";

// ../../../../node_modules/@angular/material/fesm2022/form-field.mjs
var matFormFieldAnimations = {
  // Represents:
  // trigger('transitionMessages', [
  //   // TODO(mmalerba): Use angular animations for label animation as well.
  //   state('enter', style({opacity: 1, transform: 'translateY(0%)'})),
  //   transition('void => enter', [
  //     style({opacity: 0, transform: 'translateY(-5px)'}),
  //     animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
  //   ]),
  // ])
  /** Animation that transitions the form field's error and hint messages. */
  transitionMessages: {
    type: 7,
    name: "transitionMessages",
    definitions: [{
      type: 0,
      name: "enter",
      styles: {
        type: 6,
        styles: {
          opacity: 1,
          transform: "translateY(0%)"
        },
        offset: null
      }
    }, {
      type: 1,
      expr: "void => enter",
      animation: [{
        type: 6,
        styles: {
          opacity: 0,
          transform: "translateY(-5px)"
        },
        offset: null
      }, {
        type: 4,
        styles: null,
        timings: "300ms cubic-bezier(0.55, 0, 0.55, 0.2)"
      }],
      options: null
    }],
    options: {}
  }
};
export {
  MAT_ERROR,
  MAT_FORM_FIELD,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MAT_PREFIX,
  MAT_SUFFIX,
  MatError,
  MatFormField,
  MatFormFieldControl,
  MatFormFieldModule,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix,
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  getMatFormFieldPlaceholderConflictError,
  matFormFieldAnimations
};
//# sourceMappingURL=@angular_material_form-field.js.map
