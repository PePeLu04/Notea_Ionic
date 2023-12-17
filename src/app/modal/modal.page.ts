import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController, NavParams } from '@ionic/angular';
import { NoteService } from '../services/note.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalPage implements OnInit{

  note: any;
  public isPositionPresent = true;
  public noteId: string = '';
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  public pos: any;

  constructor(private modalController : ModalController, private navParams: NavParams,  private noteService: NoteService) {
    this.note = this.navParams.get('note');
    this.pos = this.navParams.get('position');
  }

  async dismissModal() {
    await this.modalController.dismiss();
  }

  async saveNote() {
    await this.noteService.updateNote(this.note);
    await this.modalController.dismiss(this.note);
  }

  deleteImage() {
    this.note.imageUrl = '';
  }
  
  ngOnInit() {
  }

  async removePosition() {
    await this.noteService.removePosition(this.note);
    this.pos = null;
  }

}
