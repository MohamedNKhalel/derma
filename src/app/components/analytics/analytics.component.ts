import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { DataService } from 'src/app/services/data.service';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, 
    NgxEchartsModule
  ],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') })
    }
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  patients: any[] = [];
  
  // Stats
  totalPatients: number = 0;
  malePercentage: number = 0;
  femalePercentage: number = 0;
  avgBloodPressure: number = 0;
  avgSugar: number = 0;
  avgTemperature: number = 0;

  // Chart Options
  genderChartOption: EChartsOption = {};
  ageChartOption: EChartsOption = {};
  vitalsChartOption: EChartsOption = {};

  constructor(private _DataService: DataService) {}

  ngOnInit(): void {
    this.getAllPatients();
  }

  getAllPatients() {
    this._DataService.getAllPatients().subscribe((res: any) => {
      this.patients = res.map((e: any) => {
        const data = e.payload.doc.data();
        return {
          id: e.payload.doc.id,
          ...data
        };
      });
      
      this.calculateStats();
      this.initCharts();
    });
  }

  calculateStats() {
    this.totalPatients = this.patients.length;
    if (this.totalPatients === 0) return;

    // Gender Stats
    const males = this.patients.filter(p => p.gender?.toLowerCase() === 'male').length;
    const females = this.patients.filter(p => p.gender?.toLowerCase() === 'female').length;
    this.malePercentage = Math.round((males / this.totalPatients) * 100);
    this.femalePercentage = Math.round((females / this.totalPatients) * 100);

    // Vitals Averages
    const totalBP = this.patients.reduce((acc, curr) => acc + (Number(curr.rate?.bloodPressureRate) || 0), 0);
    const totalSugar = this.patients.reduce((acc, curr) => acc + (Number(curr.rate?.bloodSugarRate) || 0), 0);
    const totalTemp = this.patients.reduce((acc, curr) => acc + (Number(curr.rate?.temperature) || 0), 0);

    this.avgBloodPressure = Math.round(totalBP / this.totalPatients);
    this.avgSugar = Math.round(totalSugar / this.totalPatients);
    this.avgTemperature = Math.round(totalTemp / this.totalPatients);
  }

  initCharts() {
    // 1. Gender Distribution (Donut Chart)
    const males = this.patients.filter(p => p.gender?.toLowerCase() === 'male').length;
    const females = this.patients.filter(p => p.gender?.toLowerCase() === 'female').length;

    this.genderChartOption = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: {
        top: '5%',
        left: 'center',
        textStyle: { color: '#fff' }
      },
      series: [
        {
          name: 'Gender',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0a0a0f',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' }
          },
          labelLine: { show: false },
          data: [
            { value: males, name: 'Male', itemStyle: { color: '#3b82f6' } },
            { value: females, name: 'Female', itemStyle: { color: '#ec4899' } }
          ]
        }
      ]
    };

    // 2. Age Groups (Bar Chart)
    const ageGroups = { '0-18': 0, '19-30': 0, '31-50': 0, '51+': 0 };
    
    this.patients.forEach(p => {
      const birthDate = new Date(p.date_of_birth); // Assuming date_of_birth is parseable
      const age = new Date().getFullYear() - birthDate.getFullYear();
      
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 30) ageGroups['19-30']++;
      else if (age <= 50) ageGroups['31-50']++;
      else ageGroups['51+']++;
    });

    this.ageChartOption = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: [
        {
          type: 'category',
          data: Object.keys(ageGroups),
          axisTick: { alignWithLabel: true },
          axisLine: { lineStyle: { color: '#94a3b8' } }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          axisLine: { lineStyle: { color: '#94a3b8' } }
        }
      ],
      series: [
        {
          name: 'Patients',
          type: 'bar',
          barWidth: '60%',
          data: Object.values(ageGroups),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#22d3ee' }, // Cyan
                { offset: 1, color: '#6366f1' }  // Indigo
              ]
            },
            borderRadius: [5, 5, 0, 0]
          }
        }
      ]
    };

    // 3. Vitals Stats (Gauge or Radar - using Radar for multiple metrics)
    this.vitalsChartOption = {
      backgroundColor: 'transparent',
      tooltip: {},
      radar: {
        indicator: [
          { name: 'Blood Pressure', max: 200 }, // Approx max
          { name: 'Blood Sugar', max: 300 },    // Approx max
          { name: 'Temperature', max: 42 }      // Approx max
        ],
        axisName: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      series: [
        {
          name: 'Average Vitals',
          type: 'radar',
          data: [
            {
              value: [this.avgBloodPressure, this.avgSugar, this.avgTemperature],
              name: 'Patient Averages',
              areaStyle: {
                color: 'rgba(236, 72, 153, 0.2)' // Pink translucent
              },
              lineStyle: {
                color: '#ec4899'
              },
              itemStyle: {
                color: '#ec4899'
              }
            }
          ]
        }
      ]
    };
  }
}
