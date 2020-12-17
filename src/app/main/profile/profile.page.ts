import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { PopoverController, ToastController } from '@ionic/angular';
import { PopoverprofileComponent } from 'src/app/popovers/popoverprofile/popoverprofile.component';
import { AuthService } from 'src/app/service/auth.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any;
  imageUrl: any;
  uploadImage = false;

  userUid: any;
  username: any = "...";
  userCheckins: any = [];
  constructor(
    private router: Router,
    private fireAuth: AngularFireAuth,
    private authService: AuthService,
    private popoverController: PopoverController,
    private userService: UserService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currUser'));
    if (this.user.profileImage == null ){
      this.imageUrl = '../../../assets/kfc.png';
    }else{
      this.imageUrl = this.user.profileImage;
    }

    await this.getUserUid();
    this.getUserName();
    this.getUserCheckins();
  }

  ionViewDidEnter() 
  {
    if(this.userUid != null){    
      this.getUserCheckins();
    }
  }

  ionViewWillEnter(){
    this.user = JSON.parse(localStorage.getItem('currUser'));
    if (this.user.profileImage == null ){
      this.imageUrl = '../../../assets/kfc.png';
    }else{
      this.imageUrl = this.user.profileImage;
    }
  }

  logout(){
    this.authService.logOut();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverprofileComponent,
      event: ev,
      translucent: false
    });

    await popover.present();

    await popover.onDidDismiss()
        .then(result => {
          this.imageUrl = result.data;
          this.userService.uploadProfileImage(this.imageUrl, localStorage.getItem('UID'));
          this.uploadImage = true;
        })
        .catch(err => {
          console.log(err);
        });
  }

  getUserUid() {
    return new Promise(resolve => {
      this.fireAuth.authState.subscribe( authState => {
        this.userUid = authState.uid;
        resolve();
      })
    })
  }

  getUserName(){
    this.userService.getUser(this.userUid).subscribe( data => {
      this.username = data['firstName'];
    });
  }

  async getUserCheckins() {
    this.userCheckins = await this.userService.getUserCheckIn(this.userUid);

    this.userCheckins.forEach(checkin => {
      if(checkin[0] !== "auto checked") checkin[0] = "checked-in at " + checkin[0];
      checkin[1] = new Date(parseInt(checkin[1]));
    })
  }

  async removeCheckin(index){
    await this.userService.updateCheckinList(this.userUid, index, 0, "remove");
    this.presentToast("Check-in removed","success");
    this.getUserCheckins();
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
