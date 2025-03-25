import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
 // ✅ Import environment

@Component({
  selector: 'app-admin-user-search',
  standalone: false,
  templateUrl: './admin-user-search.component.html',
  styleUrl: './admin-user-search.component.css'
})
export class AdminUserSearchComponent implements OnInit {
  matricNumber: string = ''; // Stores the search input
  userDetails: any = null; // Stores searched user data
  isLoading = false;
  errorMessage: string = '';
  allUsers: any[] = []; // ✅ Stores all users
  filteredUsers: any[] = []; // ✅ Stores filtered users
  private apiUrl = `${environment.apiUrl}/api/v1`; // ✅ Use environment variable

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllUsers(); // ✅ Load all users on page load
  }

  /** 🔹 Fetch all users and store them */
  fetchAllUsers() {
    this.isLoading = true;
    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage = 'Authentication required. Please log in.';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/users`, { headers }).subscribe({
      next: (response: any) => {
        this.allUsers = response;
        this.filteredUsers = response;
      },
      error: (err) => {
        console.error("Error fetching users:", err);
        this.errorMessage = err.error?.message || 'Failed to load users.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /** 🔹 Searches a user by matricNumber */
  searchUser() {
    if (!this.matricNumber.trim()) {
      this.errorMessage = 'Please enter a valid matric number.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.userDetails = null;

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Authentication required. Please log in.';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new HttpParams().set('matricNumber', this.matricNumber);

    this.http.post(`${this.apiUrl}/user-meal/get-user-meal-by-mat-no`, body.toString(), { headers }).subscribe({
      next: (response) => {
        if (response) {
          this.userDetails = response;
          console.log("User Found:", response);
        } else {
          this.errorMessage = "User not found.";
        }
      },
      error: (err) => {
        console.error("Error fetching user:", err);
        this.errorMessage = err.error?.message || 'User not found or unauthorized access.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /** 🔹 Filters users in the list as admin types in search bar */
  filterUsers() {
    if (!this.matricNumber.trim()) {
      this.filteredUsers = this.allUsers; // Show all users if search is empty
    } else {
      this.filteredUsers = this.allUsers.filter(user =>
        user.matricNumber.includes(this.matricNumber)
      );
    }
  }
}
