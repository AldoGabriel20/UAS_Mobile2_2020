import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  formSignUp: FormGroup;
  errorMsg: string;
  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }
  
  ngOnInit() {
    this.formSignUp = new FormGroup({
      firstName: new FormControl(null, {
        validators: [Validators.required],
      }),
      lastName: new FormControl(null, {
        validators: [Validators.required],
      }),
      email: new FormControl(null, {
        validators: [Validators.required],
      }),
      password: new FormControl(null, {
        validators: [Validators.required],
      })
    });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Akun sedang diproses...',
      duration: 2000
    });
    await loading.present();

    // const { role, data } = await loading.onDidDismiss();
  }

  async toastSentEmail(msg) {
    const toast = await this.toastController.create({
        message: msg,
        color: 'success',
        duration: 2000
    });
    toast.present();
  }

  submitForm(){
    // untuk autentikasi firebase 
    this.auth.signUpWithEmail(this.formSignUp.value.email, this.formSignUp.value.password)
        .then((resp) => {
          resp.user.sendEmailVerification()
              .then(() => {
                this.auth.setMessage('Email verifikasi telah dikirim');
                // data user ke db //
                const userData = {
                  firstName: this.formSignUp.value.firstName,
                  lastName: this.formSignUp.value.lastName,
                  email: this.formSignUp.value.email
                };

                this.userService.newUser(userData, resp.user.uid )
                    .then(res => {
                      console.log(res);
                    })
                    .catch(error => {
                      console.log(error);
                    });
                this.formSignUp.reset();
                this.presentLoading().then(() => {
                  this.router.navigate(['./login']);
                  this.toastSentEmail('Email verifikasi telah dikirim, silahkan check email anda.');
                });
              })
              .catch(err => {
                console.log(err);
              });
        })
        .catch(error => {
          this.errorMsg = error.message;
        });
  }
}
