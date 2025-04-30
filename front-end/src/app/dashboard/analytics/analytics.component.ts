import { ChangeDetectorRef, Component, OnInit,NgZone  } from '@angular/core';
import {  ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { firstValueFrom } from 'rxjs';
import { forkJoin } from 'rxjs';


interface Developer {
  name: string;
  devProjects: number;
  completed: number;
  inTesting: number;
  salary: number;
  avgCompletionDays: number;
  bugsReported: number;
  activeTasks: number;
  activeProjects: number;
  projectsLastMonth: number;  // Add this
  projectsLastYear: number; 
}

interface Tester {
  name: string;
  testedProjects: number;
  failedTests: number;
  salary: number;
  totalTests: number;
  activeTasks: number;
  activeProjects: number;
}

interface ProjectStats {
  week: number;
  month: number;
  year: number;
  toTesting: {
    week: number;
    month: number;
    year: number;
  };
}

interface TaskStats {
  completed: number;
  inDev: number;
  inTest: number;
  closed: number;
  blocked: number;
}

interface TestStats {
  total: number;
  success: number;
  failed: number;
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  standalone: true,
  imports: [CommonModule, NgxChartsModule]
})
export class AnalyticsComponent implements OnInit {
  private TOTAL_CHARTS = 7; 
  private chartsDone = 0;
  isGeneratingPDF = false;

  // A promise you’ll await in exportToPDF
  private chartRenderPromise!: Promise<void>;
  private chartRenderResolve!: () => void;
  userRole: number = 0;
  statsVisible = false;
  currentDate: Date = new Date();
  view: [number, number] = [1600, 900]; // Larger dimensions for better PDF quality
  
  // Main stats
  projectStats: any = {} ;
  taskStats: any = {} ;

  // Extended stats
  devStats: any[] = [];

  testStats: any = { 
    total: 0, 
    success: 0, 
    failed: 0 
  };
  
  testerStats: any[] = [{
    name: '',
    testedProjects: 0,
    failedTests: 0,
    salary: 0,
    totalTests: 0,
    activeTasks: 0,
    activeProjects: 0
  }];
  topDevs: Developer[] = [];
  worstDevs: Developer[] = [];
  topTesters: Tester[] = [];
  worstTesters: Tester[] = [];

  showAllDevs = false;
  showAllTesters = false;
  failed :number=0;
  success : number=0;
  total : number=0;

  // Chart data
  projectCompletionChart: any[] = [];
  testingSuccessChart: any[] = [];
  devProductivityChart: any[] = [];
  testProductivityChart: any[] = [];
  devBugsChart: any[] = [];
  testerEfficiencyChart: any[] = [];
  projectTimelineChart: any[] = [];
  workloadDistributionChart: any[] = [];
  workloadDevDistributionChart : any[] = [];

