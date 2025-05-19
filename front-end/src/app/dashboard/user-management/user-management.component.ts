// src/app/dashboard/user-management/user-management.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { HttpClient }                     from '@angular/common/http';
import { MatTableModule }                 from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule }         from '@angular/material/sort';
import { MatIconModule }                  from '@angular/material/icon';
import { MatButtonModule }                from '@angular/material/button';
import { MatFormFieldModule }             from '@angular/material/form-field';
import { MatInputModule }                 from '@angular/material/input';
import { MatSnackBar }                    from '@angular/material/snack-bar';
import { MatTooltipModule }               from '@angular/material/tooltip';
import { Router }                         from '@angular/router';
import { forkJoin, of }                   from 'rxjs';
import { map, catchError }                from 'rxjs/operators';
import { MatTableDataSource }             from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { EditUserData, EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';

export interface User {
  id: number;
  titre: string;          // "Mr." / "Mme."
  nom: string;
  prenom: string;
  ncin: string;
  email: string;
  dateEmbauche: string;   // ISO date
  salaire: number;
  role: { id : number, libelle: string };
  avatarUrl?: string;
  genre: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  displayedColumns = [
    'titre','avatar','nom','prenom','ncin','email',
    'dateEmbauche','salaire','role','actions'
  ];
  dataSource = new MatTableDataSource<User>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.http.get<User[]>('http://localhost:8080/api/users').subscribe(users => {
      // On génère un observable par utilisateur pour récupérer son avatar
      users.forEach(u => {
        u.titre = u.genre === 'Femme' ? 'Mme.' : 'Mr.';
      });

      const obs$ = users.map(u =>
        this.http.get<any>(`http://localhost:8080/api/users/${u.id}/profile-image/meta`).pipe(
          map(meta =>
            meta?.filePath
              ? `http://localhost:8080/api/users/${u.id}/profile-image/raw?ts=${Date.now()}`
              : 'https://i.imgur.com/vtrfxgY.png'
          ),
          catchError(() => of('https://i.imgur.com/vtrfxgY.png'))
        )
      );

      forkJoin(obs$).subscribe(urls => {
        users.forEach((u, i) => u.avatarUrl = urls[i]);
        this.dataSource.data = users;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort      = this.sort;
      });
    },
    () => this.snack.open('Échec chargement utilisateurs','Fermer',{duration:2000}));
  }

  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filter;
  }

  onEdit(u: User) {
    // interdire edit d'un autre superviseur
    if (u.role.id === 3) {
      this.snack.open("Vous ne pouvez pas modifier un autre superviseur",'Fermer',{duration:2000});
      return;
    }
  
    // ouvrir le dialog avec les données du user
    const data: EditUserData = {
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      genre: u.genre,
      ncin: u.ncin,
      dateEmbauche: u.dateEmbauche,
      salaire: u.salaire
    };
    const ref = this.dialog.open(EditUserDialogComponent, {
      width: '600px',
      data
    });
    ref.afterClosed().subscribe(updated => {
      if (updated) {
        this.loadUsers();
      }
    });
  }
  
  onDelete(u: User)  {
    if(!confirm(`Supprimer ${u.prenom} ${u.nom} ?`)) return;
    this.http.put(`http://localhost:8080/api/users/delete/${u.id}`,{}).subscribe(
      () => { this.snack.open('Supprimé','Fermer',{duration:2000}); this.loadUsers(); },
      () => this.snack.open('Erreur suppression','Fermer',{duration:2000})
    );
  }
  onAnalytics(u: User){ this.router.navigate(['/dashboard/users',u.id,'analytics']); }
  onMessage(u: User)  { this.router.navigate(['/dashboard/messages'],{ queryParams:{to:u.id} }); }

  onAdd() {
    const ref = this.dialog.open(AddUserDialogComponent, {
      width: '600px'
    });
    ref.afterClosed().subscribe( result => {
      if (result === true) this.loadUsers();
    });
  }
}
