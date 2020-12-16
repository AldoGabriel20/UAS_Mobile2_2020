import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private dbPath = '/user/';
  userRef: AngularFireList<User> = null;

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage
  ) { }

  getAllUser(){
    return this.userRef;
  }

  newUser(user: { firstName: string; lastName: string; email: string}, uid ): any{
    console.log(user);
    return this.db.object(this.dbPath + uid).set({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  }

  getUser(uid){
    return this.db.object(this.dbPath + uid).valueChanges();
  }
}
