import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserlogComponent } from "./userlog/userlog.component";
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Role } from './models/role.model';
import { RoleService } from './service/roles/role.service';
import { User } from './models/user.model';
import { UserService } from './service/users/user.service';
import { DesignationsService } from './service/designations/designations.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Settings } from '@amcharts/amcharts5/.internal/core/util/Entity';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserlogComponent,
    NgSelectModule,
    MultiSelectModule,
    FormsModule,
    HttpClientModule],
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
  providers: [RoleService, UserService, DesignationsService]
})
export class UsersComponent {

  constructor(private roleService: RoleService, private userService: UserService, private designationService: DesignationsService, private toast: ToastrService) { }

  // ngOnInit() {
  //   this.loadRoles();
  //   this.loadUsers();
  //   this.loadDesignations();
  //   this.generateAllPermissionOptions();
  // }

  // ****************Top Tab*****************//
  activeTab: string = 'users';

  setActiveTab(tab: string) {
    this.activeTab = tab;

    if (tab === 'users') {
      this.resetForm();
      this.resetRoleForm();
      this.passwordTouched = false;
      this.usernameTouched = false;
      this.emailTouched = false;
    } if (tab === 'rolesDesignations') {
      this.resetForm();
      this.passwordTouched = false;
      this.usernameTouched = false;
      this.emailTouched = false;
    } if (tab === 'userLog') {
      this.resetForm();
      this.resetRoleForm();
      this.passwordTouched = false;
      this.usernameTouched = false;
      this.emailTouched = false;
    } if (tab === 'addEditUser') {
      this.resetRoleForm();
      this.passwordTouched = false;
      this.usernameTouched = false;
      this.emailTouched = false;
    }

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
    avatar: '',
    is_admin: false
  };


  isEditing: boolean = false;
  isEditingAdmin: boolean = false;

  editUser(user: any) {

    // Prevent edit option of Admin
    // if (user.is_admin) {
    //   alert("Prime Admin cannot be edited.");
    //   return;
    // }

    // Edit option for admin
    const confirmEdit = confirm("Are you sure you want to edit this user ?");
    if (confirmEdit) {
      this.isEditing = true;
      this.isEditingAdmin = user.is_admin ?? false;

      this.currentUser = { ...user, password: '', confirmPassword: '' };
      this.setActiveTab('addEditUser');
    }
  }


