import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-result',
  templateUrl: './view-result.component.html',
  styleUrls: ['./view-result.component.css'],
})
export class ViewResultComponent implements OnInit {
  @Input() reportId!: number;
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {}
  closeModal() {
    this.close.emit();
  }
  viewReport() {
    //取得此project的projectId reportId
    //在report頁面傳給後端取得chart table內容
    //跳轉到report
    this.closeModal();
    this.router.navigate(['/report'], {
      queryParams: { reportId: this.reportId },
    });
    // alert('New report ID: ' + this.reportId);
  }
}
