import {
  NG_VALUE_ACCESSOR
} from "./chunk-23BCR4ZP.js";
import "./chunk-ACK7LRGH.js";
import "./chunk-UDPLCEPO.js";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  KeyValueDiffers,
  NgModule,
  NgZone,
  Output,
  ViewChild,
  forwardRef,
  setClassMetadata,
  ɵɵProvidersFeature,
  ɵɵclassMapInterpolate1,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵloadQuery,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵtext,
  ɵɵviewQuery
} from "./chunk-6VRWDFGJ.js";
import "./chunk-Z35OHFZB.js";
import "./chunk-7A7NUGWB.js";
import "./chunk-D4EDHXFA.js";
import {
  __async
} from "./chunk-EIB7IA3J.js";

// ../../../../node_modules/@ctrl/ngx-codemirror/fesm2022/ctrl-ngx-codemirror.mjs
var _c0 = ["ref"];
function normalizeLineEndings(str) {
  if (!str) {
    return str;
  }
  return str.replace(/\r\n|\r/g, "\n");
}
var CodemirrorComponent = class _CodemirrorComponent {
  _differs;
  _ngZone;
  /* class applied to the created textarea */
  className = "";
  /* name applied to the created textarea */
  name = "codemirror";
  /* autofocus setting applied to the created textarea */
  autoFocus = false;
  /**
   * set options for codemirror
   * @link http://codemirror.net/doc/manual.html#config
   */
  set options(value) {
    this._options = value;
    if (!this._differ && value) {
      this._differ = this._differs.find(value).create();
    }
  }
  /* preserve previous scroll position after updating value */
  preserveScrollPosition = false;
  /* called when the text cursor is moved */
  cursorActivity = new EventEmitter();
  /* called when the editor is focused or loses focus */
  focusChange = new EventEmitter();
  /* called when the editor is scrolled */
  // eslint-disable-next-line @angular-eslint/no-output-native
  scroll = new EventEmitter();
  /* called when file(s) are dropped */
  // eslint-disable-next-line @angular-eslint/no-output-native
  drop = new EventEmitter();
  /* called when codeMirror instance is initiated on the component */
  codeMirrorLoaded = new EventEmitter();
  ref;
  value = "";
  disabled = false;
  isFocused = false;
  codeMirror;
  /**
   * either global variable or required library
   */
  _codeMirror;
  _differ;
  _options;
  constructor(_differs, _ngZone) {
    this._differs = _differs;
    this._ngZone = _ngZone;
  }
  get codeMirrorGlobal() {
    if (this._codeMirror) {
      return this._codeMirror;
    }
    this._codeMirror = typeof CodeMirror !== "undefined" ? CodeMirror : import("./codemirror-7KD2QU2W.js");
    return this._codeMirror;
  }
  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(() => __async(this, null, function* () {
      const codeMirrorObj = yield this.codeMirrorGlobal;
      const codeMirror = codeMirrorObj?.default ? codeMirrorObj.default : codeMirrorObj;
      this.codeMirror = codeMirror.fromTextArea(this.ref.nativeElement, this._options);
      this.codeMirror.on("cursorActivity", (cm) => this._ngZone.run(() => this.cursorActive(cm)));
      this.codeMirror.on("scroll", this.scrollChanged.bind(this));
      this.codeMirror.on("blur", () => this._ngZone.run(() => this.focusChanged(false)));
      this.codeMirror.on("focus", () => this._ngZone.run(() => this.focusChanged(true)));
      this.codeMirror.on("change", (cm, change) => this._ngZone.run(() => this.codemirrorValueChanged(cm, change)));
      this.codeMirror.on("drop", (cm, e) => {
        this._ngZone.run(() => this.dropFiles(cm, e));
      });
      this.codeMirror.setValue(this.value);
      this.codeMirrorLoaded.emit(this);
    }));
  }
  ngDoCheck() {
    if (!this._differ) {
      return;
    }
    const changes = this._differ.diff(this._options);
    if (changes) {
      changes.forEachChangedItem((option) => this.setOptionIfChanged(option.key, option.currentValue));
      changes.forEachAddedItem((option) => this.setOptionIfChanged(option.key, option.currentValue));
      changes.forEachRemovedItem((option) => this.setOptionIfChanged(option.key, option.currentValue));
    }
  }
  ngOnDestroy() {
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }
  codemirrorValueChanged(cm, change) {
    const cmVal = cm.getValue();
    if (this.value !== cmVal) {
      this.value = cmVal;
      this.onChange(this.value);
    }
  }
  setOptionIfChanged(optionName, newValue) {
    if (!this.codeMirror) {
      return;
    }
    this.codeMirror.setOption(optionName, newValue);
  }
  focusChanged(focused) {
    this.onTouched();
    this.isFocused = focused;
    this.focusChange.emit(focused);
  }
  scrollChanged(cm) {
    this.scroll.emit(cm.getScrollInfo());
  }
  cursorActive(cm) {
    this.cursorActivity.emit(cm);
  }
  dropFiles(cm, e) {
    this.drop.emit([cm, e]);
  }
  /** Implemented as part of ControlValueAccessor. */
  writeValue(value) {
    if (value === null || value === void 0) {
      return;
    }
    if (!this.codeMirror) {
      this.value = value;
      return;
    }
    const cur = this.codeMirror.getValue();
    if (value !== cur && normalizeLineEndings(cur) !== normalizeLineEndings(value)) {
      this.value = value;
      if (this.preserveScrollPosition) {
        const prevScrollPosition = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(this.value);
        this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else {
        this.codeMirror.setValue(this.value);
      }
    }
  }
  /** Implemented as part of ControlValueAccessor. */
  registerOnChange(fn) {
    this.onChange = fn;
  }
  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  /** Implemented as part of ControlValueAccessor. */
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
    this.setOptionIfChanged("readOnly", this.disabled);
  }
  /** Implemented as part of ControlValueAccessor. */
  onChange = (_) => {
  };
  /** Implemented as part of ControlValueAccessor. */
  onTouched = () => {
  };
  static ɵfac = function CodemirrorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CodemirrorComponent)(ɵɵdirectiveInject(KeyValueDiffers), ɵɵdirectiveInject(NgZone));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _CodemirrorComponent,
    selectors: [["ngx-codemirror"]],
    viewQuery: function CodemirrorComponent_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(_c0, 5);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.ref = _t.first);
      }
    },
    inputs: {
      className: "className",
      name: "name",
      autoFocus: "autoFocus",
      options: "options",
      preserveScrollPosition: "preserveScrollPosition"
    },
    outputs: {
      cursorActivity: "cursorActivity",
      focusChange: "focusChange",
      scroll: "scroll",
      drop: "drop",
      codeMirrorLoaded: "codeMirrorLoaded"
    },
    standalone: false,
    features: [ɵɵProvidersFeature([{
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => _CodemirrorComponent),
      multi: true
    }])],
    decls: 3,
    vars: 7,
    consts: [["ref", ""], ["autocomplete", "off", 3, "name", "autofocus"]],
    template: function CodemirrorComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "textarea", 1, 0);
        ɵɵtext(2, "    ");
        ɵɵelementEnd();
      }
      if (rf & 2) {
        ɵɵclassMapInterpolate1("ngx-codemirror ", ctx.className, "");
        ɵɵclassProp("ngx-codemirror--focused", ctx.isFocused);
        ɵɵproperty("name", ctx.name)("autofocus", ctx.autoFocus);
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CodemirrorComponent, [{
    type: Component,
    args: [{
      selector: "ngx-codemirror",
      template: `
    <textarea
      [name]="name"
      class="ngx-codemirror {{ className }}"
      [class.ngx-codemirror--focused]="isFocused"
      autocomplete="off"
      [autofocus]="autoFocus"
      #ref
    >
    </textarea>
  `,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CodemirrorComponent),
        multi: true
      }],
      preserveWhitespaces: false,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], function() {
    return [{
      type: KeyValueDiffers
    }, {
      type: NgZone
    }];
  }, {
    className: [{
      type: Input
    }],
    name: [{
      type: Input
    }],
    autoFocus: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    preserveScrollPosition: [{
      type: Input
    }],
    cursorActivity: [{
      type: Output
    }],
    focusChange: [{
      type: Output
    }],
    scroll: [{
      type: Output
    }],
    drop: [{
      type: Output
    }],
    codeMirrorLoaded: [{
      type: Output
    }],
    ref: [{
      type: ViewChild,
      args: ["ref"]
    }]
  });
})();
var CodemirrorModule = class _CodemirrorModule {
  static ɵfac = function CodemirrorModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CodemirrorModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _CodemirrorModule,
    declarations: [CodemirrorComponent],
    exports: [CodemirrorComponent]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CodemirrorModule, [{
    type: NgModule,
    args: [{
      exports: [CodemirrorComponent],
      declarations: [CodemirrorComponent]
    }]
  }], null, null);
})();
export {
  CodemirrorComponent,
  CodemirrorModule
};
//# sourceMappingURL=@ctrl_ngx-codemirror.js.map
