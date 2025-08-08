import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { LoggingService } from '../users/service/users/logging.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

interface Notification {
  id: number;
  station_id: string[];
  station_name: string[];
  user_name: string;
  user_email: string;
  enabled: string;
  user_phone_number: string;
  country_code: string;
}

interface Station {
  id: number;
  station_id: string;
  station_name: string;
  warning: string;
  danger: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    TableModule,
    ToastModule,
    InputSwitchModule,
    InputGroupModule,
    InputGroupAddonModule,
    MessageModule,
    TagModule,
    DialogModule,
    TextareaModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  providers: [MessageService, LoggingService],
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  searchText: string = '';
  displayAddDialog: boolean = false;
  displayEditDialog: boolean = false;
  selectedNotification: Notification | null = null;
  newNotification: Partial<Notification> = {
    station_id: [],
    station_name: [],
    user_name: '',
    user_email: '',
    enabled: 'true',
    user_phone_number: '',
    country_code: '+974',
  };
  errorMessage: string = '';
  successMessage: string = '';
  stations: Station[] = [];

  // stations: Station[] = [
  //   { id: 'ST001', name: 'Station 01' },
  //   { id: 'ST002', name: 'Station 02' },
  //   { id: 'ST003', name: 'Station 03' },
  //   { id: 'ST004', name: 'Station 04' },
  //   { id: 'ST005', name: 'Station 05' }
  // ];

