import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BarcodeFormat } from '@zxing/library';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-qr-scanner',
  standalone: false,
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.css'
})
export class QrScannerComponent {
  scannedData: any = null; // Holds the scanned QR code data
  allowedFormats = [BarcodeFormat.QR_CODE];
  apiUrl = `${environment.apiUrl}/api/v1/meal/consume`; // Change to match your API
  isValidating = false;
  private secretKey = 'your-encryption-key';
  private hmacKey = 'your-signing-key';
  private scannedQRs = new Set(); // ✅ Prevent duplicate scans

  getMealType(timestamp: string): string {
    const date = new Date(timestamp); // Convert timestamp string to Date object
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = hours * 60 + minutes; // Convert to total minutes for easy comparison
  
    console.log(`Extracted Time: ${hours}:${minutes} (${time} minutes)`); // ✅ Log exact time
  
    if (time >= 390 && time <= 600) { // 6:30 AM - 10:00 AM
      console.log("Assigned Meal Type: breakfast"); // ✅ Debug meal type
      return 'breakfast';
    } else if (time >= 720 && time <= 900) { // 12:00 PM - 3:00 PM
      console.log("Assigned Meal Type: lunch");
      return 'lunch';
    } else if (time >= 1020 && time <= 1200) { // 5:00 PM - 8:00 PM
      console.log("Assigned Meal Type: supper");
      return 'supper';
    } else {
      console.log("Assigned Meal Type: invalid (Outside meal hours)");
      return 'invalid'; // Outside meal hours
    }
  }
    

  constructor(private http: HttpClient) {}

  /** 🔹 Handles successful QR code scan */
  onScanSuccess(qrText: string) {
    try {
      // ✅ Step 1: Decrypt & Validate the QR Code
      const decryptedData = this.decryptAndValidateQRCode(qrText);
      if (!decryptedData) {
        console.error("Invalid or tampered QR Code!");
        alert("Invalid or tampered QR Code!");
        return;
      }

      this.scannedData = decryptedData; // ✅ Store valid decrypted data

      // ✅ Step 2: Prevent Duplicate Scan
      if (this.scannedQRs.has(this.scannedData.id)) {
        alert("QR Code already scanned!");
        return;
      }
      this.scannedQRs.add(this.scannedData.id);

      // ✅ Step 3: Assign Meal Type Based on Time
      if (this.scannedData.timestamp) {
        this.scannedData.mealType = this.getMealType(this.scannedData.timestamp);
      } else {
        console.warn("Timestamp missing in scanned QR code!");
      }

      console.log("Scanned QR Data Before Sending:", this.scannedData);
      this.validateQRCode(); // ✅ Proceed to validate QR with backend
    } catch (error) {
      console.error("Invalid QR Code format!", error);
      alert("Invalid QR Code. Please try again.");
    }
  }

  /** 🔹 Decrypts and verifies QR code authenticity */
  decryptAndValidateQRCode(encryptedData: string): any {
    try {
      // ✅ Step 1: Decrypt the QR Code Data
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedData) throw new Error("Decryption failed");

      const qrData = JSON.parse(decryptedData);
      console.log("Decrypted QR Data:", qrData);

      // ✅ Step 2: Extract and Verify Signature
      const receivedSignature = qrData.signature;
      delete qrData.signature;

      const computedSignature = CryptoJS.HmacSHA256(
        JSON.stringify(qrData),
        this.hmacKey
      ).toString();

      if (computedSignature !== receivedSignature) {
        console.error("Invalid QR Code: Signature Mismatch!");
        return null;
      }

      console.log("QR Code is Valid!");
      return qrData;
    } catch (error) {
      console.error("QR Code Decryption or Verification Failed:", error);
      return null;
    }
  }


  /** 🔹 Sends the QR data for validation */
  validateQRCode() {
    if (!this.scannedData) {
      console.error("No scanned QR data available!");
      return;
    }

    this.isValidating = true;
    const token = localStorage.getItem('token');
    console.log("Auth Token:", token);

    if (!token) {
      console.error("No authentication token found!");
      alert("Authentication required. Please log in.");
      this.isValidating = false;
      return;
    }

    // ✅ Extract required fields from scanned QR data
    const { matricNumber, username, mealId, id, timestamp } = this.scannedData;
    const mealType = this.getMealType(timestamp);
    console.log("Meal Type Assigned:", mealType);

    // ✅ Prepare x-www-form-urlencoded data
    const body = new HttpParams()
      .set('matricNumber', matricNumber)
      .set('username', username) // Backend expects "name"
      .set('mealType', mealType)
      .set('mealId', mealId.toString()) // Convert mealId to string
      .set('userId', id.toString()); // Convert userId to string

    console.log("Final Request Body:", body.toString());

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    // ✅ Send the request to the backend
    this.http.post(this.apiUrl, body.toString(), { headers }).subscribe({
      next: (response) => {
        console.log("Validation Success:", response);
        alert("QR Code Validated Successfully!");
      },
      error: (err) => {
        console.error("Validation Failed:", err);
        alert(`Error: ${err.error?.message || "Validation failed!"}`);
      },
      complete: () => {
        this.isValidating = false;
      }
    });
  }
}
  