  workloadTestDistributionChart : any[] = [];
  // Color schemes
  colorScheme: Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#42BFF5'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'Custom Scheme'
  };
  developerStats :any 
  // View dimensions for charts

  constructor(private sessionStorage: SessionStorageService,private http: HttpClient,  private cdr: ChangeDetectorRef ,     private ngZone: NgZone  ) {}

  ngOnInit(): void {
    const user = this.sessionStorage.getUser();
    this.userRole = user.role.id;


      this.loadAnalyticsData();
    
  }
  async loadAnalyticsData(): Promise<void> {
    await this.fetchAllStats();
    this.prepareChartData();
    this.cdr.detectChanges();
    this.chartRenderPromise = new Promise(res => this.chartRenderResolve = res);

  }
  onChartRendered() {
    this.chartsDone++;
    if (this.chartsDone === this.TOTAL_CHARTS) {
      this.chartRenderResolve();
    }
  }



  isAdmin(): boolean {
    return this.userRole === 3;
  }

  isDeveloper(): boolean {
    return this.userRole === 1;
  } isTester(): boolean {
    return this.userRole === 2;
  }


  prepareChartData() {
    // Project completion
    
    this.projectCompletionChart = [
      { name: 'Completed', value: this.taskStats.completed },
      { name: 'In Dev', value: this.taskStats.inDev },
      { name: 'In Test', value: this.taskStats.inTest },
      { name: 'Closed', value: this.taskStats.closed },
      { name: 'Blocked', value: this.taskStats.blocked }
    ];

    // Testing success

    this.testingSuccessChart = [
      { name: 'Success', value: this.testStats.success },
      { name: 'Failed', value: this.testStats.failed },
      { name: 'Total', value: this.testStats.total }
    ];
      

    // Developer productivity
    this.devProductivityChart = this.devStats.map(dev => ({
      name: dev.name,
      value: +(this.calculateProductivity(dev))
    }));
    this.testProductivityChart = this.testerStats.map(tester => ({
      name: tester.name,
      value: +(this.calculateTesterProductivity(tester))
    }));
    

    this.testerEfficiencyChart = this.testerStats.map(tester => ({
      name: tester.name,
      value: +(this.calculateFailureRate(tester).replace('%', ''))
    }));

    
    // Workload distribution
    this.workloadDistributionChart = [
      {
        "name": "Developers",
        "series": this.devStats.map(dev => ({
          "name": dev.name,
          "value": dev.activeTasks
        }))
      },
      {
        "name": "Testers",
        "series": this.testerStats.map(tester => ({
          "name": tester.name,
          "value": tester.activeTasks
        }))
      }
    ];
  }
  

    async fetchAllStats(): Promise<void> {
      console.log(this.userRole)
      const user = this.sessionStorage.getUser();

      if(this.userRole === 3){
      const [projectStats,taskStats,testStats,devStats,testerStats
  ] = await firstValueFrom(
        forkJoin([
          this.http.get<ProjectStats>(`http://localhost:8080/api/projects/stats`),
          this.http.get<TaskStats>(`http://localhost:8080/api/taches/stats`),
          this.http.get<TestStats>(`http://localhost:8080/api/assignments/stats`),
          this.http.get<Developer[]>(`http://localhost:8080/api/users/devstats`),
          this.http.get<Tester[]>(`http://localhost:8080/api/users/testerstats`)
        ])
      );
    
      // now _all_ data is in
      this.projectStats = projectStats;
      this.taskStats    = taskStats;
      this.testStats    = testStats;      // ← was wrong before
      this.devStats     = devStats;
      this.testerStats  = testerStats;
    
      // for debugging, now _all_ five logs will appear:
      console.log('projectStats', this.projectStats);
      console.log('taskStats',    this.taskStats);
      console.log('testStats',    this.testStats);
      console.log('devStats',     this.devStats);
      console.log('testerStats',  this.testerStats);
    
      // only now prepare your charts
      this.devStats.sort((a, b) => (b.completed / b.salary) - (a.completed / a.salary));
      this.topDevs = this.devStats.slice(0, 5);
      this.worstDevs = this.devStats.slice(-5).reverse();

      this.testerStats.sort((a, b) => (a.failedTests / a.totalTests) - (b.failedTests / b.totalTests));
      this.topTesters = this.testerStats.slice(0, 5);
      this.worstTesters = this.testerStats.slice(-5).reverse();


      this.prepareChartData();
      this.cdr.detectChanges();
    }else if(this.userRole === 1){

      const [projectStats,taskStats,devStats,testStats
      ] = await firstValueFrom(
            forkJoin([
              this.http.get<ProjectStats>(`http://localhost:8080/api/projects/stats/${user.id}`),
              this.http.get<TaskStats>(`http://localhost:8080/api/taches/stats/${user.id}`),
              this.http.get<Developer[]>(`http://localhost:8080/api/users/devstats/${user.id}`),
              this.http.get<any[]>(`http://localhost:8080/api/users/devstats/test/${user.id}`)
            ])
          );
        
          // now _all_ data is in
          this.projectStats = projectStats;
          this.taskStats    = taskStats;
          this.testStats    = testStats;      // ← was wrong before
          this.devStats     = [devStats];
        
          // for debugging, now _all_ five logs will appear:
          console.log('projectStats', this.projectStats);
          console.log('taskStats',    this.taskStats);
          console.log('testStats',    this.testStats);
          console.log('devStats',     this.devStats);
        
      
      this.prepareDevChartData();
      this.cdr.detectChanges();

    }else if(this.userRole === 2){
      const [projectStats,testStats,testerStats
  ] = await firstValueFrom(
        forkJoin([
          this.http.get<ProjectStats>(`http://localhost:8080/api/projects/stats/tester/${user.id}`),
          this.http.get<TestStats>(`http://localhost:8080/api/assignments/stats/${user.id}`),
          this.http.get<Tester>(`http://localhost:8080/api/users/testerstats/${user.id}`)
        ])
      );
    
      // now _all_ data is in
      this.projectStats = projectStats;
      this.testStats    = testStats;      // ← was wrong before
      this.testerStats  = [testerStats];
    
      // for debugging, now _all_ five logs will appear:
      

      this.prepareTesterChartData();
      this.cdr.detectChanges();
    }

    }

    prepareTesterChartData(){
      console.log(this.testerStats)
      this.workloadTestDistributionChart = [
        {
          "name": "Active Tasks",
          "value": this.testerStats[0]?.activeTasks ?? 0
        },
        {
          "name": "Active Projects",
          "value": this.testerStats[0]?.activeProjects ?? 0
        }
      ];
  
      // Testing success
  
      this.testingSuccessChart = [
        { name: 'Success', value: this.testStats.success },
        { name: 'Failed', value: this.testStats.failed },
        { name: 'Total', value: this.testStats.total }
      ];
      this.success = this.testStats?.success  ?? 0;
      this.failed  = this.testStats?.failed   ?? 0;
      this.total   = this.testStats?.total    ?? ( this.success + this.failed);
  
      // Developer productivity
      
  
    
      
    }
  
    prepareDevChartData(){
    this.projectCompletionChart = [
      { name: 'Completed', value: this.taskStats.completed },
      { name: 'In Dev', value: this.taskStats.inDev },
      { name: 'In Test', value: this.taskStats.inTest },
      { name: 'Closed', value: this.taskStats.closed },
      { name: 'Blocked', value: this.taskStats.blocked }
    ];

    // Testing success

    this.testingSuccessChart = [
      { name: 'Success', value: this.testStats.success },
      { name: 'Failed', value: this.testStats.failed },
      { name: 'Total', value: this.testStats.total }
    ];
    this.success = this.testStats.success  ?? 0;
    this.failed  = this.testStats.failed   ?? 0;
    this.total   = this.testStats.total    ?? ( this.success + this.failed);

    console.log(this.devStats)
    this.workloadDevDistributionChart = [
      {
        "name": "Active Tasks",
        "value": this.devStats[0].activeTasks ?? 0
      },
      {
        "name": "Active Projects", 
        "value": this.devStats[0]?.activeProjects ?? 0
      },
      {
        name: 'Tasks in Testing',
        value: this.devStats[0]?.inTesting || 0
      }
    ];
    console.log('Workload Chart Data:', this.workloadDevDistributionChart);


    

  
    
  }
  calculateFailureRate(tester: Tester): string {
    if (!tester.totalTests) return '0.00%';
    return ((tester.failedTests / tester.totalTests) * 100).toFixed(2) + '%';
  }

  calculateProductivity(dev: Developer): number {  // Return number instead of string
    if (!dev.salary || dev.salary === 0) return 0;
    // Multiply by 1000 to get more meaningful values
    return (dev.completed / dev.salary) * 1000; 
  }
  calculateTesterProductivity(tester: Tester): number {  // Return number instead of string
    if (!tester.salary || tester.salary === 0) return 0;
    // Multiply by 1000 to get more meaningful values
    return (tester.totalTests / tester.salary) * 1000; 
  }
  
  yAxisTicks: number[] = [0, 0.5, 1, 1.5, 2, 2.5, 3];  // Whole numbers after scaling
  formatYAxisTicks(value: number): string {
    // Reverse the scaling for display
    return (value / 1000).toFixed(3);  // Shows as 0.000, 0.001, etc.
  }

  calculateCostPerProject(dev: Developer): string {
    if (!dev.devProjects) return '0';
    return (dev.salary / dev.completed).toFixed(2);
  }
  get devStatsSortedByLastMonth(): Developer[] {
  console.log(this.devStats)
  return [...this.devStats]
    .filter(dev => dev.projectsLastMonth >=0)
    .sort((a, b) => b.projectsLastMonth - a.projectsLastMonth);
}