  countryCodes = [
    { code: '+1', name: 'United States' },
    { code: '+44', name: 'United Kingdom' },
    { code: '+971', name: 'United Arab Emirates' },
    { code: '+974', name: 'Qatar' },
    { code: '+966', name: 'Saudi Arabia' },
    { code: '+964', name: 'Iraq' },
    { code: '+965', name: 'Kuwait' },
    { code: '+961', name: 'Lebanon' },
    { code: '+960', name: 'Maldives' },
    { code: '+963', name: 'Syria' },
    { code: '+962', name: 'Jordan' },
    { code: '+960', name: 'Maldives' },
    { code: '+91', name: 'India' },
    { code: '+998', name: 'Uzbekistan' },
    { code: '+996', name: 'Kyrgyzstan' },
    { code: '+995', name: 'Georgia' },
    { code: '+994', name: 'Azerbaijan' },
    { code: '+993', name: 'Turkmenistan' },
  ];

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService,
    private toast: ToastrService
  ) {}

  ngOnInit() {
    this.getStation();
    this.loadNotifications();
  }

  showAddDialog() {
    this.displayAddDialog = true;
    this.clearMessages();
    this.resetNewNotification();
  }

  hideAddDialog() {
    this.displayAddDialog = false;
    this.clearMessages();
    this.resetNewNotification();
  }

  resetNewNotification() {
    this.newNotification = {
      station_id: [],
      station_name: [],
      user_name: '',
      user_email: '',
      enabled: 'true',
      user_phone_number: '',
      country_code: '+974',
    };
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredNotifications = this.notifications;
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredNotifications = this.notifications.filter((notification) => {
      return (
        notification.station_id.some((id) =>
          id.toLowerCase().includes(searchLower)
        ) ||
        notification.station_name.some((name) =>
          name.toLowerCase().includes(searchLower)
        ) ||
        notification.user_name.toLowerCase().includes(searchLower) ||
        notification.user_email.toLowerCase().includes(searchLower) ||
        notification.user_phone_number.toLowerCase().includes(searchLower)
      );
    });
  }

  loadNotifications() {
    this.http.get(`${environment.apiUrl}/getAllNotifications`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notifications = response.data;
          this.filteredNotifications = this.notifications;
          console.log('Notifications array:', this.notifications);
        } else {
          console.error('API returned success: false');
          this.errorMessage =
            'Failed to load notifications: API returned error';
        }
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.errorMessage = 'Failed to load notifications: ' + error.message;
      },
    });
  }

  addNotification() {
    const {
      station_id,
      user_name,
      user_email,
      user_phone_number,
      country_code,
    } = this.newNotification;

    // Trim all input values
    const name = user_name?.trim();
    const email = user_email?.trim();
    const phone = user_phone_number?.trim();

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!station_id || !name || !email || !phone || !country_code) {
      this.errorMessage = 'All fields are required';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      this.errorMessage = 'Phone number must be exactly 10 digits and numeric';
      return;
    }

    console.log(this.newNotification);
    if (
      !this.newNotification.station_id ||
      !this.newNotification.station_name ||
      !this.newNotification.user_email ||
      !this.newNotification.user_name
    ) {
      this.errorMessage = 'Station, Name, and Email are required';
      return;
    }

    if (
      this.newNotification.user_phone_number &&
      this.newNotification.user_phone_number.length > 10
    ) {
      this.errorMessage = 'Phone number must be 10 digits or less';
      return;
    }

    this.http
      .post(`${environment.apiUrl}/addNotification`, this.newNotification)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.successMessage = 'Notification added successfully';
            this.toast.success(
              'New User added Successfully'
            );
            this.hideAddDialog();
            this.loadNotifications();
            // Add log
            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
              const currentUser = JSON.parse(currentUserStr);
              this.loggingService
                .addLog(
                  currentUser.username,
                  `New notification has been added`,
                  currentUser.id,
                  'N001',
                  'notification.component.ts/addNotification'
                )
                .subscribe({
                  next: () => console.log('Activity logged successfully'),
                  error: (err) => console.error('Failed to log activity', err),
                });
            }
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to add notification';
          console.error('Error adding notification:', error);
        },
      });
  }

  deleteNotification(id: number) {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    this.http
      .delete(`${environment.apiUrl}/deleteNotification/${id}`)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.successMessage = 'Notification deleted successfully';
            this.loadNotifications();
            // Add log
            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
              const currentUser = JSON.parse(currentUserStr);
              this.loggingService
                .addLog(
                  currentUser.username,
                  `Notification has been deleted`,
                  currentUser.id,
                  'N003',
                  'notification.component.ts/deleteNotification'
                )
                .subscribe({
                  next: () => console.log('Activity logged successfully'),
                  error: (err) => console.error('Failed to log activity', err),
                });
            }
          }
          this.toast.success('Notification Deleted Successfully');
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete notification';
          console.error('Error deleting notification:', error);
        },
      });
  }

  getStation() {
    this.http.get('http://localhost:3000/api/getStationConfig').subscribe(
      (response: any) => {
        console.log('Stations loaded:', response);
        this.stations = response;
        if (this.displayEditDialog) {
          this.updateSelectedStations();
        }
      },
      (error: any) => {
        console.error('Error fetching stations:', error);
        this.stations = [];
      }
    );
  }

  toggleNotificationStatus(notification: Notification) {
    const newStatus = notification.enabled === 'true' ? 'false' : 'true';
    this.http
      .put(
        `${environment.apiUrl}/updateNotificationStatus/${notification.id}`,
        {
          ...notification,
          enabled: newStatus,
        }
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.successMessage = 'Notification status updated successfully';
            this.loadNotifications();
          }
          // Add log
          const currentUserStr = localStorage.getItem('currentUser');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            this.loggingService
              .addLog(
                currentUser.username,
                `Notification status has been updated`,
                currentUser.id,
                'N004',
                'notification.component.ts/toggleNotificationStatus'
              )
              .subscribe({
                next: () => console.log('Activity logged successfully'),
                error: (err) => console.error('Failed to log activity', err),
              });
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to update notification status';
          console.error('Error updating notification status:', error);
        },
      });
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  onStationChange(event: any) {
    console.log('Station change event:', event);
    if (event && event.value) {
      const selectedStations = this.stations.filter((station) =>
        event.value.includes(station.station_id)
      );
      this.newNotification.station_id = event.value;
      this.newNotification.station_name = selectedStations.map(
        (station) => station.station_name
      );
      console.log('Selected stations:', selectedStations);
      console.log('Updated newNotification:', this.newNotification);
    } else {
      this.newNotification.station_id = [];
      this.newNotification.station_name = [];
    }
  }

  showEditDialog(notification: Notification) {
    // First ensure stations are loaded
    if (this.stations.length === 0) {
      this.getStation();
    }

    this.selectedNotification = { ...notification };
    this.newNotification = { ...notification };

    // Ensure station_id and station_name are arrays
    if (!Array.isArray(this.newNotification.station_id)) {
      this.newNotification.station_id = [
        this.newNotification.station_id as unknown as string,
      ];
    }
    if (!Array.isArray(this.newNotification.station_name)) {
      this.newNotification.station_name = [
        this.newNotification.station_name as unknown as string,
      ];
    }

    // Wait for stations to be loaded if needed
    if (this.stations.length === 0) {
      const checkStations = setInterval(() => {
        if (this.stations.length > 0) {
          clearInterval(checkStations);
          this.updateSelectedStations();
        }
      }, 100);
    } else {
      this.updateSelectedStations();
    }

    console.log('Edit dialog - newNotification:', this.newNotification);
    this.displayEditDialog = true;
    this.clearMessages();
  }

  private updateSelectedStations() {
    // Find the selected station objects from the stations array
    const selectedStations = this.stations.filter((station) =>
      this.newNotification.station_id?.includes(station.station_id)
    );

    console.log('Available stations:', this.stations);
    console.log('Current station_id:', this.newNotification.station_id);
    console.log('Selected stations:', selectedStations);

    // Update the newNotification with the selected stations
    if (selectedStations.length > 0) {
      this.newNotification.station_id = selectedStations.map(
        (station) => station.station_id
      );
      this.newNotification.station_name = selectedStations.map(
        (station) => station.station_name
      );
    }
  }

  hideEditDialog() {
    this.displayEditDialog = false;
    this.clearMessages();
    this.newNotification = {
      station_id: [],
      station_name: [],
      user_name: '',
      user_email: '',
      enabled: 'true',
      user_phone_number: '',
      country_code: '+974',
    };
    this.selectedNotification = null;
  }

  updateNotification() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    const {
      station_id,
      station_name,
      user_name,
      user_email,
      user_phone_number,
    } = this.newNotification;

    const name = String(user_name || '').trim();
    const email = String(user_email || '').trim();
    const phone = String(user_phone_number || '').trim();

    // Check if all required fields are filled
    if (!station_id || !station_name || !name || !email || !phone) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    // Phone number validation (10 digits and numeric only)
    const phoneRegex = /^\+?[0-9]{1,14}$/;
    if (!phoneRegex.test(phone)) {
      this.errorMessage = 'Enter a valid Phone number.';
      return;
    }

    if (
      !this.newNotification.station_id ||
      !this.newNotification.station_name ||
      !this.newNotification.user_email ||
      !this.newNotification.user_name
    ) {
      this.errorMessage = 'Station, Name, and Email are required';
      return;
    }

    if (
      this.newNotification.user_phone_number &&
      this.newNotification.user_phone_number.length > 15
    ) {
      this.errorMessage = 'Phone number must be 15 digits or less';
      return;
    }

    this.http
      .put(
        `${environment.apiUrl}/updateNotification/${this.selectedNotification?.id}`,
        this.newNotification
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.successMessage = 'Notification updated successfully';
            this.hideEditDialog();
            this.loadNotifications();
          }
          // Add log
          const currentUserStr = localStorage.getItem('currentUser');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            this.loggingService
              .addLog(
                currentUser.username,
                `Notification data has been updated`,
                currentUser.id,
                'N002',
                'notification.component.ts/updateNotification'
              )
              .subscribe({
                next: () => console.log('Activity logged successfully'),
                error: (err) => console.error('Failed to log activity', err),
              });
          }
          this.toast.success('Notification Updated Successfully');
        },
        error: (error) => {
          this.errorMessage = 'Failed to update notification';
          console.error('Error updating notification:', error);
        },
      });
  }

  hasNotificationPermission(permission: string): boolean {
    const permissionsStr = localStorage.getItem('permissions');
    if (!permissionsStr) return false;

    try {
      const permissions = JSON.parse(permissionsStr);
      const notificationPermissions = permissions['Notification'];
      return (
        notificationPermissions && notificationPermissions.includes(permission)
      );
    } catch (e) {
      console.error('Error parsing permissions', e);
      return false;
    }
  }
}
