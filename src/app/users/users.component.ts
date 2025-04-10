import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserlogComponent } from "./userlog/userlog.component";
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Role } from './models/role.model';
import { RoleService } from './service/roles/role.service';
import { User } from './models/user.model';
import { UserService } from './service/users/user.service';
import { DesignationsService } from './service/designations/designations.service';



@Component({
  selector: 'app-users',
  standalone:true,
  imports: [CommonModule, FormsModule, UserlogComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class UsersComponent{

  constructor(private roleService: RoleService, private userService: UserService, private designationService: DesignationsService) { }

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
    this.loadDesignations();
  }

  // ****************Top Tab*****************//
  activeTab: string = 'users';

  setActiveTab(tab: string) {
    this.activeTab = tab;
    console.log(tab, this.activeTab);
  }
  // ****************End**********************//



  // *****************Users******************//
  users: User[] = [];  // array of users

  currentUser: User = {  // single user object
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    designation: '',
    avatar: ''
  };
  isEditing: boolean = false;

  editUser(user: any) {
    this.isEditing = true;
    this.currentUser = { ...user, password: '', confirmPassword: '' };
    this.setActiveTab('addEditUser');
  }

  deleteUser(userId: number) {
    const confirmDelete = confirm("Are you sure you want to delete that user ?");
    if (confirmDelete) {
      this.userService.deleteUser(userId).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  // *****************End******************//



  // ************Add/Edit Users***********//
  avatars: string[] = [
    'assets/avatars/avatar1.svg',
    'assets/avatars/avatar2.svg',
    'assets/avatars/avatar3.svg',
    'assets/avatars/avatar4.svg',
  ];

  selectAvatar(avatar: string): void {
    this.currentUser.avatar = avatar;
  }

  backtoUsers(): void {
    this.activeTab = 'users';
  }

  addUser() {
    this.isEditing = false;
    this.currentUser = {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      designation: '',
      avatar: '',
      created: ''
    };
    this.setActiveTab('addEditUser');
  }

  saveUser() {
    // Basic Validation
    if (
      !this.currentUser.name ||
      !this.currentUser.email ||
      !this.currentUser.username ||
      !this.currentUser.password ||
      !this.currentUser.confirmPassword ||
      !this.currentUser.role ||
      !this.currentUser.designation ||
      !this.currentUser.avatar
    ) {
      alert('Please fill in all fields before saving the user.');
      return;
    }
  
    if (this.currentUser.password !== this.currentUser.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
    const payload = { ...this.currentUser };
    delete payload.confirmPassword; // optional

    if (this.isEditing) {
      this.userService.updateUser(this.currentUser.id!, payload).subscribe(() => {
        this.loadUsers();
        this.resetForm();
        this.setActiveTab('users');
      });
    } else {
      this.userService.addUser(payload).subscribe(() => {
        this.loadUsers();
        this.resetForm();
        this.setActiveTab('users');
      });
    }
  }

  resetForm(): void {
    this.currentUser = {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      designation: '',
      avatar: '',
      created: ''
    };
    this.selectedOption = null;
    this.selectedDesignation = null;
  }

    // *********Custom Select************** //
    // Role
    dropdownOpen = false;
    selectedOption: string | null = null;

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }

    selectOption(value: string, event: MouseEvent): void {
      event.stopPropagation();
      this.selectedOption = value;
      this.currentUser.role = value;
      setTimeout(() => {
        this.dropdownOpen = false;
      }, 200);
    }

    // Designation
    designationDropdownOpen = false;
    selectedDesignation: string | null = null;

    toggleDesignationDropdown() {
      this.designationDropdownOpen = !this.designationDropdownOpen;
    }

    selectDesignation(value: string, event: MouseEvent): void {
      event.stopPropagation();
      this.selectedDesignation = value;
      this.currentUser.designation = value;

      setTimeout(() => {
        this.designationDropdownOpen = false;
      }, 200);
    }
    
    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-select')) {
        this.dropdownOpen = false;
        this.designationDropdownOpen = false;
      }
    }
  //****************End******************* //



  //****************Roles***************** //

  roles: Role[] = [];
  
  loadRoles() {
    this.roleService.getRoles().subscribe(data => {
      this.roles = data;
    });
  }
  
  newRole: { name: string; description: string; permissions: string[] } = {
    name: '',
    description: '',
    permissions: []
  };

allPermissions: string[] = [
  'Home',
  'Dashboard',
  'Reports',
  'Analysis',
  'User Management',
  'Settings',
  'Sensor Health',
];

addRole() {
  console.log('Button clicked')
  if (this.newRole.name && !this.roles.find(r => r.name === this.newRole.name)) {

    const roleToSend = {
      ...this.newRole,
      permissions: `{${this.newRole.permissions.join(',')}}`
    };
    this.roleService.addRole(roleToSend as any).subscribe(() => {
      this.newRole = { name: '', description: '', permissions: [] };
      this.loadRoles();
      this.updateRoleOptions();
    });
  }
}


togglePermission(permission: string) {

  if (!Array.isArray(this.newRole.permissions)) {
    this.newRole.permissions = [];
    
  }
  
  const index = this.newRole.permissions.indexOf(permission);
  if (index > -1) {
    this.newRole.permissions.splice(index, 1);
  } else {
    this.newRole.permissions.push(permission);
  }

  console.log("b4S",this.newRole.permissions);
  const newper = this.newRole.permissions.join(', ');
  console.log("after",`"${newper}"`);
}

updateRoleOptions() {
  // Optional: Ensure selected role stays valid after role list is updated
  if (!this.roles.find(r => r.name === this.selectedOption)) {
    this.selectedOption = null;
  }
}

deleteRole(roleName: string) {
  const confirmDelete = confirm(`Are you sure you want to delete the role "${roleName}"?`);
  if (confirmDelete) {
    this.roleService.deleteRoleByName(roleName).subscribe(() => {
      this.loadRoles(); // Refresh list
    });
  }
}
  //****************End*******************//



  //***************Designation*********** //
   // Replace hardcoded list
designations: any[] = [];

// Object for the form
newDesignation = { title: '', description: '' };

// Load designations from DB
loadDesignations() {
  this.designationService.getDesignations().subscribe(
    (data) => {
      this.designations = data;
    },
    (error) => {
      console.error('Error loading designations:', error);
    }
  );
}

// Add designation to DB
addDesignation() {
  if (this.newDesignation.title && this.newDesignation.description) {
    this.designationService.addDesignation(this.newDesignation).subscribe(
      () => {
        this.loadDesignations();
        this.resetDesForm();
      },
      (error) => {
        console.error('Error adding designation:', error);
      }
    );
  }
}

// Delete designation from DB
deleteDesignation(designation: any) {
  const confirmDesDelete = confirm(`Are you sure you want to delete that designation ?`);
  if (confirmDesDelete) {
  this.designationService.deleteDesignation(designation.id).subscribe(
    () => {
      this.loadDesignations();
    },
    (error) => {
      console.error('Error deleting designation:', error);
    }
  );
  }
}

// Reset form
resetDesForm() {
  this.newDesignation = { title: '', description: '' };
}
  // ***********************End*******************************//
}