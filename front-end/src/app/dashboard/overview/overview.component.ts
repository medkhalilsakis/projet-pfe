// src/app/overview/overview.component.ts
import { Component, OnInit } from '@angular/core';
import { NewsArticle, NewsService } from '../../services/news.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  imports:[
    CommonModule,
    MatCardModule
  ]
})
export class OverviewComponent implements OnInit {

  articles: NewsArticle[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getTechNews().subscribe({
      next: (data) => {
        this.articles = data.articles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des actualités', error);
        this.errorMessage = "Erreur lors du chargement des actualités";
        this.loading = false;
      }
    });
  }
}
