import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-editor',
  standalone: true,
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.css'],
})
export class FileEditorComponent implements OnInit {
  @Input() file!: { id: number; name: string };
  content = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get(`/api/file-content/${this.file.id}`, { responseType: 'text' }).subscribe(data => {
      this.content = data;
    });
  }

  saveFile() {
    this.http.post(`/api/save-file/${this.file.id}`, { content: this.content }).subscribe();
  }
}
