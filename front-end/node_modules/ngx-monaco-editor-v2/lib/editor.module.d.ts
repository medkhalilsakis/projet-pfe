import { ModuleWithProviders } from '@angular/core';
import { NgxMonacoEditorConfig } from './config';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "./editor.component";
import * as i3 from "./diff-editor.component";
export declare class MonacoEditorModule {
    static forRoot(config?: NgxMonacoEditorConfig): ModuleWithProviders<MonacoEditorModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MonacoEditorModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MonacoEditorModule, never, [typeof i1.CommonModule, typeof i2.EditorComponent, typeof i3.DiffEditorComponent], [typeof i2.EditorComponent, typeof i3.DiffEditorComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MonacoEditorModule>;
}
export declare function provideMonacoEditor(config?: NgxMonacoEditorConfig): import("@angular/core").EnvironmentProviders;
