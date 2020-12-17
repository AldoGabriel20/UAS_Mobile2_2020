import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { User } from './user';
import { map } from 'rxjs/operators';

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
    return new Promise(resolve => {
      this.db.list('user/').snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val() as {}}))
        )
      ).subscribe(datas => {
        resolve(datas);
      })
    });
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

  getFriends(uid){
    return this.db.list(this.dbPath+uid+'/friends')
  }

  //async addFriends(currUserId, userIdAdd){
  //  let query = await this.db.list(this.dbPath+ currUserId+ '/friends').query.orderByValue().equalTo(userIdAdd).once('value')
  //  
  //  if(query.val()){
  //    return "exist";
  //  }
  //  else{
  //    this.db.list(this.dbPath+ currUserId+ '/friends').push(userIdAdd);
  //    return "success";
  //  }
  //}

  deleteUser(uid){
    return this.db.object(this.dbPath + uid).remove();
  }

  uploadProfileImage(imageData, uid){
    return this.storage.ref(this.dbPath + uid + '/profileImage/').putString(imageData, 'data_url');
  }

  getUserFriend(uid) 
  {
    return new Promise(resolve => {
      this.getUser(uid).subscribe( data => {
        if(data['friends'] !== undefined && data['friends'] !== null && data['friends'] !== "")
          resolve(data['friends'].split(","));
        else
          resolve([]);
      })
    })
  }

  getUidFromEmail(email)
  {
    return new Promise(resolve => {
      this.db.list('user/').snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val() as {}}))
        )
      ).subscribe(datas => {
        datas.forEach(data => {
          if(data['email'] == email) resolve(data['key'])
        });
        resolve("");
      })
    });
  }

  async updateFriendList(uidUser, uidFriend, action)
  {
    var friends;
    friends = await this.getUserFriend(uidUser);
      
    if(action == "add") friends.push(uidFriend);
    if(action == "remove") friends.splice(friends.indexOf(uidFriend), 1);

    friends = friends.join(",");
    
    this.db.object('user/' + uidUser).update({
      friends: friends
    });
  }

  setUserLocation(uid, loc, time)
  {
    var locStr = loc['lat'] + "," + loc['lng'];
    this.db.object('user/' + uid).update({
      lastLoc: locStr,
      lastTime: time
    });
  }

  getUserCheckIn(uid) 
  {
    return new Promise(resolve => {
      this.getUser(uid).subscribe( data => {
        if(data['checkin'] !== undefined && data['checkin'] !== null && data['checkin'] !== ""){
          var checkinsraw = data['checkin'].split("|||");
          var checkins = [];
          checkinsraw.forEach(checkin => {
            checkins.push(checkin.split("||"));
          })
          resolve(checkins);
        }
        else resolve([]);
      })
    })
  }

  async updateCheckinList(uid, locname, time, action)
  {
    var checkins;
    checkins = await this.getUserCheckIn(uid);

    var newCheckin = [locname, time];
    if(action == "add") checkins.push(newCheckin);
    if(action == "remove") checkins.splice(locname, 1);
    
    var newCheckins = [];
    checkins.forEach((checkin: String[]) => {
      newCheckins.push(checkin.join("||"));
    })
    this.db.object('user/' + uid).update({
      checkin: newCheckins.join("|||")
    });
  }

  filterItems(keyword) {
    return this.userRef.query
    .orderByChild('firstName')
    .startAt(keyword)
    .endAt(keyword + '\uf8ff')
    .once('value')
  }
}
