import { ControlValueAccessor } from '@angular/forms';
import { BaseEditor } from './base-editor';
import { NgxEditorModel } from './types';
import * as i0 from "@angular/core";
export declare class EditorComponent extends BaseEditor implements ControlValueAccessor {
    private zone;
    private _value;
    propagateChange: (_: any) => void;
    onTouched: () => void;
    set options(options: any);
    get options(): any;
    set model(model: NgxEditorModel);
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    protected initMonaco(options: any, insideNg: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EditorComponent, "ngx-monaco-editor", never, { "options": { "alias": "options"; "required": false; }; "model": { "alias": "model"; "required": false; }; }, {}, never, never, true, never>;
}
