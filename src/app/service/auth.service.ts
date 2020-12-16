import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  message: string;
  constructor(
    private angularFire: AngularFireAuth,
    private userService: UserService,
    private router: Router
  ) { }

  setUserSession(uid){
    console.log('Get User Session ID');
    this.userService.getUser(uid).subscribe(data => {
        console.log(data);
        localStorage.setItem('currUser', JSON.stringify(data));
        localStorage.setItem('UID', uid);
        //this.router.navigate(['/main/tabs/dashboard']);
    });
  }

  signInWithEmail(email, password) {
    return this.angularFire.signInWithEmailAndPassword(email, password);
  }

  // Buat klo register
  signUpWithEmail(email, password) {
    return this.angularFire.createUserWithEmailAndPassword(email, password);
  }

  setMessage(msg: string){
    this.message = msg;
  }

  getMessage(){
    return this.message;
  }

  deleteMessage(){
    this.message = '';
    return this.message;
  }

  // Logout
  logOut(){
    this.angularFire.signOut()
        .then(() => {
            console.log('user berhasil logout');
        }).catch((err) => {
        console.log(err);
    });
  }
}