  deleteUser(userId: number) {

    const userToDelete = this.users.find(u => u.id === userId);

    // Prevent deletion of Admin
    if (userToDelete?.is_admin) {
      this.toast.info("Admin cannot be deleted.");
      return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete this user ?`);
    if (confirmDelete) {
      this.userService.deleteUser(userId).subscribe(() => {
        this.loadUsers();
      });
      this.toast.success(`User deleted successfully!`);
    }
  }


  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users.filter((users) => users.username !== 'tridelrecover');
    });
  }

  // *****************End******************//



  // ************Add/Edit Users***********//

  // ******Check Username/Email***********//

  usernameTaken: boolean = false;
  emailTaken: boolean = false;

  private usernameInput$ = new Subject<string>();
  private emailInput$ = new Subject<string>();

  ngOnInit(): void {

    this.loadRoles();
    this.loadUsers();
    this.loadDesignations();
    this.generateAllPermissionOptions();

    this.usernameInput$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(username => {
      if (!this.isEditing) {
        this.userService.checkUsername(username).subscribe(res => {
          this.usernameTaken = res.exists;
        });
      }
    });

    this.emailInput$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(email => {
      if (!this.isEditing) {
        this.userService.checkEmail(email).subscribe(res => {
          this.emailTaken = res.exists;
        });
      }
    });
  }

  isUsernameValid(): boolean {
    return /^[a-zA-Z0-9]+$/.test(this.currentUser.username);
  }

  isEmailFormatValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.currentUser.email);
  }

  isPasswordValid(): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,15}$/.test(this.currentUser.password ?? '');
  }

  passwordTouched: boolean = false;
  usernameTouched: boolean = false;
  emailTouched: boolean = false;

  onUsernameInput(username: string): void {
    this.usernameInput$.next(username);
  }

  onEmailInput(email: string): void {
    this.emailInput$.next(email);
  }

  //*****************end*****************//

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
      is_admin: false,
    };
    this.setActiveTab('addEditUser');
  }

  saveUser() {
    // Basic Validation
    if (
      !this.currentUser.name ||
      !this.currentUser.email ||
      !this.currentUser.username ||
      (!this.isEditing && (!this.currentUser.password || !this.currentUser.confirmPassword)) ||
      (!this.isEditingAdmin && (!this.currentUser.role || !this.currentUser.designation)) ||
      !this.currentUser.avatar
    ) {
      this.toast.error('Please fill in all fields before saving the user.');
      return;
    }

    if (this.usernameTaken) {
      this.toast.error('Username is already taken.');
      return;
    }

    if (this.emailTaken) {
      this.toast.error('Email is already in use.');
      return;
    }

    if (!this.isEditing && this.currentUser.password !== this.currentUser.confirmPassword) {
      this.toast.error('Passwords do not match!');
      return;
    }

    const payload: any = { ...this.currentUser };
    delete payload.confirmPassword; // Remove confirmPassword before sending

    // Prevent setting is_admin manually via frontend
    if (!this.isEditing) {
      payload.is_admin = false;
    }

    // If editing Admin, REMOVE email, role, and designation completely from payload
    if (this.isEditingAdmin) {
      delete payload.email;
      delete payload.role;
      delete payload.designation;
    }

    if (this.isEditing) {
      this.userService.updateUser(this.currentUser.id!, payload).subscribe(() => {
        this.loadUsers();
        this.resetForm();
        this.setActiveTab('users');
      });
      this.toast.success('User updated successfully!');
    } else {
      this.userService.addUser(payload).subscribe(() => {
        this.loadUsers();
        this.resetForm();
        this.setActiveTab('users');
      });
      this.toast.success('User saved successfully!');
    }
  }




  resetForm(): void {
    this.isEditing = false;
    this.isEditingAdmin = false;

    this.currentUser = {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      designation: '',
      avatar: '',
      created: '',
      is_admin: false,
    };

    this.selectedRole = '';
    this.selectedDesignation = '';
  }



  // *********Custom Select************** //
  // Role
  dropdownOpen = false;
  selectedRole: string | null = null;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectRole(value: string, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedRole = value;
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

  filteredRoles: any[] = [];

  isEditRole: boolean = false;

  roleBeingEdited: string | null = null;


  loadRoles() {
    this.roleService.getRoles().subscribe(roles => {
      this.roles = roles;
      this.filteredRoles = roles.filter(role => role.name.toLowerCase() !== 'admin');
    });
  }


  newRole: {
    name: string;
    description: string;
    permissions: { [page: string]: string[] };
    flatPermissions?: string[]; // used only for ng-select binding
  } = {
      name: '',
      description: '',
      permissions: {},
      flatPermissions: []
    };


  allPermissions: string[] = [];

  pages: string[] = ['Home', 'Dashboard', 'Reports', 'Analysis', 'Sensor Health', 'Notification'];
  actions: string[] = ['read', 'write', 'execute'];

  permissionIcons: { [key: string]: string } = {
    'Home': 'fa-house',
    'Dashboard': 'fa-square-poll-vertical',
    'Analysis': 'fa-chart-line',
    'Reports': 'fa-rectangle-list',
    'User Management': 'fa-users-cog',
    'Settings': 'fa-gears',
    'Sensor Health': 'fa-heart-pulse',
    'Notification': 'fa-solid fa-envelope',
  };

  generateAllPermissionOptions() {
    this.allPermissions = [];
    for (const page of this.pages) {
      for (const action of this.actions) {
        this.allPermissions.push(`${page} - ${action}`);
      }
    }
  }


  // addRole() {

  //   const parsedPermissions: { [page: string]: string[] } = {};

  //   if (this.newRole.flatPermissions) {
  //     for (const perm of this.newRole.flatPermissions) {
  //       const [page, action] = perm.split(' - ');
  //       if (!parsedPermissions[page]) {
  //         parsedPermissions[page] = [];
  //       }
  //       if (!parsedPermissions[page].includes(action)) {
  //         parsedPermissions[page].push(action);
  //       }
  //     }
  //   }

  //   const roleToSend = {
  //     name: this.newRole.name,
  //     description: this.newRole.description,
  //     permissions: parsedPermissions
  //   };

  //   if (this.isEditRole && this.roleBeingEdited) {
  //     // Edit mode: call update API
  //     this.roleService.updateRole(this.roleBeingEdited, roleToSend).subscribe(() => {
  //       this.resetRoleForm();
  //       this.loadRoles();
  //     });
  //     this.toast.success('Role updated successfully!');
  //   } else {
  //     // Add mode: call add API
  //     this.roleService.addRole(roleToSend as Role).subscribe(() => {
  //       this.newRole = {
  //         name: '',
  //         description: '',
  //         permissions: {},
  //         flatPermissions: []
  //       };
  //       this.loadRoles();
  //       this.updateRoleOptions();
  //     });
  //     this.toast.success('Role added successfully!');
  //   }
  // }

  addRole() {
  const name = this.newRole.name?.trim();
  const description = this.newRole.description?.trim();
  const flatPermissions = this.newRole.flatPermissions || [];

  // Validation check
  if (!name || !description || flatPermissions.length === 0) {
    this.toast.error('Role name, description, and at least one permission are required.');
    return;
  }

  const parsedPermissions: { [page: string]: string[] } = {};

  for (const perm of flatPermissions) {
    const [page, action] = perm.split(' - ');
    if (!parsedPermissions[page]) {
      parsedPermissions[page] = [];
    }
    if (!parsedPermissions[page].includes(action)) {
      parsedPermissions[page].push(action);
    }
  }

  const roleToSend = {
    name,
    description,
    permissions: parsedPermissions
  };

  if (this.isEditRole && this.roleBeingEdited) {
    // Edit mode: call update API
    this.roleService.updateRole(this.roleBeingEdited, roleToSend).subscribe(() => {
      this.resetRoleForm();
      this.loadRoles();
      this.toast.success('Role updated successfully!');
    });
  } else {
    // Add mode: call add API
    this.roleService.addRole(roleToSend as Role).subscribe(() => {
      this.newRole = {
        name: '',
        description: '',
        permissions: {},
        flatPermissions: []
      };
      this.loadRoles();
      this.updateRoleOptions();
      this.toast.success('Role added successfully!');
    });
  }
}

  resetRoleForm() {
    this.newRole = {
      name: '',
      description: '',
      permissions: {},
      flatPermissions: []
    };
    this.isEditRole = false;
    this.roleBeingEdited = null;
  }

  objectEntries(obj: any): [string, string[]][] {
    return Object.entries(obj || {});
  }

  actionIcons: { [key: string]: string } = {
    read: 'fa-eye',
    write: 'fa-pen',
    execute: 'fa-terminal'
  };


  updateRoleOptions() {
    // Ensure selected role stays valid after role list is updated
    if (!this.roles.find(r => r.name === this.selectedRole)) {
      this.selectedRole = null;
    }
  }

  generateTooltip(page: string, actions: string[]): string {
    return `${page}\n${actions.map(a => `• ${a}`).join('\n')}`;
  }

  deleteRole(roleName: string) {

    if (roleName === "Admin") {
      this.toast.info("Role Admin cannot be deleted");
      return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete this role ?`);
    if (confirmDelete) {
      this.roleService.deleteRoleByName(roleName).subscribe(() => {
        this.loadRoles(); // Refresh list
      });
      this.toast.success(`Role deleted successfully!`);
    }
  }

