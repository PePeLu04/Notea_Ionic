import { Component,inject } from '@angular/core';
import {IonicModule, LoadingController} from '@ionic/angular'
  import {FormBuilder,FormGroup,FormsModule,
  ReactiveFormsModule,Validators} from '@angular/forms';
import { Note } from '../model/note';
import { NoteService } from '../services/note.service';
import { UIService } from '../services/ui.service';
import { Camera, CameraResultType } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
import { ModalPage } from '../modal/modal.page';
import * as L from 'leaflet';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule,
  FormsModule,ReactiveFormsModule, CommonModule],
})
export class Tab2Page {
  public form!:FormGroup;
  private formB = inject(FormBuilder);
  private noteS = inject(NoteService);
  private UIS = inject(UIService);
  public loadingS = inject(LoadingController);
  private myLoading!:HTMLIonLoadingElement;
  public imageUrl: string = '';
  public pos: string = '';
  public title: string = '';
  public content: string = '';
  public isMapVisible = false;

  constructor(private noteService:NoteService) {
    this.form = this.formB.group({
      title:['',[Validators.required,Validators.minLength(4)]],
      description:['']
    });
  }

  public async saveNote():Promise<void>{
    if(!this.form.valid) return;
    let note:Note={
      title:this.form.get("title")?.value,
      description:this.form.get("description")?.value,
      date:Date.now().toLocaleString(),
      imageUrl:this.imageUrl,
      pos:this.pos,
      content:''
    }
    await this.UIS.showLoading();
    try{
      await this.noteS.addNote(note);
      this.form.reset();
      this.imageUrl='';
      await this.UIS.showToast("Nota introducida correctamente","success");
    }catch(error){
      await this.UIS.showToast("Error al insertar la nota","danger");
    }finally{
      await this.UIS.hideLoading();
    }
  }

  public async takePic(){
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri
      });

      this.imageUrl = image.webPath || '';
  }

  public submitForm() {
    const note: Note = {
      title: this.title,
      date: new Date().toISOString(),
      imageUrl: this.imageUrl,
      pos: this.pos,
      content:this.content
    };
  
    this.noteService.addNote(note);
  }

  public showMap(): void {
    this.isMapVisible = true;
    navigator.geolocation.getCurrentPosition((position) => {
      const map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
  
      L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
  
      this.pos = `${position.coords.latitude}, ${position.coords.longitude}`;
    });
  }

  public hideMap(): void {
    this.isMapVisible = false;
  }
}
