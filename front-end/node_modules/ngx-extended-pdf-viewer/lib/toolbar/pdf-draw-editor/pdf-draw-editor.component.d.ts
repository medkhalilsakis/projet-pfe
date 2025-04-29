import { ChangeDetectorRef } from '@angular/core';
import { PDFNotificationService } from '../../pdf-notification-service';
import { ResponsiveVisibility } from '../../responsive-visibility';
import * as i0 from "@angular/core";
export declare class PdfDrawEditorComponent {
    private notificationService;
    private cdr;
    show: ResponsiveVisibility;
    isSelected: boolean;
    private PDFViewerApplication;
    constructor(notificationService: PDFNotificationService, cdr: ChangeDetectorRef);
    private onPdfJsInit;
    onClick(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PdfDrawEditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PdfDrawEditorComponent, "pdf-draw-editor", never, { "show": { "alias": "show"; "required": false; }; }, {}, never, never, false, never>;
}