  editRole(role: any) {

    if (role.name === "Admin") {
      this.toast.info("Role Admin cannot be edited");
      return;
    }

    const confirmEdit = confirm(`Are you sure you want to edit the role ?`);
    if (!confirmEdit) return;
    this.isEditRole = true;
    this.roleBeingEdited = role.name;

    // Flatten the permission object to ["Page - action"] format
    const flatPermissions: string[] = [];
    for (const page in role.permissions) {
      if (role.permissions.hasOwnProperty(page)) {
        const actions = role.permissions[page];
        for (const action of actions) {
          flatPermissions.push(`${page} - ${action}`);
        }
      }
    }

    this.newRole = {
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      flatPermissions: flatPermissions
    };

  }
  //****************End*******************//



  //***************Designation*********** //
  // Replace hardcoded list
  designations: any[] = [];

  filteredDesignations: any[] = [];

  // Object for the form
  newDesignation = { title: '', description: '' };

  // Load designations from DB
  loadDesignations() {
    this.designationService.getDesignations().subscribe(designations => {
      this.designations = designations;
      this.filteredDesignations = designations.filter(designation => designation.title.toLowerCase() !== 'admin');
    });
  }

  // Add designation to DB
  addDesignation() {
    const title = this.newDesignation.title?.trim();
    const description = this.newDesignation.description?.trim();

    if (title && description) {
      const payload = { title, description }; // use trimmed values

      this.designationService.addDesignation(payload).subscribe(
        () => {
          this.loadDesignations();
          this.resetDesForm();
          this.toast.success('Designation added successfully!');
        },
        (error) => {
          console.error('Error adding designation:', error);
        }
      );
    } else {
      this.toast.error('Both title and description are required.');
    }
  }

  // Delete designation from DB
  deleteDesignation(designation: any) {

    if (designation.title === "Admin") {
      this.toast.info("Designation Admin cannot be deleted");
      return;
    }

    const confirmDesDelete = confirm(`Are you sure you want to delete this designation ?`);
    if (confirmDesDelete) {
      this.designationService.deleteDesignation(designation.id).subscribe(
        () => {
          this.loadDesignations();
        },
        (error) => {
          console.error('Error deleting designation:', error);
        }
      );
      this.toast.success(`Designation deleted successfully!`);
    }
  }

  // Reset form
  resetDesForm() {
    this.newDesignation = { title: '', description: '' };
  }
  // ***********************End*******************************//
}
