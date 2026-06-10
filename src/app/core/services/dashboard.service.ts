import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardDto {
  totalUsers: number;
  totalNotices: number;
  activeNotices: number;
  inactiveNotices: number;
  monthlyNotices: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'https://localhost:7193/api/dashboard';
  
// private apiUrl = 'https://excise.cg.nic.in/backend/api/dashboard';
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardDto> {
    return this.http.get<DashboardDto>(this.apiUrl);
  }
}