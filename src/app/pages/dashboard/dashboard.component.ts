import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexMarkers,
  ApexDataLabels,
  ApexGrid
} from 'ng-apexcharts';

import {
DashboardService,
DashboardDto
} from '../../core/services/dashboard.service';
import { serialize } from 'v8';

@Component({
selector: 'app-dashboard',
standalone: true,
imports: [
CommonModule,
FormsModule,
NgApexchartsModule
],
templateUrl: './dashboard.component.html',
styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

dashboard?: DashboardDto;
  licenseData: any[] = [];
companyData: any[] = [];
labelData: any[] = [];
tradeData: any[] = [];
shopData: any[] = [];
revenueData: any[] = [];
monthRevenueData: any[] = [];



userName = 'Admin';

// =========================
// Filters
// =========================

licenseType = 'all';
tradeType = 'import';
labelType = 'new';
companyType = 'fl';
summaryTab = 'license';
// =========================
// Financial Years
// =========================

generateFinancialYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  for (let i = currentYear - 3; i <= currentYear; i++) {
    years.push(`${i}-${i + 1}`);
  }

  return years;
}

financialYears = this.generateFinancialYears();
selectedFinancialYear = this.generateFinancialYears().slice(-1)[0];


//================ Donut Chart// =========================

donutSeries: number[] = [];

donutLabels = [
  'CL',
  'FL',
  'CL Composite',
  'FL Composite'
];

donutColors: string[] = [
'#22c55e',
'#ef4444',
'#f59e0b',
'#3b82f6'
];

donutChart: ApexChart = {
  type: 'donut',
  height: 360,
  toolbar: {
    show: false
  }
};

donutLegend: ApexLegend = {
  show: false
};

donutPlotOptions: ApexPlotOptions = {
pie: {
donut: {
size: '58%',
labels: {
show: true,
total: {
show: true,
label: 'Total',
color: '#0e0d0d'
}
}
}
}
};

donutResponsive: ApexResponsive[] = [
{
breakpoint: 768,
options: {
chart: {
height: 240
}
}
}
];
getPercentage(index: number): string {

  const total = this.donutSeries.reduce(
    (a, b) => a + b,
    0
  );

  if (!total) {
    return '0';
  }

  return (
    (this.donutSeries[index] / total) * 100
  ).toFixed(2);
}

// =========================
// Revenue Trend Chart
// =========================

barSeries: ApexAxisChartSeries = [
  {
    name: 'Revenue (Cr)',
    data: []
  }
];
barChart: ApexChart = {
  type: 'area',
  height: 450,

  zoom: {
    enabled: false
  },

  toolbar: {
    show: true,
    tools: {
      download: true,
      zoom: true,
      zoomin: true,
      zoomout: true,
      pan: true,
      reset: true
    }
  }
};

barStroke: ApexStroke = {
  curve: 'smooth',
  width: 4
};

barMarkers: ApexMarkers = {
  size: 5
};

barDataLabels: ApexDataLabels = {
  enabled: false
};

barGrid: ApexGrid = {
  borderColor: '#e5e7eb'
};

barYAxis: ApexYAxis = {
  title: {
    text: 'Revenue (Cr)'
  }
};

barXAxis: ApexXAxis = {
  categories: []
};
constructor(
  private dashboardService: DashboardService
) {}

ngOnInit(): void {


this.userName =
  localStorage.getItem('userName') || 'Admin';

this.loadAllDashboardData();


}

// =========================
// API Call
// =========================

loadDashboard(): void {

this.dashboardService
  .getDashboard(this.selectedFinancialYear)
    .subscribe({

next: (res: any) => {
        // console.log('Dashboard Response:', res);
// console.log('Month Revenue Data');
// console.table(this.monthRevenueData);
        this.dashboard = res;

        this.donutSeries = [
          res.shopCounts?.cl ?? 0,
          res.shopCounts?.fl ?? 0,
          res.shopCounts?.clComposite ?? 0,
          res.shopCounts?.flComposite ?? 0
        ];

        // console.log('Donut Series:', this.donutSeries);

        this.barSeries = [
          {
            name: 'Monthwise Revenue',
           data: res.monthlyRevenue || []
          }
        ];
      },

      error: (err) => {
        console.error('Dashboard API Error:', err);
      }

    });
}


// =========================  =========================

loadAllDashboardData(): void {

  // console.log(
  //   'Dashboard Loading...',
  //   this.selectedFinancialYear,
  //   new Date()
  // );

  forkJoin({

    license:
      this.dashboardService.getDashboardLicense(
        this.selectedFinancialYear
      ),

    company:
      this.dashboardService.getCompanyRegistration(
        this.selectedFinancialYear
      ),

    label:
      this.dashboardService.getBrandLabel(
        this.selectedFinancialYear
      ),

    trade:
      this.dashboardService.getIMFLExport(
        this.selectedFinancialYear
      ),

    shops:
      this.dashboardService.getTotalShops(
        this.selectedFinancialYear
      ),

    revenue:
      this.dashboardService.getExciseRevenue(
        this.selectedFinancialYear
      ),

monthRevenue:
  this.dashboardService.getMonthwiseRevenue(
    this.selectedFinancialYear
  )

  }).subscribe({

    next: (res: any) => {

  this.licenseData = res.license;
  this.companyData = res.company;
  this.labelData = res.label;
  this.tradeData = res.trade;
  this.shopData = res.shops;
  this.revenueData = res.revenue;
  this.monthRevenueData = res.monthRevenue;

  // =========================
  // Shop Distribution Donut
  // =========================

  this.donutSeries = [

    this.shopData.find(
      (x: any) => x.districtName === 'CL Shop Total'
    )?.shopCount || 0,

    this.shopData.find(
      (x: any) => x.districtName === 'Foreign Liquor Shop Total'
    )?.shopCount || 0,

    this.shopData.find(
      (x: any) => x.districtName === 'CL Composite Total'
    )?.shopCount || 0,

    this.shopData.find(
      (x: any) => x.districtName === 'FL Composite Total'
    )?.shopCount || 0

  ];

  // =========================
  // Monthwise Revenue Chart
  // =========================

this.barSeries = [
  {
    name: 'Revenue (Cr)',
    data: this.monthRevenueData.map(
      (x: any) => Number(x.revenueCr || 0)
    )
  }
];

this.barXAxis = {
  categories: this.monthRevenueData.map(
    (x: any) => x.monthName
  )
};

  // console.log('Dashboard Data', res);
  // console.log('Trade Data', this.tradeData);

},

    error: (err) => {
      console.error(err);
    }

  });
}



onFinancialYearChange(): void {


// console.log(
//   'Selected FY:',
//   this.selectedFinancialYear
// );

this.loadAllDashboardData();

}

today = new Date();

get totalRevenue(): number {
  return this.revenueData?.[0]?.totalRevenueCr ?? 0;
}

get targetRevenue(): number {
  return this.revenueData?.[0]?.targetRevenueCr ?? 3000;
}

get achievementPercent(): number {
  if (!this.targetRevenue) return 0;

  return Number(
    ((this.totalRevenue / this.targetRevenue) * 100).toFixed(2)
  );
}

get currentMonthRevenue(): number {

  if (!this.monthRevenueData?.length) {
    return 0;
  }

  return Number(
    this.monthRevenueData[
      this.monthRevenueData.length - 1
    ]?.revenueCr || 0
  );
}

get growthPercent(): number {

  const revenues = this.monthRevenueData
    .map((x: any) => Number(x.revenueCr || 0))
    .filter(x => x > 0);

  if (revenues.length < 2) {
    return 0;
  }

  const current = revenues[revenues.length - 1];
  const previous = revenues[revenues.length - 2];

  return Number(
    (((current - previous) / previous) * 100).toFixed(2)
  );
}
get currentMonthName(): string {

  if (!this.monthRevenueData?.length) {
    return '';
  }

  return this.monthRevenueData[
    this.monthRevenueData.length - 1
  ]?.monthName || '';
}
// =========================
// License Cards
// =========================

get licenseCards() {

  let data: any = null;

  switch (this.licenseType) {

    case 'bar':
      data = this.licenseData.find(
        x => x.licenseCategory === 'BarclubLicIssue'
      );
      break;

    case 'other':
      data = this.licenseData.find(
        x => x.licenseCategory === 'OtherLicIssue'
      );
      break;

    case 'military':
      data = this.licenseData.find(
        x => x.licenseCategory === 'OneDayLicIssue'
      );
      break;

    default:
      data = {
        pending: this.licenseData.reduce(
          (sum, x) => sum + (x.pending || 0), 0),

        approved: this.licenseData.reduce(
          (sum, x) => sum + (x.approved || 0), 0),

        reject: this.licenseData.reduce(
          (sum, x) => sum + (x.reject || 0), 0),

        total: this.licenseData.reduce(
          (sum, x) => sum + (x.total || 0), 0)
      };
      break;
  }

  return [
    {
      title: 'Pending',
      value: data?.pending || 0,
      icon: 'bi-clock-history',
      class: 'orange-card'
    },
    {
      title: 'Approved',
      value: data?.approved || 0,
      icon: 'bi-check-circle-fill',
      class: 'green-card'
    },
    {
      title: 'Rejected',
      value: data?.reject || 0,
      icon: 'bi-x-circle-fill',
      class: 'red-card'
    },
    {
      title: 'Total',
      value: data?.total || 0,
      icon: 'bi-files',
      class: 'blue-card'
    }
  ];
}
trackByTitle(index: number, item: any): string {
  return item.title;
}
get tradeCards() {

  const data = this.tradeData.find(
    (x: any) =>
      x.impExpname?.toLowerCase() === this.tradeType.toLowerCase()
  );

  return [
    {
      title: 'Pending',
      value: data?.pending || 0,
      icon: 'bi-hourglass-split',
      class: 'orange-card'
    },
    {
      title: 'Approved',
      value: data?.approved || 0,
      icon: 'bi-check-circle-fill',
      class: 'green-card'
    },
    {
      title: 'Rejected',
      value: data?.reject || 0,
      icon: 'bi-x-circle-fill',
      class: 'red-card'
    },
    {
      title: 'Total',
      value: data?.total || 0,
      icon: 'bi-globe',
      class: 'blue-card'
    }
  ];
}

// =========================
// Label Cards
// =========================

get labelCards() {

  const data = this.labelData?.[0];

  return [
    {
      title: 'Pending',
      value: data?.pending ?? 0,
      icon: 'bi-clock-history',
      class: 'orange-card'
    },
    {
      title: 'Approved',
      value: data?.approved ?? 0,
      icon: 'bi-check-circle-fill',
      class: 'green-card'
    },
    {
      title: 'Rejected',
      value: data?.reject ?? 0,
      icon: 'bi-x-circle-fill',
      class: 'red-card'
    },
    {
      title: 'Total',
      value: data?.total ?? 0,
      icon: 'bi-tags-fill',
      class: 'blue-card'
    }
  ];

}

// =========================
// Company Cards
// =========================

get companyCards() {

  const data = this.companyData.find(
    (x: any) =>
      x.category?.toLowerCase() ===
      (this.companyType === 'fl'
        ? 'company fl'
        : 'company cl')
  );

  return [
    {
      title: 'Pending',
      value: data?.pending || 0,
      icon: 'bi-clock-history',
      class: 'orange-card'
    },
    {
      title: 'Approved',
      value: data?.approved || 0,
      icon: 'bi-check-circle-fill',
      class: 'green-card'
    },
    {
      title: 'Rejected',
      value: data?.rejected || 0,
      icon: 'bi-x-circle-fill',
      class: 'red-card'
    },
    {
      title: 'Total',
      value: data?.total || 0,
      icon: 'bi-buildings-fill',
      class: 'blue-card'
    }
  ];
}
// =========================
// Notifications
// =========================

get notifications() {

  const pendingLicense =
    this.licenseData.reduce(
      (sum: number, x: any) => sum + (x.pending || 0),
      0
    );

  const pendingTrade =
    this.tradeData.reduce(
      (sum: number, x: any) => sum + (x.pending || 0),
      0
    );

  const pendingLabel =
    this.labelData.reduce(
      (sum: number, x: any) => sum + (x.pending || 0),
      0
    );

  const pendingCompany =
    this.companyData.reduce(
      (sum: number, x: any) => sum + (x.pending || 0),
      0
    );

  return [
    {
      title: 'License applications pending',
      value: pendingLicense,
      icon: 'bi-clock-history',
      color: 'orange',
      route: '/license-management'
    },
    {
      title: 'Import / Export applications pending',
      value: pendingTrade,
      icon: 'bi-globe',
      color: 'blue',
      route: '/import-export'
    },
    {
      title: 'Label registrations pending',
      value: pendingLabel,
      icon: 'bi-tags-fill',
      color: 'purple',
      route: '/label-registration'
    },
    {
      title: 'Company registrations pending',
      value: pendingCompany,
      icon: 'bi-buildings-fill',
      color: 'green',
      route: '/company-registration'
    }
  ];
}

// =========================
// Quick Actions
// =========================

quickActions = [
{
title: 'New License',
subtitle: 'Create new license',
icon: 'bi-file-earmark-plus-fill',
class: 'new-notice'
},
{
title: 'Reports',
subtitle: 'Generate analytics reports',
icon: 'bi-bar-chart-fill',
class: 'reports'
},
{
title: 'Export Data',
subtitle: 'Download notice records',
icon: 'bi-cloud-download-fill',
class: 'export'
},
{
title: 'Refresh',
subtitle: 'Reload dashboard data',
icon: 'bi-arrow-repeat',
class: 'refresh'
}
];
}

