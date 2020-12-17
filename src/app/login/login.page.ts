import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formSignIn: FormGroup;
  constructor(
    private auth: AuthService,
    public toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.formSignIn = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
    });
  }

  async toastLogin(msg) {
    const toast = await this.toastController.create({
      message: msg,
      color: 'danger',
      duration: 2000
    });
    toast.present();
  }

  submitForm(){
    if (this.formSignIn.value.email == null || this.formSignIn.value.password == null){
      this.toastLogin('Email or password cannot be null');
    }else{
      this.auth.signInWithEmail(this.formSignIn.value.email, this.formSignIn.value.password )
          .then(result => {
            if (result.user.emailVerified){
              console.log('Email is verified');
              // set user session data //
              console.log(result.user.uid);
              this.auth.setUserSession(result.user.uid);
              this.router.navigate(['./main']);
            }else{
              this.toastLogin('Email has not been verified');
            }
          })
          .catch(error => {
            this.toastLogin('Invalid user credentials, please try again');
          });
    }

    this.formSignIn.reset();
  }
}
