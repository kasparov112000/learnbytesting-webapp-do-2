// import { Injectable } from '@angular/core';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Store } from '@ngrx/store';

// //import { I8nService } from './i18n.service';


// @Injectable({providedIn: 'root'})
// export class MessagingService{
//     snackBarRef: any;

//     constructor(
//         // private i18nService: I8nService,
//         private snackBar: MatSnackBar,
//         private store: Store){

//         }

//     showSuccessMessage(messageKey: string){
//         let message = this.i18nService.t(messageKey);

//         if(!message){
//             message = messageKey;
//         }

//         this.snackBar.open(message, this.i18nService.t('common:button.dismiss'), {
//             duration: 2500,
//             panelClass: ['snackbar-success']
//           });
//     };

//     showErrorMessage(message: string){
//         this.snackBar.open(message, this.i18nService.t('common:button.dismiss'), {
//             duration: 4000,
//             panelClass: ['snackbar-error']
//           });
//     };

//     showConfirmMessageToCreateCategory(defaultCategory: any, los, newCategoryName: string){

//         this.snackBarRef = this.snackBar.open(`No category was found, would you like to create: ${newCategoryName} in ${defaultCategory.name}`, 'Create',
//             {
//                 duration: 10000,
//                 panelClass: ['snackbar-success']
//             }
//         );

//         this.snackBarRef.afterDismissed().subscribe(info => {
//             if (info.dismissedByAction === true) {
//                 console.log('dismissed');

//                // is.store.dispatch(actionQuizAddNewCategories({ quizCategory: defaultCategory, quizLos: los, categoryName: newCategoryName }));
//             } else {
//                 console.log('NOT dismissed');
//             }
//         });
//         // this.snackBar.open(message, this.i18nService.t('common:button.dismiss'), {
//         //     duration: 4000,
//         //     panelClass: ['snackbar-error']
//         //   });
//     };





//     hideMessages(){
//         this.snackBar.dismiss();
//     }
// }
