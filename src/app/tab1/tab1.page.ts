import { Component } from '@angular/core';
import { IonItemSliding, IonicModule, ModalController, Platform } from '@ionic/angular';
import { NoteService } from '../services/note.service';
import { Note } from '../model/note';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject, Observable, from, map, mergeMap, tap, toArray } from 'rxjs';
import { ModalPage } from '../modal/modal.page';
import { PopoverController } from '@ionic/angular';
import { ContextMenuComponent } from '../components/context-menu/context-menu.component';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab1Page{
  //public misnotas:Note[]=[];
  public _notes$:BehaviorSubject<Note[]> = new BehaviorSubject<Note[]>([]);
  private lastNote:Note|undefined=undefined;
  private notesPerPage:number = 15;
  public isInfiniteScrollAvailable:boolean = true;


  public _editNote!:Note;
  public _deleteNote!:Note;

  

  constructor(public platform:Platform,
     public noteS: NoteService, 
     public modalController: ModalController, 
     private alertController: AlertController,
     private popoverController: PopoverController) {
    console.log("CONS")
  }
  
  async onRightClick(event: MouseEvent, note: Note) {
    event.preventDefault();

    const popover = await this.popoverController.create({
      component: ContextMenuComponent,
      event: event,
      componentProps: { note: note },
      translucent: true
    });

    return await popover.present();
  }


  async editNote($event: Note, itemSliding: IonItemSliding) {
    this._editNote = $event;
  
    const modal = await this.modalController.create({
      component: ModalPage,
      componentProps: {
        note: $event
      }
    });
    itemSliding.closeOpened();
    await modal.present();
    this.popoverController.dismiss();
  }


  ionViewDidEnter(){
    this.platform.ready().then(() => {
      console.log(this.platform.height());
      this.notesPerPage=Math.round(this.platform.height()/50);
      this.loadNotes(true);
    });
   
  }


  loadNotes(fromFirst:boolean, event?:any){
    if(fromFirst==false && this.lastNote==undefined){
      this.isInfiniteScrollAvailable=false;
      event.target.complete();
      return;
    } 
    this.convertPromiseToObservableFromFirebase(this.noteS.readNext(this.lastNote,this.notesPerPage)).subscribe(d=>{
      event?.target.complete();
      if(fromFirst){
        this._notes$.next(d);
      }else{
        this._notes$.next([...this._notes$.getValue(),...d]);
      }
    })
    
  }
  private convertPromiseToObservableFromFirebase(promise: Promise<any>): Observable<Note[]> {
    return from(promise).pipe(
      tap(d=>{
        if(d.docs && d.docs.length>=this.notesPerPage){
          this.lastNote=d.docs[d.docs.length-1];
        }else{
          this.lastNote=undefined;
        }
      }),
      mergeMap(d =>  d.docs),
      map(d => {
        return {key:(d as any).id,...(d as any).data()};
      }),
      toArray()
    );
  }
  async deleteNote($event: Note, itemSliding: IonItemSliding) {
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
    itemSliding.closeOpened();
    await confirmAlert.present();
  }

  doRefresh(event: any) {
    this.isInfiniteScrollAvailable=true;
    this.loadNotes(true,event);
  }

  loadMore(event: any) {
    this.loadNotes(false,event);
  }
}
  
  

  
  
  
