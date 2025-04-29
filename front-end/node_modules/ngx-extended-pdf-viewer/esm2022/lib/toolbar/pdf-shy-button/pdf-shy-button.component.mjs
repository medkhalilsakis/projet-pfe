import { Component, ContentChild, Input, ViewChild, effect } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./pdf-shy-button-service";
import * as i2 from "@angular/platform-browser";
import * as i3 from "../../pdf-notification-service";
import * as i4 from "../../pdf-csp-policy.service";
export class PdfShyButtonComponent {
    pdfShyButtonServiceService;
    sanitizer;
    renderer;
    pdfCspPolicyService;
    primaryToolbarId;
    secondaryMenuId;
    cssClass = 'invisible';
    eventBusName = undefined;
    l10nId;
    l10nLabel;
    title;
    toggled;
    disabled;
    order;
    action = undefined;
    closeOnClick = true;
    onlySecondaryMenu = false;
    PDFViewerApplication;
    renderContent = false;
    buttonRef;
    nestedContent = null;
    _imageHtml;
    get imageHtml() {
        if (this._imageHtml) {
            // allow non-literal svg tags (sanitized in the setter)
            return this.sanitizer.bypassSecurityTrustHtml(this._imageHtml); // NOSONAR
        }
        return undefined;
    }
    set image(value) {
        const svgTags = [
            // 'a' is not allowed!
            'animate',
            'animateMotion',
            'animateTransform',
            'audio',
            'canvas',
            'circle',
            'clipPath',
            'defs',
            'desc',
            'discard',
            'ellipse',
            'feBlend',
            'feColorMatrix',
            'feComponentTransfer',
            'feComposite',
            'feConvolveMatrix',
            'feDiffuseLighting',
            'feDisplacementMap',
            'feDistantLight',
            'feDropShadow',
            'feFlood',
            'feFuncA',
            'feFuncB',
            'feFuncG',
            'feFuncR',
            'feGaussianBlur',
            'feImage',
            'feMerge',
            'feMergeNode',
            'feMorphology',
            'feOffset',
            'fePointLight',
            'feSpecularLighting',
            'feSpotLight',
            'feTile',
            'feTurbulence',
            'filter',
            'foreignObject',
            'g',
            'iframe',
            'image',
            'line',
            'linearGradient',
            'marker',
            'mask',
            'metadata',
            'mpath',
            'path',
            'pattern',
            'polygon',
            'polyline',
            'radialGradient',
            'rect',
            'script',
            'set',
            'stop',
            'style',
            'svg',
            'switch',
            'symbol',
            'text',
            'textPath',
            'title',
            'tspan',
            'unknown',
            'use',
            'video',
            'view',
        ];
        // only <svg> and SVG tags are allowed
        const tags = value.split('<').filter((tag) => tag.length > 0);
        const legal = tags.every((tag) => tag.startsWith('svg') || tag.startsWith('/') || svgTags.includes(tag.split(/\s|>/)[0]));
        if (!legal) {
            throw new Error('Illegal image for PDFShyButton. Only SVG images are allowed. Please use only the tags <svg> and <path>. ' + value);
        }
        this._imageHtml = this.pdfCspPolicyService.sanitizeHTML(value);
    }
    constructor(pdfShyButtonServiceService, sanitizer, renderer, notificationService, pdfCspPolicyService) {
        this.pdfShyButtonServiceService = pdfShyButtonServiceService;
        this.sanitizer = sanitizer;
        this.renderer = renderer;
        this.pdfCspPolicyService = pdfCspPolicyService;
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
        });
    }
    ngAfterViewInit() {
        this.updateButtonImage();
    }
    ngOnInit() {
        this.pdfShyButtonServiceService.add(this);
    }
    ngOnChanges(changes) {
        this.pdfShyButtonServiceService.update(this);
    }
    onClick(htmlEvent) {
        if (htmlEvent instanceof KeyboardEvent && htmlEvent.key !== 'Enter' && htmlEvent.key !== ' ') {
            return;
        }
        if (this.action) {
            this.action(htmlEvent, false);
            htmlEvent.preventDefault();
        }
        else if (this.eventBusName) {
            this.PDFViewerApplication?.eventBus.dispatch(this.eventBusName);
            htmlEvent.preventDefault();
        }
    }
    updateButtonImage() {
        if (this.buttonRef) {
            const el = this.buttonRef.nativeElement;
            if (this._imageHtml) {
                const temp = this.renderer.createElement('div');
                this.pdfCspPolicyService.addTrustedHTML(temp, this._imageHtml);
                const image = temp.children[0];
                if (!el.innerHTML.includes(image.innerHTML)) {
                    // if using SSR, the HTML code may already be there
                    this.renderer.appendChild(el, image);
                }
            }
            else {
                const childNodes = el.childNodes;
                for (let child of childNodes) {
                    this.renderer.removeChild(el, child);
                }
            }
        }
    }
    ngAfterContentInit() {
        if (this.primaryToolbarId === 'nestedComponent') {
            this.renderContent = !!this.nestedContent;
            console.log('renderContent', this.renderContent);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfShyButtonComponent, deps: [{ token: i1.PdfShyButtonService }, { token: i2.DomSanitizer }, { token: i0.Renderer2 }, { token: i3.PDFNotificationService }, { token: i4.PdfCspPolicyService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.3.12", type: PdfShyButtonComponent, selector: "pdf-shy-button", inputs: { primaryToolbarId: "primaryToolbarId", secondaryMenuId: "secondaryMenuId", cssClass: "cssClass", eventBusName: "eventBusName", l10nId: "l10nId", l10nLabel: "l10nLabel", title: "title", toggled: "toggled", disabled: "disabled", order: "order", action: "action", closeOnClick: "closeOnClick", onlySecondaryMenu: "onlySecondaryMenu", image: "image" }, queries: [{ propertyName: "nestedContent", first: true, predicate: ["nestedContent"], descendants: true }], viewQueries: [{ propertyName: "buttonRef", first: true, predicate: ["buttonRef"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "@if (!onlySecondaryMenu) {\n@if (nestedContent) {\n<span (click)=\"onClick($event)\" onKeyDown=\"onClick($event)\" [class]=\"cssClass\">\n  <ng-content></ng-content>\n</span>\n}\n@else {\n<button type=\"button\" [id]=\"primaryToolbarId\" class=\"toolbarButton\" [class]=\"cssClass\" [title]=\"title\"\n  [attr.data-l10n-id]=\"l10nId\" [class.toggled]=\"toggled\" [disabled]=\"disabled\" (click)=\"onClick($event)\"\n  [attr.aria-label]=\"title\" #buttonRef></button>\n}\n}", styles: [".hidden,.always-in-secondary-menu,.visibleXXSView,.visibleTinyView,.visibleSmallView,.visibleMediumView,.visibleLargeView,.visibleXLView,.visibleXXLView{display:none}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfShyButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-shy-button', template: "@if (!onlySecondaryMenu) {\n@if (nestedContent) {\n<span (click)=\"onClick($event)\" onKeyDown=\"onClick($event)\" [class]=\"cssClass\">\n  <ng-content></ng-content>\n</span>\n}\n@else {\n<button type=\"button\" [id]=\"primaryToolbarId\" class=\"toolbarButton\" [class]=\"cssClass\" [title]=\"title\"\n  [attr.data-l10n-id]=\"l10nId\" [class.toggled]=\"toggled\" [disabled]=\"disabled\" (click)=\"onClick($event)\"\n  [attr.aria-label]=\"title\" #buttonRef></button>\n}\n}", styles: [".hidden,.always-in-secondary-menu,.visibleXXSView,.visibleTinyView,.visibleSmallView,.visibleMediumView,.visibleLargeView,.visibleXLView,.visibleXXLView{display:none}\n"] }]
        }], ctorParameters: () => [{ type: i1.PdfShyButtonService }, { type: i2.DomSanitizer }, { type: i0.Renderer2 }, { type: i3.PDFNotificationService }, { type: i4.PdfCspPolicyService }], propDecorators: { primaryToolbarId: [{
                type: Input
            }], secondaryMenuId: [{
                type: Input
            }], cssClass: [{
                type: Input
            }], eventBusName: [{
                type: Input
            }], l10nId: [{
                type: Input
            }], l10nLabel: [{
                type: Input
            }], title: [{
                type: Input
            }], toggled: [{
                type: Input
            }], disabled: [{
                type: Input
            }], order: [{
                type: Input
            }], action: [{
                type: Input
            }], closeOnClick: [{
                type: Input
            }], onlySecondaryMenu: [{
                type: Input
            }], buttonRef: [{
                type: ViewChild,
                args: ['buttonRef', { static: false }]
            }], nestedContent: [{
                type: ContentChild,
                args: ['nestedContent', { static: false }]
            }], image: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLXNoeS1idXR0b24uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi90b29sYmFyL3BkZi1zaHktYnV0dG9uL3BkZi1zaHktYnV0dG9uLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtc2h5LWJ1dHRvbi9wZGYtc2h5LWJ1dHRvbi5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQW1DLFNBQVMsRUFBRSxZQUFZLEVBQWMsS0FBSyxFQUFnQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7Ozs7QUFhN0osTUFBTSxPQUFPLHFCQUFxQjtJQThJdEI7SUFDQTtJQUNBO0lBRUE7SUFoSkgsZ0JBQWdCLENBQVM7SUFHekIsZUFBZSxDQUFTO0lBR3hCLFFBQVEsR0FBdUIsV0FBVyxDQUFDO0lBRzNDLFlBQVksR0FBdUIsU0FBUyxDQUFDO0lBRzdDLE1BQU0sQ0FBUztJQUdmLFNBQVMsQ0FBUztJQUdsQixLQUFLLENBQVM7SUFHZCxPQUFPLENBQVU7SUFHakIsUUFBUSxDQUFVO0lBR2xCLEtBQUssQ0FBUztJQUdkLE1BQU0sR0FBMEUsU0FBUyxDQUFDO0lBRzFGLFlBQVksR0FBWSxJQUFJLENBQUM7SUFHN0IsaUJBQWlCLEdBQVksS0FBSyxDQUFDO0lBRWxDLG9CQUFvQixDQUFvQztJQUV6RCxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBRWMsU0FBUyxDQUFhO0lBRWYsYUFBYSxHQUFzQixJQUFJLENBQUM7SUFFbEYsVUFBVSxDQUFxQjtJQUV2QyxJQUFXLFNBQVM7UUFDbEIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLHVEQUF1RDtZQUN2RCxPQUFPLElBQUks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c0JBQTlELFlBQVk7dUJBQUMsZUFBZSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTtnQkFhckMsS0FBSztzQkFEZixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkNoYW5nZXMsIE9uSW5pdCwgUmVuZGVyZXIyLCBWaWV3Q2hpbGQsIGVmZmVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyLCBTYWZlSHRtbCB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgSVBERlZpZXdlckFwcGxpY2F0aW9uIH0gZnJvbSAnLi4vLi4vb3B0aW9ucy9wZGYtdmlld2VyLWFwcGxpY2F0aW9uJztcbmltcG9ydCB7IFBkZkNzcFBvbGljeVNlcnZpY2UgfSBmcm9tICcuLi8uLi9wZGYtY3NwLXBvbGljeS5zZXJ2aWNlJztcbmltcG9ydCB7IFBERk5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi9wZGYtbm90aWZpY2F0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzcG9uc2l2ZUNTU0NsYXNzIH0gZnJvbSAnLi4vLi4vcmVzcG9uc2l2ZS12aXNpYmlsaXR5JztcbmltcG9ydCB7IFBkZlNoeUJ1dHRvblNlcnZpY2UgfSBmcm9tICcuL3BkZi1zaHktYnV0dG9uLXNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwZGYtc2h5LWJ1dHRvbicsXG4gIHN0eWxlVXJsczogWycuL3BkZi1zaHktYnV0dG9uLmNvbXBvbmVudC5zY3NzJ10sXG4gIHRlbXBsYXRlVXJsOiAnLi9wZGYtc2h5LWJ1dHRvbi5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIFBkZlNoeUJ1dHRvbkNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBBZnRlclZpZXdJbml0LCBBZnRlckNvbnRlbnRJbml0IHtcbiAgQElucHV0KClcbiAgcHVibGljIHByaW1hcnlUb29sYmFySWQ6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2Vjb25kYXJ5TWVudUlkOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGNzc0NsYXNzOiBSZXNwb25zaXZlQ1NTQ2xhc3MgPSAnaW52aXNpYmxlJztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgZXZlbnRCdXNOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGwxMG5JZDogc3RyaW5nO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBsMTBuTGFiZWw6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgdGl0bGU6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgdG9nZ2xlZDogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgcHVibGljIG9yZGVyOiBudW1iZXI7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGFjdGlvbjogKChodG1sRXZlbnQ/OiBFdmVudCwgaXNTZWNvbmRhcnlNZW51ZT86IGJvb2xlYW4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjbG9zZU9uQ2xpY2s6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBvbmx5U2Vjb25kYXJ5TWVudTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbiB8IHVuZGVmaW5lZDtcblxuICBwdWJsaWMgcmVuZGVyQ29udGVudCA9IGZhbHNlO1xuXG4gIEBWaWV3Q2hpbGQoJ2J1dHRvblJlZicsIHsgc3RhdGljOiBmYWxzZSB9KSBidXR0b25SZWY6IEVsZW1lbnRSZWY7XG5cbiAgQENvbnRlbnRDaGlsZCgnbmVzdGVkQ29udGVudCcsIHsgc3RhdGljOiBmYWxzZSB9KSBuZXN0ZWRDb250ZW50OiBFbGVtZW50UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfaW1hZ2VIdG1sOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgcHVibGljIGdldCBpbWFnZUh0bWwoKTogc3RyaW5nIHwgU2FmZUh0bWwgfCB1bmRlZmluZWQge1xuICAgIGlmICh0aGlzLl9pbWFnZUh0bWwpIHtcbiAgICAgIC8vIGFsbG93IG5vbi1saXRlcmFsIHN2ZyB0YWdzIChzYW5pdGl6ZWQgaW4gdGhlIHNldHRlcilcbiAgICAgIHJldHVybiB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0SHRtbCh0aGlzLl9pbWFnZUh0bWwpOyAvLyBOT1NPTkFSXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBASW5wdXQoKVxuICBwdWJsaWMgc2V0IGltYWdlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzdmdUYWdzID0gW1xuICAgICAgLy8gJ2EnIGlzIG5vdCBhbGxvd2VkIVxuICAgICAgJ2FuaW1hdGUnLFxuICAgICAgJ2FuaW1hdGVNb3Rpb24nLFxuICAgICAgJ2FuaW1hdGVUcmFuc2Zvcm0nLFxuICAgICAgJ2F1ZGlvJyxcbiAgICAgICdjYW52YXMnLFxuICAgICAgJ2NpcmNsZScsXG4gICAgICAnY2xpcFBhdGgnLFxuICAgICAgJ2RlZnMnLFxuICAgICAgJ2Rlc2MnLFxuICAgICAgJ2Rpc2NhcmQnLFxuICAgICAgJ2VsbGlwc2UnLFxuICAgICAgJ2ZlQmxlbmQnLFxuICAgICAgJ2ZlQ29sb3JNYXRyaXgnLFxuICAgICAgJ2ZlQ29tcG9uZW50VHJhbnNmZXInLFxuICAgICAgJ2ZlQ29tcG9zaXRlJyxcbiAgICAgICdmZUNvbnZvbHZlTWF0cml4JyxcbiAgICAgICdmZURpZmZ1c2VMaWdodGluZycsXG4gICAgICAnZmVEaXNwbGFjZW1lbnRNYXAnLFxuICAgICAgJ2ZlRGlzdGFudExpZ2h0JyxcbiAgICAgICdmZURyb3BTaGFkb3cnLFxuICAgICAgJ2ZlRmxvb2QnLFxuICAgICAgJ2ZlRnVuY0EnLFxuICAgICAgJ2ZlRnVuY0InLFxuICAgICAgJ2ZlRnVuY0cnLFxuICAgICAgJ2ZlRnVuY1InLFxuICAgICAgJ2ZlR2F1c3NpYW5CbHVyJyxcbiAgICAgICdmZUltYWdlJyxcbiAgICAgICdmZU1lcmdlJyxcbiAgICAgICdmZU1lcmdlTm9kZScsXG4gICAgICAnZmVNb3JwaG9sb2d5JyxcbiAgICAgICdmZU9mZnNldCcsXG4gICAgICAnZmVQb2ludExpZ2h0JyxcbiAgICAgICdmZVNwZWN1bGFyTGlnaHRpbmcnLFxuICAgICAgJ2ZlU3BvdExpZ2h0JyxcbiAgICAgICdmZVRpbGUnLFxuICAgICAgJ2ZlVHVyYnVsZW5jZScsXG4gICAgICAnZmlsdGVyJyxcbiAgICAgICdmb3JlaWduT2JqZWN0JyxcbiAgICAgICdnJyxcbiAgICAgICdpZnJhbWUnLFxuICAgICAgJ2ltYWdlJyxcbiAgICAgICdsaW5lJyxcbiAgICAgICdsaW5lYXJHcmFkaWVudCcsXG4gICAgICAnbWFya2VyJyxcbiAgICAgICdtYXNrJyxcbiAgICAgICdtZXRhZGF0YScsXG4gICAgICAnbXBhdGgnLFxuICAgICAgJ3BhdGgnLFxuICAgICAgJ3BhdHRlcm4nLFxuICAgICAgJ3BvbHlnb24nLFxuICAgICAgJ3BvbHlsaW5lJyxcbiAgICAgICdyYWRpYWxHcmFkaWVudCcsXG4gICAgICAncmVjdCcsXG4gICAgICAnc2NyaXB0JyxcbiAgICAgICdzZXQnLFxuICAgICAgJ3N0b3AnLFxuICAgICAgJ3N0eWxlJyxcbiAgICAgICdzdmcnLFxuICAgICAgJ3N3aXRjaCcsXG4gICAgICAnc3ltYm9sJyxcbiAgICAgICd0ZXh0JyxcbiAgICAgICd0ZXh0UGF0aCcsXG4gICAgICAndGl0bGUnLFxuICAgICAgJ3RzcGFuJyxcbiAgICAgICd1bmtub3duJyxcbiAgICAgICd1c2UnLFxuICAgICAgJ3ZpZGVvJyxcbiAgICAgICd2aWV3JyxcbiAgICBdO1xuXG4gICAgLy8gb25seSA8c3ZnPiBhbmQgU1ZHIHRhZ3MgYXJlIGFsbG93ZWRcbiAgICBjb25zdCB0YWdzID0gdmFsdWUuc3BsaXQoJzwnKS5maWx0ZXIoKHRhZykgPT4gdGFnLmxlbmd0aCA+IDApO1xuICAgIGNvbnN0IGxlZ2FsID0gdGFncy5ldmVyeSgodGFnKSA9PiB0YWcuc3RhcnRzV2l0aCgnc3ZnJykgfHwgdGFnLnN0YXJ0c1dpdGgoJy8nKSB8fCBzdmdUYWdzLmluY2x1ZGVzKHRhZy5zcGxpdCgvXFxzfD4vKVswXSkpO1xuICAgIGlmICghbGVnYWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBpbWFnZSBmb3IgUERGU2h5QnV0dG9uLiBPbmx5IFNWRyBpbWFnZXMgYXJlIGFsbG93ZWQuIFBsZWFzZSB1c2Ugb25seSB0aGUgdGFncyA8c3ZnPiBhbmQgPHBhdGg+LiAnICsgdmFsdWUpO1xuICAgIH1cbiAgICB0aGlzLl9pbWFnZUh0bWwgPSB0aGlzLnBkZkNzcFBvbGljeVNlcnZpY2Uuc2FuaXRpemVIVE1MKHZhbHVlKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcGRmU2h5QnV0dG9uU2VydmljZVNlcnZpY2U6IFBkZlNoeUJ1dHRvblNlcnZpY2UsXG4gICAgcHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplcixcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgbm90aWZpY2F0aW9uU2VydmljZTogUERGTm90aWZpY2F0aW9uU2VydmljZSxcbiAgICBwcml2YXRlIHBkZkNzcFBvbGljeVNlcnZpY2U6IFBkZkNzcFBvbGljeVNlcnZpY2UsXG4gICkge1xuICAgIGVmZmVjdCgoKSA9PiB7XG4gICAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uID0gbm90aWZpY2F0aW9uU2VydmljZS5vblBERkpTSW5pdFNpZ25hbCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZUJ1dHRvbkltYWdlKCk7XG4gIH1cblxuICBwdWJsaWMgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5wZGZTaHlCdXR0b25TZXJ2aWNlU2VydmljZS5hZGQodGhpcyk7XG4gIH1cblxuICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgdGhpcy5wZGZTaHlCdXR0b25TZXJ2aWNlU2VydmljZS51cGRhdGUodGhpcyk7XG4gIH1cblxuICBwdWJsaWMgb25DbGljayhodG1sRXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKGh0bWxFdmVudCBpbnN0YW5jZW9mIEtleWJvYXJkRXZlbnQgJiYgaHRtbEV2ZW50LmtleSAhPT0gJ0VudGVyJyAmJiBodG1sRXZlbnQua2V5ICE9PSAnICcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hY3Rpb24pIHtcbiAgICAgIHRoaXMuYWN0aW9uKGh0bWxFdmVudCwgZmFsc2UpO1xuICAgICAgaHRtbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmV2ZW50QnVzTmFtZSkge1xuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uZXZlbnRCdXMuZGlzcGF0Y2godGhpcy5ldmVudEJ1c05hbWUpO1xuICAgICAgaHRtbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHVwZGF0ZUJ1dHRvbkltYWdlKCkge1xuICAgIGlmICh0aGlzLmJ1dHRvblJlZikge1xuICAgICAgY29uc3QgZWwgPSB0aGlzLmJ1dHRvblJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgaWYgKHRoaXMuX2ltYWdlSHRtbCkge1xuICAgICAgICBjb25zdCB0ZW1wID0gdGhpcy5yZW5kZXJlci5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5wZGZDc3BQb2xpY3lTZXJ2aWNlLmFkZFRydXN0ZWRIVE1MKHRlbXAsIHRoaXMuX2ltYWdlSHRtbCk7XG4gICAgICAgIGNvbnN0IGltYWdlID0gdGVtcC5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCFlbC5pbm5lckhUTUwuaW5jbHVkZXMoaW1hZ2UuaW5uZXJIVE1MKSkge1xuICAgICAgICAgIC8vIGlmIHVzaW5nIFNTUiwgdGhlIEhUTUwgY29kZSBtYXkgYWxyZWFkeSBiZSB0aGVyZVxuICAgICAgICAgIHRoaXMucmVuZGVyZXIuYXBwZW5kQ2hpbGQoZWwsIGltYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkTm9kZXMpIHtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNoaWxkKGVsLCBjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgaWYgKHRoaXMucHJpbWFyeVRvb2xiYXJJZCA9PT0gJ25lc3RlZENvbXBvbmVudCcpIHtcbiAgICAgIHRoaXMucmVuZGVyQ29udGVudCA9ICEhdGhpcy5uZXN0ZWRDb250ZW50O1xuICAgICAgY29uc29sZS5sb2coJ3JlbmRlckNvbnRlbnQnLCB0aGlzLnJlbmRlckNvbnRlbnQpO1xuICAgIH1cbiAgfVxufVxuIiwiQGlmICghb25seVNlY29uZGFyeU1lbnUpIHtcbkBpZiAobmVzdGVkQ29udGVudCkge1xuPHNwYW4gKGNsaWNrKT1cIm9uQ2xpY2soJGV2ZW50KVwiIG9uS2V5RG93bj1cIm9uQ2xpY2soJGV2ZW50KVwiIFtjbGFzc109XCJjc3NDbGFzc1wiPlxuICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG48L3NwYW4+XG59XG5AZWxzZSB7XG48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBbaWRdPVwicHJpbWFyeVRvb2xiYXJJZFwiIGNsYXNzPVwidG9vbGJhckJ1dHRvblwiIFtjbGFzc109XCJjc3NDbGFzc1wiIFt0aXRsZV09XCJ0aXRsZVwiXG4gIFthdHRyLmRhdGEtbDEwbi1pZF09XCJsMTBuSWRcIiBbY2xhc3MudG9nZ2xlZF09XCJ0b2dnbGVkXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm9uQ2xpY2soJGV2ZW50KVwiXG4gIFthdHRyLmFyaWEtbGFiZWxdPVwidGl0bGVcIiAjYnV0dG9uUmVmPjwvYnV0dG9uPlxufVxufSJdfQ==