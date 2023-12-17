import { CommonModule } from '@angular/common';
import { AlertController, IonItemSliding, IonicModule } from '@ionic/angular';
import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Note } from 'src/app/model/note';
import { ModalPage } from 'src/app/modal/modal.page';
import { ModalController } from '@ionic/angular/standalone';
import { NoteService } from 'src/app/services/note.service';
@Component({
  selector: 'app-context-menu',
  templateUrl: 'context-menu.component.html',
  styleUrls: ['context-menu.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ContextMenuComponent {
  @Input() note: any;
  public _editNote!:Note;
  public _deleteNote!:Note;

  constructor(private popoverController: PopoverController,
    public modalController: ModalController, 
    public noteS: NoteService,
    private alertController: AlertController, ) {}

  async editNote($event: Note) {
    this._editNote = $event;
  
    const modal = await this.modalController.create({
      component: ModalPage,
      componentProps: {
        note: $event
      }
    });
    await modal.present();
    this.popoverController.dismiss();
  }

  async deleteNote($event: Note) {
    const confirmAlert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta nota?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this._deleteNote = $event;
            if (this.noteS && typeof this.noteS.deleteNote === 'function') {
              this.noteS.deleteNote($event).then(() => {
                console.log('Nota eliminada exitosamente');
              }).catch((error: any) => {
                console.error('Error al eliminar la nota:', error);
              });
            } else {
              console.error('noteS.deleteNote no es una función');
            }
          },
        },
      ],
    });
    await confirmAlert.present();
    this.popoverController.dismiss();
  }
}