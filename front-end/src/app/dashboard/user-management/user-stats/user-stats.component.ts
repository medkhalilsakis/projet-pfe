// src/app/components/user-stats/user-stats.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// 1. On conserve l’import de Chart.js pour les types
import { ChartOptions, ChartData, ChartType } from 'chart.js';

// 2. Imports des services métier (inchangés)
import { PauseRequestService, PauseStats } from '../../../services/pause-request.service';
import { UserService } from '../../../services/users.service';

// 3. Modules Angular classiques
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

// 4. On importe maintenant la directive standalone BaseChartDirective
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css'],

  // 5. Ajout de BaseChartDirective dans imports
  standalone: true,               // si vous souhaitez déclarer ce composant comme standalone
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    BaseChartDirective            // → permet d’utiliser <canvas baseChart> sans ChartsModule
  ]
})
export class UserStatsComponent implements OnInit {
  public barChartOptions: ChartOptions = { responsive: true };
  public barChartLabels: string[] = ['Pending', 'Approved', 'Rejected'];
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: this.barChartLabels,
    datasets: []
  };

  public pieChartOptions: ChartOptions = { responsive: true };
  public pieChartLabels: string[] = ['Pending', 'Approved', 'Rejected'];
  public pieChartData: ChartData<'pie'> = {
    labels: this.pieChartLabels,
    datasets: []
  };

  public userId: number = 0;
  public userRole: number = 0;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private pauseRequestService: PauseRequestService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.userService.getUserById(this.userId).subscribe(user => {
        if (user.role) {
          this.userRole = user.role.id;
        }
        if (this.userRole === 2) {
          this.loadStatsForTester();
        } else {
          // Affichage/redirect alternatif si l’utilisateur n’est pas un testeur
        }
      });
    });
  }

  loadStatsForTester() {
    this.pauseRequestService.getUserStats(this.userId, 0)
      .subscribe((stats: PauseStats) => {
        this.barChartData.datasets = [
          {
            label: 'Nombre de demandes',
            data: [stats.pending, stats.approved, stats.rejected],
            backgroundColor: ['#FFC107', '#4CAF50', '#F44336']
          }
        ];

        this.pieChartData.datasets = [
          {
            data: [stats.pending, stats.approved, stats.rejected],
            backgroundColor: ['#FFEB3B', '#8BC34A', '#E91E63']
          }
        ];
      });
  }

  close() {
    // Vous pouvez fermer le dialog via MatDialogRef, ou laisser ce throw pour debug
    throw new Error('Method not implemented.');
  }
}