get devStatsSortedByLastYear(): Developer[] {
  return [...this.devStats]
    .filter(dev => dev.projectsLastYear >= 0)
    .sort((a, b) => b.projectsLastYear - a.projectsLastYear);
}
  

  calculateTesterEfficiency(tester: Tester): string {
    if (!tester.testedProjects) return '0';
    return ((tester.testedProjects - tester.failedTests) / tester.testedProjects * 100).toFixed(2) + '%';
  }

  private getDashboardContainerId(): string {
    switch (this.userRole) {
      case 3: return 'dashboardContent';
      case 1: return 'dashboardDeveloperContent';
      /*case 2: return 'dashboardTesterContent';*/
      default: return 'dashboardContent';

    }
  }


  async exportToPDF() {
    this.isGeneratingPDF = true;
    try {
      this.isGeneratingPDF = true;
    // reset counter & promise
   
    // kick Angular change detection so charts start rendering:
    this.cdr.detectChanges();

    // wait here until every chart has emitted renderComplete

    // now charts are _all_ done—capture the canvas
    const charts = document.querySelectorAll('ngx-charts-advanced-pie-chart, ngx-charts-pie-chart');
    await Promise.all(
      Array.from(charts).map(chart => {
        const ngxChart = chart as unknown as { renderComplete?: { subscribe: (callback: () => void) => void } };
        return new Promise<void>(resolve => {
          if (ngxChart.renderComplete) {
            ngxChart.renderComplete.subscribe(() => resolve());
          } else {
            setTimeout(resolve, 500); // Fallback
          }
        });
      })
    );
    const containerId = this.getDashboardContainerId();
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Dashboard element #${containerId} not found`);
    }

      // 4. Render to canvas at high resolution
      const options = {
        scale: 3,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        onclone: (clonedDoc : Document) => {
          clonedDoc.getElementById('dashboardContent')?.classList.add('pdf-exporting');
          clonedDoc.head.innerHTML += `
            <style>
              @media print {
                .chart-card, .performance-card { 
                  page-break-inside: avoid !important; 
                }
              }
            </style>
          `;
        }
      };
      const canvas = await html2canvas(element, options);
  
      // 5. Convert to JPEG data URL (smaller than PNG)
      const imgData = canvas.toDataURL('image/jpeg', 0.92); // Slightly better quality  
      // 6. Set up jsPDF and page dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
  
      // 7. Compute the image dimensions in mm
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeightMm = (imgProps.height * pageWidth) / imgProps.width;
  
      // 8. How many “pages” we need?
      let remainingHeight = imgHeightMm;
      let yOffset = 0;
  
      // 9. Add pages until done
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'JPEG', 0, yOffset, pageWidth, imgHeightMm);
        remainingHeight -= pageHeight;
        yOffset -= pageHeight;
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
  
      // 10. Save the PDF
      pdf.save('dashboard-report.pdf');
  
    } catch (err) {
      console.error('PDF export failed', err);
    }finally {
      document.getElementById('dashboardContent')?.classList.remove('pdf-exporting'); // Fixed ID
      this.isGeneratingPDF = false;
    }
  }
 

}