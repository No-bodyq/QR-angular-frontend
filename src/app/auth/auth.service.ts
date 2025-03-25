import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  constructor(private http: HttpClient) {}

  // Get the current authenticated user
  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('token');  // Assuming JWT is stored in localStorage

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });

    return this.http.get(`${environment.apiUrl}/current-user`, { headers });
  }

  registerUser(userData: any) {
    const formData = new URLSearchParams();
    Object.keys(userData).forEach((key) => formData.append(key, userData[key]));

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post(`${environment.apiUrl}/register`, formData.toString(), { headers });
  }
}
