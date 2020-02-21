import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../_models/index';
import { AlertService, UserService } from '../_services/index';

@Component({
    moduleId: module.id.toString(),
    templateUrl: 'edit.component.html'
})

export class EditComponent implements OnInit{
    currentUser: User;
    model: any = {};
    loading = false;

    constructor(
        private router: Router,
        private userService: UserService,
        private alertService: AlertService) { }

    ngOnInit() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    editAccount() {
      this.model.id = this.currentUser.id;
      this.userService.update(this.model.id, this.model)
            .subscribe(
                data => {
                    this.alertService.success('Account updated successfully', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
