import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-users',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent{

  activeTab: string = 'users';

  users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', username: 'John', role: 'Administrator', designation: 'Project Manager', created: '2025-03-25 08:53:21', image: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', username: 'Jane', role: 'User', designation: 'Developer', created: '2025-03-25 08:53:21', image: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', username: 'Michael', role: 'Moderator', designation: 'UI Designer', created: '2025-03-25 08:53:21', image: 'https://i.pravatar.cc/150?img=3' },
  ];

  roles = [
    { name: 'Administrator', description: 'Full system access' },
    { name: 'User', description: 'Limited access to system features' },
    { name: 'Moderator', description: 'Content management access' }
];

designations = [
  { title: 'Software Engineer', description: 'Develops and maintains software solutions' },
  { title: 'Project Manager', description: 'Oversees projects and team collaboration' },
  { title: 'HR Manager', description: 'Manages human resources and recruitment' }
];

  newRole = { name: '', description: '' };
  newDesignation = { title: '', description: '' };
  isEditing: boolean = false;
  currentUser: any = { name: '', email: '', role: '', designation: '', created: '' };

  setActiveTab(tab: string) {
    this.activeTab = tab;
    console.log(tab, this.activeTab);
  }

  addUser() {
    this.isEditing = false;
    this.currentUser = { name: '', email: '', role: '', designation: '', created: '' };
    this.setActiveTab('addEditUser');
  }

  editUser(user: any) {
    this.isEditing = true;
    this.currentUser = { ...user };
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

  deleteUser(userId: number) {
    this.users = this.users.filter((user) => user.id !== userId);
  }

  addRole() {
    if (this.newRole.name && this.newRole.description) {
        this.roles.push({ ...this.newRole });
        this.resetForm();
    }
}

deleteRole(role: any) {
  this.roles = this.roles.filter(r => r !== role);
}

resetForm() {
  this.newRole = { name: '', description: '' };
}

addDesignation() {
  if (this.newDesignation.title && this.newDesignation.description) {
      this.designations.push({ ...this.newDesignation });
      this.resetForm();
  }
}

deleteDesignation(designation: any) {
  this.designations = this.designations.filter(d => d !== designation);
}

  goBack(): void {
    this.activeTab = 'users';
}

}
