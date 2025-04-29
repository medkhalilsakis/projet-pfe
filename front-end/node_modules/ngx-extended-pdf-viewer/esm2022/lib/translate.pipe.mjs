import { effect, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./pdf-notification-service";
export class TranslatePipe {
    PDFViewerApplication;
    constructor(notificationService) {
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
        });
    }
    transform(key, fallback) {
        return this.translate(key, fallback);
    }
    async translate(key, englishText) {
        while (!this.PDFViewerApplication) {
            console.log('waiting for PDFViewerApplication to translate ' + key);
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
        return this.PDFViewerApplication?.l10n.get(key, null, englishText);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: TranslatePipe, deps: [{ token: i1.PDFNotificationService }], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "17.3.12", ngImport: i0, type: TranslatePipe, name: "translate" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: TranslatePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'translate',
                }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlci9zcmMvbGliL3RyYW5zbGF0ZS5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQzs7O0FBTzVELE1BQU0sT0FBTyxhQUFhO0lBQ2hCLG9CQUFvQixDQUFvQztJQUNoRSxZQUFZLG1CQUEyQztRQUNyRCxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDdEUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQVcsRUFBRSxRQUFnQjtRQUNyQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQVcsRUFBRSxXQUFtQjtRQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDcEUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hEO1FBQ0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7d0dBbEJVLGFBQWE7c0dBQWIsYUFBYTs7NEZBQWIsYUFBYTtrQkFIekIsSUFBSTttQkFBQztvQkFDSixJQUFJLEVBQUUsV0FBVztpQkFDbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlZmZlY3QsIFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IElQREZWaWV3ZXJBcHBsaWNhdGlvbiB9IGZyb20gJy4vb3B0aW9ucy9wZGYtdmlld2VyLWFwcGxpY2F0aW9uJztcbmltcG9ydCB7IFBERk5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuL3BkZi1ub3RpZmljYXRpb24tc2VydmljZSc7XG5cbkBQaXBlKHtcbiAgbmFtZTogJ3RyYW5zbGF0ZScsXG59KVxuZXhwb3J0IGNsYXNzIFRyYW5zbGF0ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgcHJpdmF0ZSBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uIHwgdW5kZWZpbmVkO1xuICBjb25zdHJ1Y3Rvcihub3RpZmljYXRpb25TZXJ2aWNlOiBQREZOb3RpZmljYXRpb25TZXJ2aWNlKSB7XG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSBub3RpZmljYXRpb25TZXJ2aWNlLm9uUERGSlNJbml0U2lnbmFsKCk7XG4gICAgfSk7XG4gIH1cblxuICB0cmFuc2Zvcm0oa2V5OiBzdHJpbmcsIGZhbGxiYWNrOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZShrZXksIGZhbGxiYWNrKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyB0cmFuc2xhdGUoa2V5OiBzdHJpbmcsIGVuZ2xpc2hUZXh0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICAgIHdoaWxlICghdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgY29uc29sZS5sb2coJ3dhaXRpbmcgZm9yIFBERlZpZXdlckFwcGxpY2F0aW9uIHRvIHRyYW5zbGF0ZSAnICsga2V5KTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LmwxMG4uZ2V0KGtleSwgbnVsbCwgZW5nbGlzaFRleHQpO1xuICB9XG59XG4iXX0=