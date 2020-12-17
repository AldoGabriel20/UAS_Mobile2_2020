import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController, PopoverController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage implements OnInit {
  email: string = "";
  search: string = ""
  userUid: string;
  userFriends: any = [];
  users: any = [];
  //searchControl: FormControl;

  constructor(
    private fireAuth: AngularFireAuth, 
    private userService: UserService, 
    private toastController: ToastController
  ) { 
    //this.searchControl = new FormControl('')
  }

  ngOnInit() { 
    this.users.length = 0;
    this.users = [];
    //this.filterContact()
  }

  // Buat search 
  /*filterContact(){
    const keyword = this.searchControl.value
    this.users = []
    this.userService.filterItems(keyword).then( res => {
      res.forEach( c => {
        if(c.key != this.userUid){
          const tempush = {
            key: c.key,
            ...c.val()
          };
          this.users.push(tempush)
        }
      })
    })
  }*/
  
  async ionViewWillEnter() {
    this.users.length = 0;
    this.users = [];

    await this.getUserUid();
    this.getFriends();
    await this.getUsers();
  }

  getUserUid() {
    return new Promise(resolve => {
      this.fireAuth.authState.subscribe( authState => {
        this.userUid = authState.uid;
        resolve();
      })
    })
  }

  async getFriends(){
    var friends = await this.userService.getUserFriend(this.userUid) as [];
    this.userFriends = [];
    friends.forEach(uid => {
      this.userService.getUser(uid).subscribe(data => {
        this.userFriends.push({
          firstName: data['firstName'],
          email: data['email'],
        });
      });
    });
  }

  async getUsers(){
    var user = await this.userService.getAllUser() as [];
    this.users.length = 0;
    this.users = [];
    user.forEach(uid => {
      this.userService.getUser(uid['key']).subscribe(data => {
        this.users.push({
          name: data['name'],
          email: data['email'],
        });
      });
    });

    console.log('Users: ', this.users);
  }

  emailFriendExist(email) {
    var ret = false;
    this.userFriends.forEach(userFriend => {
      if(userFriend['email'] == email) ret = true;
    })
    return ret;
  }

  async addFriend() {
    var uid = await this.userService.getUidFromEmail(this.email);
    if(uid == ""){
      this.presentToast("This account doesn't exist", "danger");
    } else if(uid == this.userUid){
      this.presentToast("Cannot add yourself.", "danger");
    } else if(this.emailFriendExist(this.email)) {
      this.presentToast("This friend already added", "danger");
    } else {
      await this.userService.updateFriendList(this.userUid, uid, "add");
      this.presentToast("Friend added.", "success");
    }

    this.getFriends();
  }

  async removeFriend(email) {
    var uid = await this.userService.getUidFromEmail(email);
    await this.userService.updateFriendList(this.userUid, uid, "remove");
    this.presentToast("Friend removed.", "success");
    this.users = [];
    this.getFriends();
  }

  async presentToast(message, color) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: 1000,
    });
    toast.present();
  }
}
