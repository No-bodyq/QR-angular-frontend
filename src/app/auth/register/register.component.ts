import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  registerError: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required]],
      matricNo: ['', [Validators.required]]
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerError = "Please fill in all fields correctly.";
      return;
    }
  
    const registerData = this.registerForm.value;
  
    // Prepare x-www-form-urlencoded data
    const formData = new HttpParams()
      .set('email', registerData.email)
      .set('password', registerData.password)
      .set('name', registerData.name)
      .set('matricNo', registerData.matricNo);
  
    // Send POST request with the correct headers and form data
    this.http.post(`${environment.apiUrl}/api/v1/auth/register`, formData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    }).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        alert('Registration Successful!');
  
        // Navigate to login or another page
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("Registration Error:", err);
        this.registerError = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
