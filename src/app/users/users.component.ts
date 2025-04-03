import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserlogComponent } from "./userlog/userlog.component";



@Component({
  selector: 'app-users',
  standalone:true,
  imports: [CommonModule, FormsModule, UserlogComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent{

  // ****************Top Tab*****************//
  activeTab: string = 'addEditUser';

  setActiveTab(tab: string) {
    this.activeTab = tab;
    console.log(tab, this.activeTab);
  }
  // ****************End**********************//



  // *****************Users******************//
  users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', username: 'John', role: 'Administrator', designation: 'Project Manager', created: '2025-03-25 08:53:21', image: 'fas fa-user-circle' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', username: 'Jane', role: 'User', designation: 'Developer', created: '2025-03-25 08:53:21', image: 'fas fa-user-circle' },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', username: 'Michael', role: 'Moderator', designation: 'UI Designer', created: '2025-03-25 08:53:21', image: 'fas fa-user-circle' },
    { id: 4, name: 'Ganapathy', email: 'ganapathy@example.com', username: 'Ganapathy', role: 'Administrator', designation: 'Developer', created: '2025-03-25 08:53:21', image: 'fas fa-user-circle' },
    { id: 3, name: 'Kishore', email: 'kishore@example.com', username: 'Kishore', role: 'User', designation: 'UI Designer', created: '2025-03-25 08:53:21', image: 'fas fa-user-circle' },
  ];

  editUser(user: any) {
    this.isEditing = true;
    this.currentUser = { ...user };
    this.setActiveTab('addEditUser');
  }

  deleteUser(userId: number) {
    this.users = this.users.filter((user) => user.id !== userId);
  }
  // *****************End******************//



  // ************Add/Edit Users***********//
  backtoUsers(): void {
    this.activeTab = 'users';
  }

  addUser() {
    this.isEditing = false;
    this.currentUser = { name: '', email: '', role: '', designation: '', created: '' };
    this.setActiveTab('addEditUser');
  }

  saveUser() {
    if (this.isEditing) {
      this.users = this.users.map((user) => (user.id === this.currentUser.id ? this.currentUser : user));
    } else {
      this.currentUser.id = this.users.length + 1;
      this.users.push({ ...this.currentUser });
    }
    this.setActiveTab('users');
  }
  //****************End******************* //



  //****************Roles***************** //

  roles = [
    { name: 'Administrator', description: 'Full system access' },
    { name: 'User', description: 'Limited access to system features' },
    { name: 'Moderator', description: 'Content management access' }
  ];

  addRole() {
    if (this.newRole.name && this.newRole.description) {
        this.roles.push({ ...this.newRole });
        this.resetForm();
    }
  }

  deleteRole(role: any) {
    this.roles = this.roles.filter(r => r !== role);
  }
  //****************End*******************//



  //***************Designation*********** //
  designations = [
    { title: 'Software Engineer', description: 'Develops and maintains software solutions' },
    { title: 'Project Manager', description: 'Oversees projects and team collaboration' },
    { title: 'HR Manager', description: 'Manages human resources and recruitment' }
  ];

  addDesignation() {
    if (this.newDesignation.title && this.newDesignation.description) {
        this.designations.push({ ...this.newDesignation });
        this.resetForm();
    }
  }
  
  deleteDesignation(designation: any) {
    this.designations = this.designations.filter(d => d !== designation);
  }

  resetForm() {
    this.newRole = { name: '', description: '' };
  }

  newRole = { name: '', description: '' };
  newDesignation = { title: '', description: '' };
  isEditing: boolean = false;
  currentUser: any = { name: '', email: '', role: '', designation: '', created: '' };
  // ***********************End*******************************//



// ************************User Log*************************//

selectedUser: any = null;
  activeUsers = [
    {
      name: 'Allwin',
      email: 'user1@example.com',
      icon: 'fas fa-user-circle',
      activityLogs: [
        {
          timestamp: '11-16-2023 4:27 pm',
          title: 'Accessing the Account Delete',
          icon: 'fas fa-user-circle',
          events: [
            {
              timestamp: '11-16-2023 4:37 pm',
              status: 'success',
              message:
                'The user "ABC" Successful event after correct password confirmation',
            },
            {
              timestamp: '11-16-2023 4:37 pm',
              status: 'failure',
              message:
                'The user "ABC" Failed event after wrong password confirmation',
            },
          ],
        },
        {
          timestamp: '11-16-2023 4:27 pm',
          title: 'Delete Process',
          icon: 'delete',
          events: [
            {
              timestamp: '11-16-2023 4:37 pm',
              status: 'success',
              message: 'The user "ABC" Success of below verifications.',
            },
            {
              timestamp: '11-16-2023 4:27 pm',
              status: 'success',
              message: 'Email Verification',
            },
            {
              timestamp: '11-16-2023 4:27 pm',
              status: 'failure',
              message: 'Phone Number Verification Rejected',
            },
            {
              timestamp: '11-16-2023 4:37 pm',
              status: 'failure',
              message:
                'The user "ABC" Failure of final delete event from the respective Seebiz Product.',
            },
          ],
        },
      ],
    },
    {
      name: 'Ganapathy',
      email: 'user2@example.com',
      icon: 'fas fa-user-circle',
      activityLogs: [
        {
          timestamp: '11-16-2023 4:27 pm',
          title: 'Delete Process',
          icon: 'delete',
          events: [
            {
              timestamp: '11-16-2023 4:37 pm',
              status: 'success',
              message: 'The user "ABC" Success of below verifications.',
            },
            {
              timestamp: '11-16-2023 4:27 pm',
              status: 'success',
              message: 'Email Verification',
            },
            {
              timestamp: '11-16-2023 4:27 pm',
              status: 'failure',
              message: 'Phone Number Verification Rejected',
            },
            {
              timestamp: '11-16-2023 4:37 pm',
              status: 'failure',
              message:
                'The user "ABC" Failure of final delete event from the respective Seebiz Product.',
            },
          ],
        },
      ],
    },
  ];


  selectUser(user: any) {
    this.selectedUser = user;
    console.log('Selected:', user);
  }

  // ***************************End***************************** //
}