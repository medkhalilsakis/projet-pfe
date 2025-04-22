import { InjectionToken } from '@angular/core';
export declare const NGX_MONACO_EDITOR_CONFIG: InjectionToken<unknown>;
export interface NgxMonacoEditorConfig {
    baseUrl?: string;
    requireConfig?: {
        [key: string]: any;
    };
    defaultOptions?: {
        [key: string]: any;
    };
    monacoRequire?: Function;
    onMonacoLoad?: Function;
}
