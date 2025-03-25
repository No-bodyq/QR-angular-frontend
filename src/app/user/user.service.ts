import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
// import {axios} from "axios";

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  matricNumber: string;
  mealId?: number; 
  roleId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/v1/auth/curr-user`; // Adjust the base URL accordingly

  constructor(private http: HttpClient, private router: Router) {}

  loadUserDetails(): Observable<any> {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found! User might not be logged in.");
      return new Observable(observer => observer.error("No token found"));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(this.apiUrl, { headers });
  }

  logout() {
    console.log("Logging out user...");

    // ✅ Remove stored user session details
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.clear(); // If sessionStorage is used

    // ✅ Redirect to login page
    this.router.navigate(['/login']);
  }
}
