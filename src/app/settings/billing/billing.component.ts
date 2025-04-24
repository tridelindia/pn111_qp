import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-billing',
  imports: [CommonModule],
  standalone:true,
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent {

  license = {
    planName: 'Pro',
    licenseId: 'LIC-0023-AF87',
    licenseName: 'Multi-User License',
    licenseKey: 'XXXX-XXXX-XXXX-XXXX',
    type: 'Multi-User',
    startDate: '2024-05-10',
    expiryDate: '2025-05-10',
    duration: '1 Year',
    renewalStatus: 'Manual',
    allowedDevices: 5,
    status: 'Active',
    registeredTo: 'company@example.com',
    assignedAdmin: 'admin@enterprise.com',
    description: 'Used for enterprise-wide deployment with 5 activations.'
  };

  renew() {
    alert('Renewal initiated!');
  }

  resetKey() {
    alert('License key reset requested!');
  }

  downloadPDF() {
    alert('Downloading license certificate...');
  }

  reassignAdmin() {
    alert('Redirecting to admin reassignment page...');
  }

}