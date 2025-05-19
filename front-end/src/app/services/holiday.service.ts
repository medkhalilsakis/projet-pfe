// holiday.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private nagerApi = 'https://date.nager.at/api/v3/PublicHolidays';
  private aladhanApi = 'https://api.aladhan.com/v1/gToHCalendar';

  constructor(private http: HttpClient) { }

  getAllHolidays(year: number): Observable<any[]> {
    return forkJoin({
      publicHolidays: this.http.get<any[]>(`${this.nagerApi}/${year}/TN`),
      islamicDates: this.http.get<any>(`${this.aladhanApi}/${year}/1?country=TN`)
    }).pipe(
      map(({publicHolidays, islamicDates}) => {
        const islamicHolidays = this.parseIslamicHolidays(islamicDates.data);
        return this.mergeAndSortHolidays(publicHolidays, islamicHolidays);
      }),
      catchError(error => {
        console.error('Error fetching holidays:', error);
        return of([]);
      })
    );
  }

  private parseIslamicHolidays(data: any[]): any[] {
    return data.filter(item => {
      const hijri = item.hijri;
      const date = new Date(item.gregorian.date);
      
      if (hijri.month.number === 9 && hijri.day === 1) {
        return { date, name: 'Start of Ramadan', type: 'islamic' };
      }
      if (hijri.month.number === 10 && hijri.day === 1) {
        return { date, name: 'Eid al-Fitr (3id Sa8ir)', type: 'islamic' };
      }
      if (hijri.month.number === 12 && hijri.day === 10) {
        return { date, name: 'Eid al-Adha (3id Kabir)', type: 'islamic' };
      }
      if (hijri.month.number === 1 && hijri.day === 1) {
        return { date, name: 'Islamic New Year (Ra2s el Sana el Hjriya)', type: 'islamic' };
      }
      if (hijri.month.number === 3 && hijri.day === 12) {
        return { date, name: 'Prophet\'s Birthday (Mawlid)', type: 'islamic' };
      }
      return false;
    }).filter(Boolean);
  }

  private mergeAndSortHolidays(publicHolidays: any[], islamicHolidays: any[]): any[] {
    const formattedPublic = publicHolidays.map(h => ({
      date: new Date(h.date),
      name: h.localName,
      type: 'public'
    }));

    const merged = [...formattedPublic, ...islamicHolidays];
    
    return merged.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}