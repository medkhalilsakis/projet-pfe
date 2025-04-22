import { BaseEditor } from './base-editor';
import { DiffEditorModel } from './types';
import * as i0 from "@angular/core";
export declare class DiffEditorComponent extends BaseEditor {
    private zone;
    _originalModel: DiffEditorModel;
    _modifiedModel: DiffEditorModel;
    set options(options: any);
    get options(): any;
    set originalModel(model: DiffEditorModel);
    set modifiedModel(model: DiffEditorModel);
    protected initMonaco(options: any, insideNg: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DiffEditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DiffEditorComponent, "ngx-monaco-diff-editor", never, { "options": { "alias": "options"; "required": false; }; "originalModel": { "alias": "originalModel"; "required": false; }; "modifiedModel": { "alias": "modifiedModel"; "required": false; }; }, {}, never, never, true, never>;
}
