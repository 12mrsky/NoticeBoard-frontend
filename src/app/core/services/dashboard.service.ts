import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =========================
// Dashboard DTOs
// =========================

export interface DashboardModuleDto {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface ShopCountDto {
  cl: number;
  fl: number;
  clComposite: number;
  flComposite: number;
}

export interface DashboardDto {
  totalUsers: number;
  totalRevenue: number;

  license: DashboardModuleDto;
  trade: DashboardModuleDto;
  label: DashboardModuleDto;
  company: DashboardModuleDto;

  shopCounts: ShopCountDto;
  monthlyRevenue: number[];
}

// =========================
// License DTO
// =========================

export interface DashboardLicenseDto {
  licenseCategory: string;
  approved: number;
  reject: number;
  pending: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'https://localhost:7193/api/dashboard';

  // private apiUrl = 'https://excise.cg.nic.in/backend/api/dashboard';

  constructor(private http: HttpClient) {}

  // =========================
  // Dashboard
  // =========================

  getDashboard(financialYear: string): Observable<DashboardDto> {
    return this.http.get<DashboardDto>(
      `${this.apiUrl}?financialYear=${financialYear}`
    );
  }

  
  // =========================
  // License Management
  // =========================

getDashboardLicense(finYear: string) {
  return this.http.get<any[]>(
    `${this.apiUrl}/dashboard-license?finYear=${finYear}`
  );
}

getCompanyRegistration(finYear: string) {
  return this.http.get<any[]>(
    `${this.apiUrl}/company-registration?finYear=${finYear}`
  );
}

getBrandLabel(finYear: string) {
  return this.http.get<any[]>(
    `${this.apiUrl}/brand-label?finYear=${finYear}`
  );
}

getIMFLExport(finYear: string) {
  return this.http.get<any[]>(
    `${this.apiUrl}/imfl-export?finYear=${finYear}`
  );
}

getTotalShops(finYear: string) {
  return this.http.get<any[]>(
    `${this.apiUrl}/total-shops?finYear=${finYear}`
  );
}

getExciseRevenue(finYear: string) {
  return this.http.get<any[]>(
    `${this.apiUrl}/excise-revenue?finYear=${finYear}`
  );
}

getMonthwiseRevenue(finYear: string) {

  return this.http.get(
    `${this.apiUrl}/monthwise-revenue?finYear=${finYear}`
  );

}
}