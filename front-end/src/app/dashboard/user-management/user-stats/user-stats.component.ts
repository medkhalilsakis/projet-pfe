import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css']
})
export class UserStatsComponent implements OnInit {

  // ChartConfigurations initialisées « vides » : on remplira dans ngOnInit
  progressionCumule!: ChartConfiguration<'line'>;
  projetsAcceptesRejetes!: ChartConfiguration<'pie'>;
  projetsTestRevision!: ChartConfiguration<'bar'>;
  evolutionSalaire!: ChartConfiguration<'line'>;
  participationReunions!: ChartConfiguration<'bar'>;

  repartitionCategories!: ChartConfiguration<'polarArea'>;
  competencesUtilisateur!: ChartConfiguration<'radar'>;
  correlationXY!: ChartConfiguration<'scatter'>;

  ngOnInit(): void {
    // Utility : génère un tableau de `n` valeurs aléatoires entre min et max
    const randArray = (n: number, min: number, max: number) =>
      Array.from({ length: n }, () => Math.round(min + Math.random() * (max - min)));

    // 1. Progression cumulée : cumule les valeurs mois par mois
    const monthly = randArray(5, 1, 10);
    const cumul = monthly.reduce<number[]>((acc, v, i) => {
      acc.push((i === 0 ? 0 : acc[i - 1]) + v);
      return acc;
    }, []);
    this.progressionCumule = {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
        datasets: [{ label: 'Projets cumulés', data: cumul, fill: true }]
      },
      options: { responsive: true }
    };

    // 2. Acceptés vs Rejetés
    const accepted = Math.round(Math.random() * 100);
    const rejected = Math.round(Math.random() * 100);
    this.projetsAcceptesRejetes = {
      type: 'pie',
      data: {
        labels: ['Acceptés', 'Rejetés'],
        datasets: [{ data: [accepted, rejected] }]
      },
      options: { responsive: true }
    };

  const categories = ['Dev', 'Test', 'Docs', 'Support', 'Recherche'];
    this.repartitionCategories = {
      type: 'polarArea',
      data: {
        labels: categories,
        datasets: [{
          data: randArray(categories.length, 5, 30),
          // couleurs par défaut
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: { ticks: { backdropColor: 'rgba(255,255,255,0.7)' } }
        }
      }
    };

    // 7. Compétences utilisateur (radar)
    const skills = ['Angular', 'Vue', 'React', 'Node', 'Python'];
    this.competencesUtilisateur = {
      type: 'radar',
      data: {
        labels: skills,
        datasets: [{
          label: 'Niveau',
          data: randArray(skills.length, 1, 10),
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: { min: 0, max: 10, ticks: { stepSize: 2 } }
        }
      }
    };

    // 8. Corrélation X/Y (scatter)
    const points = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    this.correlationXY = {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Données aléatoires',
          data: points,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Variable X' } },
          y: { title: { display: true, text: 'Variable Y' } }
        }
      }
    };
  

    // 3. Test vs Révision
    const testCount = Math.round(Math.random() * 20);
    const reviewCount = Math.round(Math.random() * 20);
    this.projetsTestRevision = {
      type: 'bar',
      data: {
        labels: ['Test', 'Révision'],
        datasets: [{ label: 'Projets', data: [testCount, reviewCount] }]
      },
      options: { responsive: true, indexAxis: 'y' }
    };

    // 4. Évolution de salaire (chaque année un salaire aléatoire croissant un peu)
    const years = ['2020', '2021', '2022', '2023', '2024'];
    let prev = 30000;
    const salaries = years.map(() => {
      prev += Math.round(2000 + Math.random() * 5000);
      return prev;
    });
    this.evolutionSalaire = {
      type: 'line',
      data: { labels: years, datasets: [{ label: 'Salaire (€)', data: salaries, fill: true }] },
      options: { responsive: true }
    };

    // 5. Participation aux réunions (nombre de réunions par mois)
    this.participationReunions = {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
        datasets: [{ label: 'Réunions', data: randArray(5, 1, 8) }]
      },
      options: { responsive: true }
    };
  }
  
}
