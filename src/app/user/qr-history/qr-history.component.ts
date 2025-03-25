import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-qr-history',
  standalone: false,
  templateUrl: './qr-history.component.html',
  styleUrl: './qr-history.component.css'
})
export class QrHistoryComponent {
  fullMealHistory: any[] = [];
  userId: number | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] ? Number(params['userId']) : Number(localStorage.getItem('userId'));

      if (this.userId) {
        this.loadFullMealHistory(this.userId);
      } else {
        console.error("No user ID found! Redirecting to dashboard...");
        this.router.navigate(['/user-dashboard']); // ✅ Now it works!
      }
    });
  }
  

  loadFullMealHistory(userId: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found!");
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const apiUrl = `${environment.apiUrl}/api/v1/meal/history/${userId}`;

    this.http.get(apiUrl, { headers }).subscribe({
      next: (history: any) => {
        console.log("Full Meal History:", history);
        this.fullMealHistory = history;
      },
      error: (err) => {
        console.error("Error fetching full meal history:", err);
      }
    });
  }
}
