import { Component, OnInit } from '@angular/core';
import { CommonModule }        from '@angular/common';
import { MatCardModule }       from '@angular/material/card';
import { MatListModule }       from '@angular/material/list';
import { MatIconModule }       from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule }     from '@angular/material/button';

import { NewsArticle, NewsService }           from '../../services/news.service';
//import { Task, TaskService }                  from '../../services/task.service';
import {  NotificationService }  from '../../services/notification.service';
import {  MeetingService }            from '../../services/meeting.service';
import { SessionStorageService } from '../../services/session-storage.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { MbscCalendarColor, MbscCalendarLabel, MbscCalendarMarked, setOptions /* localeImport */ } from '@mobiscroll/angular';
import { dyndatetime } from '../../../app/app.util';
import { MbscDatepickerModule } from '@mobiscroll/angular';
import { MbscModule } from '@mobiscroll/angular';
@Component({
   selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
     MbscDatepickerModule,
    MbscModule,
  
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent  implements OnInit {
  // News
  articles: NewsArticle[] = [];
   newsLoading = true;
  errorMessage: string | null = null;

  currentUser :any =[]
  role:any =[]
  // Tasks
  tasks: any = [];
  tasksLoading = true;

  // Notifications
  notifications: any = [];
  notifLoading = true;

  // Meetings
  meetings: any = [];
  meetLoading = true;
  userRole: number = 0;

   taches: any[] = [];
  filtered: any[] = [];
  pageSlice: any[] = [];
  search = '';
  statusFilter = 'a_developper';
  pageSize = 9;
  pageIndex = 0;
  statuses = [
    { value: '',             label: 'Tous' },
    { value: 'a_developper', label: 'À développer' },
    { value: 'en_cours',      label: 'En cours' },
    { value: 'suspendu',     label: 'Suspendu' },
    { value: 'cloturé',      label: 'Cloturé' },
    { value: 'terminé',      label: 'Terminé' }
  ];


  // Main stats
  projectStats: any = {} ;
  taskStats: any = {} ;

  // Extended stats
  devStats: any[] = [];

  testStats: any = { 
    
  };
  
  testerStats: any[] = [{
    
  }];
  topDevs: any[] = [];
  worstDevs: any[] = [];
  topTesters: any[] = [];
  worstTesters: any[] = [];

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


  coloredDays: MbscCalendarColor[] = [
      { recurring: { repeat: 'yearly', month: 1, day: 1 }, background: 'red' },
      { recurring: { repeat: 'yearly', month: 3, day: 20 }, background: 'red' },
      { recurring: { repeat: 'yearly', month: 4, day: 9 }, background: 'red' },
      { recurring: { repeat: 'yearly', month: 5, day: 1 }, background: 'red' },
      { recurring: { repeat: 'yearly', month: 7, day: 25 }, background: 'red' },
      { recurring: { repeat: 'yearly', month: 8, day: 13 }, background: 'red' },
      { recurring: { repeat: 'yearly', month: 10, day: 15 }, background: 'red' },
      { recurring: { repeat: 'yearly', month: 12, day: 17 }, background: 'red' },
    ];
  
    labelDays: MbscCalendarLabel[] = [
      { recurring: { repeat: 'yearly', month: 1, day: 1 }, title: "New Year's Day" },
      { recurring: { repeat: 'yearly', month: 3, day: 20 }, title: "Independence Day"},
      { recurring: { repeat: 'yearly', month: 4, day: 9 }, title: "Martyrs' Day" },
      { recurring: { repeat: 'yearly', month: 5, day: 1 }, title: "Labour Day" },
      { recurring: { repeat: 'yearly', month: 7, day: 25 }, title:"Republic Day"},
      { recurring: { repeat: 'yearly', month: 8, day: 13 }, title:  "Women's Day" },
      { recurring: { repeat: 'yearly', month: 10, day: 15 }, title: "Evacuation Day"},
      { recurring: { repeat: 'yearly', month: 12, day: 17 }, title: "Revolution Day" },
    ];
  
    
  // Color schemes
  colorScheme: Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#42BFF5'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'Custom Scheme'
  };
  developerStats :any 
  // View dimensions for charts

currentStatIndex = 0;
statsToRotate: any[] = [];
statsLoading = true;
rotationInterval: any;


currentArticleIndex  = 0;
rotationNewsInterval: any;
  router: any;

// Add this getter
get currentArticle(): NewsArticle {
  return this.articles[this.currentArticleIndex] || {
    title: '',
    description: '',
    url: '#',
    urlToImage: '',
    content: ''
  };
}


  readonly API = 'http://localhost:8080/api';



  constructor(
    private newsService: NewsService,
    private http:HttpClient,
    private notifSvc: NotificationService,
    private meetSvc: MeetingService,
    private sessionStorage:SessionStorageService
  ) {
    this.currentUser=sessionStorage.getUser()
  }
  isTester(){
    return this.currentUser.role.id===2;
  }

  ngOnInit(): void {
    this.loadGlobalNews();
    this.loadMeetings();
    if(this.currentUser!==2){
          this.loadTasks();

    }

    this.loadStats();
    this.loadNotifications()
  }
    // 1) Tech news
    loadGlobalNews(){
    this.newsService.getTechNews().subscribe({
      next: (data) => {
        console.log(data)
        this.articles = data.articles;
              if (this.articles.length > 0) {

        this.startNewsRotation();
              }
        this.newsLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des actualités', error);
        this.errorMessage = "Erreur lors du chargement des actualités";
        this.newsLoading = false;
      }
    });
  }
  startNewsRotation() {
  this.rotationNewsInterval = setInterval(() => {
    this.currentArticleIndex = (this.currentArticleIndex + 1) % this.articles.length;
  }, 15000);
}
  

    loadTasks(){
    if (this.currentUser.role.id===3){
      this.loadAndSync();
    }
    if (this.currentUser.role.id===1){
      this.loadUserTasksAndSync();
    }
  }
  private loadUserTasksAndSync() {
let params = new HttpParams();
    params = params.set('assignedTo', this.currentUser.id);
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.http.get<any[]>(`${this.API}/taches`, { params })
      .subscribe(list => {
        this.taches = list;
         this.taches.map((tache:any)=>{
            this.labelDays=[
              ...this.labelDays,
              {date:new Date (tache.deadline), text : tache.name}
            ]
            console.log(this.labelDays)
            this.coloredDays = [
              ...this.coloredDays,
              {date:new Date (tache.deadline), highlight:"green"}
            ]
            console.log(this.coloredDays)
          })
        this.syncAllStatuses()
          .subscribe({
            next: () => {
            this.tasksLoading=false;
            },
            error: err => {
              console.error('Erreur de sync des statuts', err);
            }
          });
      });
    
      
    }
  


  /** 1) Charge la liste, 2) synchronise statuts, 3) applique filtres */
  private loadAndSync() {
    let params = new HttpParams();
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.http.get<any[]>(`${this.API}/taches`, { params })
      .subscribe(list => {
        this.taches = list;
         this.taches.map((tache:any)=>{
            this.labelDays=[
              ...this.labelDays,
              {date:new Date (tache.deadline), text : tache.name}
            ]
            this.coloredDays = [
              ...this.coloredDays,
              {date:new Date (tache.deadline), highlight:"green"}
            ]
          })
        this.syncAllStatuses()
          .subscribe({
            next: () => {
              this.tasksLoading=false;

            },
            error: err => {
              console.error('Erreur de sync des statuts', err);
            }
          });
      });
  }

  /** Appelle /syncStatus pour chaque tâche, met à jour en mémoire */
  private syncAllStatuses() {
    const calls = this.taches.map(t =>
      this.http.put<{ status: string }>(
        `${this.API}/taches/${t.id}/syncStatus`,
        null
      ).pipe(
        catchError(_ => of(null))  // si erreur sur une, on continue
      )
    );
    return forkJoin(calls).pipe(
      // pour chaque réponse éventuelle, mettre à jour tâches[i].status
      // mais ici notre endpoint ne renvoie rien, alors on se contente de rafraîchir via GET si besoin
    );
  }
    // 3) Recent notifications
loadNotifications(){

    this.notifSvc.getUnreadUserNotifications(this.currentUser.id).subscribe({
      next: data => {
      this.notifications = data
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3); // Get only 3 latest
      this.notifLoading = false;
    },
      error: ()   => { this.notifLoading = false; }
    });
  }
    // 4) Upcoming meetings
    loadMeetings(){
    this.meetSvc.getUserMeetings(this.currentUser.id).subscribe({
      next: data => {
         this.meetings = data; 
          this.meetings.forEach((meeting:any) => {
        this.labelDays.push({
          date: new Date(meeting.date),
          text: meeting.project?.name || 'Unknown Project'
        });

        this.coloredDays.push({
          date: new Date(meeting.date),
          highlight: 'blue'
        });
      });

      this.meetLoading = false;
    },
    error: () => {
      this.meetLoading = false;
    }
  });
}
  loadStats(){
    const user = this.sessionStorage.getUser();
    this.userRole = user.role.id;

      this.loadAnalyticsData();
  }
  async loadAnalyticsData(): Promise<void> {
    await this.fetchAllStats();
    this.prepareChartData();
         this.prepareRotatingStats();

  }
  
      async fetchAllStats(): Promise<void> {
        console.log(this.userRole)
        const user = this.sessionStorage.getUser();
  
        if(this.userRole === 3){
          console.log(33333)
          try{
          const [projectStats,taskStats,testStats,devStats,testerStats] = await firstValueFrom(
          forkJoin([
            this.http.get<any>(`http://localhost:8080/api/projects/stats`),
            this.http.get<any>(`http://localhost:8080/api/taches/stats`),
            this.http.get<any>(`http://localhost:8080/api/tester-assignments/stats`),
            this.http.get<any[]>(`http://localhost:8080/api/users/devstats`),
            this.http.get<any[]>(`http://localhost:8080/api/users/testerstats`)
          ])
        );
        console.log(5555)
      
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
      }catch (err) {
      console.log('Error fetching admin stats:', err);
    }
      }else if(this.userRole === 1){
  
        const [projectStats,taskStats,devStats,testStats] = await firstValueFrom(
              forkJoin([
                this.http.get<any>(`http://localhost:8080/api/projects/stats/${user.id}`),
                this.http.get<any>(`http://localhost:8080/api/taches/stats/${user.id}`),
                this.http.get<any[]>(`http://localhost:8080/api/users/devstats/${user.id}`),
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
  
      }else if(this.userRole === 2){
        const [projectStats,testStats,testerStats] = await firstValueFrom(
          forkJoin([
            this.http.get<any>(`http://localhost:8080/api/projects/stats/tester/${user.id}`),
            this.http.get<any>(`http://localhost:8080/api/tester-assignments/stats/${user.id}`),
            this.http.get<any>(`http://localhost:8080/api/users/testerstats/${user.id}`)
          ])
        );
      
        // now _all_ data is in
        this.projectStats = projectStats;
        this.testStats    = testStats;      // ← was wrong before
        this.testerStats  = [testerStats];
      
        // for debugging, now _all_ five logs will appear:
        
  
        this.prepareTesterChartData();
      }
  
      }
      
    prepareTesterChartData(){
      //console.log(this.testerStats)
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
  
      // any productivity
      
  
    
      
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
      { name: 'pending', value: this.testStats.total-this.testStats.success-this.testStats.failed  }
    ];
    this.success = this.testStats.success  ?? 0;
    this.failed  = this.testStats.failed   ?? 0;
    this.total   = this.testStats.total    ?? ( this.success + this.failed);

    //console.log(this.devStats)
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
      { name: 'pending', value: this.testStats.total-this.testStats.failed-this.testStats.success }
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
  
  calculateFailureRate(tester: any): string {
    if (!tester.totalTests) return '0.00%';
    return ((tester.failedTests / tester.totalTests) * 100).toFixed(2) + '%';
  }

  calculateProductivity(dev: any): number {  // Return number instead of string
    if (!dev.salary || dev.salary === 0) return 0;
    // Multiply by 1000 to get more meaningful values
    return (dev.completed / dev.salary) * 1000; 
  }
  calculateTesterProductivity(tester: any): number {  // Return number instead of string
    if (!tester.salary || tester.salary === 0) return 0;
    // Multiply by 1000 to get more meaningful values
    return (tester.totalTests / tester.salary) * 1000; 
  }
  
  yAxisTicks: number[] = [0, 0.5, 1, 1.5, 2, 2.5, 3];  // Whole numbers after scaling
  formatYAxisTicks(value: number): string {
    // Reverse the scaling for display
    return (value / 1000).toFixed(3);  // Shows as 0.000, 0.001, etc.
  }

  calculateCostPerProject(dev: any): string {
    if (!dev.devProjects) return '0';
    return (dev.salary / dev.completed).toFixed(2);
  }
  get devStatsSortedByLastMonth(): any[] {
  //console.log(this.devStats)
  return [...this.devStats]
    .filter(dev => dev.projectsLastMonth >=0)
    .sort((a, b) => b.projectsLastMonth - a.projectsLastMonth);
}

get devStatsSortedByLastYear(): any[] {
  return [...this.devStats]
    .filter(dev => dev.projectsLastYear >= 0)
    .sort((a, b) => b.projectsLastYear - a.projectsLastYear);
}
  

  calculateTesterEfficiency(tester: any): string {
    if (!tester.testedProjects) return '0';
    return ((tester.testedProjects - tester.failedTests) / tester.testedProjects * 100).toFixed(2) + '%';
  }
  prepareRotatingStats() {
    console.log(this.projectStats);
    if (this.currentUser.role.id===3){
  this.statsToRotate = [
    { 
      title: 'Projects This Week', 
      value: this.projectStats?.week || 'N/A',
      icon: '📅'
    },
    {
      title: 'Completed Tasks',
      value: this.taskStats?.completed || 'N/A',
      icon: '✅'
    },
    {
      title: 'Success Rate',
      value: this.testStats.total ? 
        (this.testStats.success / this.testStats.total * 100).toFixed(2) + '%' : 'N/A',
      icon: '📈'
    },
    {
      title: 'Active Tasks',
      value: (this.taskStats?.inDev || 0) + (this.taskStats?.inTest || 0),
      icon: '⚡'
    },
    {
      title: 'Team Productivity',
      value: this.devStats.length ? 
        Math.round(this.devStats.reduce((acc, dev) => acc + this.calculateProductivity(dev), 0)) : 'N/A',
      icon: '🚀'
    }
  ];
}else if(this.currentUser.role.id===1){
this.statsToRotate = [
    { 
      title: 'Projects This Week', 
      value: this.projectStats?.week || 'N/A',
      icon: '📅'
    },
    {
      title: 'Completed Tasks',
      value: this.taskStats?.completed || '0',
      icon: '✅'
    },
    {
      title: 'Success Rate',
      value: this.testStats.total ? 
        (this.testStats.success / this.testStats.total * 100).toFixed(2) + '%' : '0',
      icon: '📈'
    },
    {
      title: 'Active Tasks',
      value: (this.taskStats?.inDev || 0) + (this.taskStats?.inTest || 0),
      icon: '⚡'
    },
    {
      title: 'Team Productivity',
      value: this.devStats.length ? 
        Math.round(this.devStats.reduce((acc, dev) => acc + this.calculateProductivity(dev), 0)) : '0',
      icon: '🚀'
    }
  ];
}else if(this.currentUser.role.id===2){
this.statsToRotate = [
    { 
      title: 'Projects This Week', 
      value: this.projectStats?.week || 'N/A',
      icon: '📅'
    },
    
    {
      title: 'Success Rate',
      value: this.testStats.total ? 
        (this.testStats.success / this.testStats.total * 100).toFixed(2) + '%' : '0',
      icon: '📈'
    },
    {
      title: 'Active Tasks',
      value: (this.taskStats?.inDev || 0) + (this.taskStats?.inTest || 0),
      icon: '⚡'
    },
    
  ];
}
  this.statsLoading = false;
  this.startRotation();
}

startRotation() {
  this.rotationInterval = setInterval(() => {
    this.currentStatIndex = (this.currentStatIndex + 1) % this.statsToRotate.length;
  }, 15000);
}

get currentStat() {
  return this.statsToRotate[this.currentStatIndex] || {};
}

// Add to ngOnDestroy()
ngOnDestroy() {
  if (this.rotationInterval) {
    clearInterval(this.rotationInterval);
  }
}
rootToAnalaytics(){
      this.router.navigate(['/analytics']);

}
rootToProject(projectId: number) {
    this.router.navigate(['/dashboard/projects', projectId]);
  }
  rootToTask(taskId: number) {
    this.router.navigate(['/tâches', taskId]);
  }
   rootToNotification(notiId: number) {
    this.router.navigate(['/notifications', notiId]);
  }

}
