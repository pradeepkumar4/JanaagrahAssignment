import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../_models/index';
import { AlertService, UserService } from '../_services/index';

@Component({
    moduleId: module.id.toString(),
    templateUrl: 'reset-password.component.html'
})

export class ResetPasswordComponent implements OnInit {
  currentUser: User;
  model: any = {};
  loading = false;
  users : any = [];

  constructor(
      private router: Router,
      private userService: UserService,
      private alertService: AlertService) { }

  ngOnInit() {
    this.users = JSON.parse(localStorage.getItem('users')) || [];
  }

  reset() {
    let filteredUser: User = this.users.filter(user => {
      return user.email === this.model.email;
    });
    this.model.id = filteredUser[0].id;
    this.model.fullName = filteredUser[0].fullName;
    this.model.resetPassword = true;
    console.log(this.model);
    this.userService.update(this.model.id, this.model)
          .subscribe(
              data => {
                  this.alertService.success('Password Reset Successful', true);
                  this.router.navigate(['/login']);
              },
              error => {
                  this.alertService.error(error);
                  this.loading = false;
              });
  }
}
