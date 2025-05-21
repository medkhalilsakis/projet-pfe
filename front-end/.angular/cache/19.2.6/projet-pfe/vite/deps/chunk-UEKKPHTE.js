import {
  ElementRef
} from "./chunk-OX42BNUF.js";

// node_modules/@angular/cdk/fesm2022/element-15999318.mjs
function coerceNumberProperty(value, fallbackValue = 0) {
  if (_isNumberValue(value)) {
    return Number(value);
  }
  return arguments.length === 2 ? fallbackValue : 0;
}
function _isNumberValue(value) {
  return !isNaN(parseFloat(value)) && !isNaN(Number(value));
}
function coerceElement(elementOrRef) {
  return elementOrRef instanceof ElementRef ? elementOrRef.nativeElement : elementOrRef;
}

// node_modules/@angular/cdk/fesm2022/array-6239d2f8.mjs
function coerceArray(value) {
  return Array.isArray(value) ? value : [value];
}

export {
  coerceNumberProperty,
  _isNumberValue,
  coerceElement,
  coerceArray
};
//# sourceMappingURL=chunk-UEKKPHTE.js.map
