import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  DashboardService,
  DashboardDto
} from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dashboard?: DashboardDto;

  // ======================
  // DONUT CHART DATA
  // ======================

  donutSeries: number[] = [];

  donutLabels = [
    'Active Notices',
    'Inactive Notices'
  ];

  donutChart: any = {
    type: 'donut',
    height: 350,
    toolbar: {
      show: true
    },
    animations: {
      enabled: false
    }
  };

  // ======================
  // BAR CHART DATA
  // ======================

  barSeries: any = [
    {
      name: 'Monthly Notices',
      data: []
    }
  ];

  barChart: any = {
    type: 'bar',
    height: 350,
    toolbar: {
      show: true
    },
    zoom: {
      enabled: false
    },
    animations: {
      enabled: false
    }
  };

  barXAxis: any = {
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ],
    labels: {
      style: {
        colors: '#ffffff',
        fontSize: '12px'
      }
    }
  };

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.dashboardService.getDashboard()
      .subscribe({
        next: (res) => {

          console.log(res);

          this.dashboard = res;

          this.donutSeries = [
            res.activeNotices,
            res.inactiveNotices
          ];

          this.barSeries = [
            {
              name: 'Monthly Notices',
              data: res.monthlyNotices
            }
          ];
        },
        error: (err) => {
          console.error('Dashboard API Error:', err);
        }
      });
  }
}