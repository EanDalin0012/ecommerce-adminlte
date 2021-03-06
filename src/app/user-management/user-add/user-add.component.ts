import { PersonalInformation } from './../../m-share/model/personal-info';
import { Component, OnInit } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { FileRestrictions, FileState, SelectEvent } from '@progress/kendo-angular-upload';
import { TranslateService } from '@ngx-translate/core';
import { HttpService } from '../../m-share/service/http.service';
import { ModalService } from '../../m-share/service/modal.service';
import { UploadService } from '../../m-share/service/upload.service';
import { CommonHttpService } from '../../m-share/service/common-http.service';
import { Message } from '../../m-share/model/message';
import { ResponseStatus, ButtonRoles, maritalStatus, gender } from '../../m-share/constants/common.const';
import * as moment from 'moment';
import { Base64WriteImage } from '../../m-share/model/base64-write-image';
import { StepperActivateEvent } from '@progress/kendo-angular-layout';
import { EducationInformation } from '../../m-share/model/education-information';
import { FamilyInformation } from '../../m-share/model/family-informations';
import { EmergencyContact } from '../../m-share/model/emergency-contact';
import { GridDataResult, RowClassArgs, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { UserAdd } from '../../m-share/model/user-add';
@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {

  modal;
  typeList: any[] = [];

  resourceImageId: string;
  imageUploaded: boolean;
  translateTxt: any;

// file select Declaration
  public imagePreviews: any[] = [];
  public fileRestrictions: FileRestrictions = {
      allowedExtensions: ['.jpg', '.png']
  };

  maritalStatusList: any [];
  maritalStatusValue: string;

  genders: any [];
  gender: any;
  genderValue: string;
  filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'startsWith'
  };

  stepsIcons = [
    { label: 'Personal Info',  isValid: true },
    { label: 'Education Info',  isValid: true },
    { label: 'Emergency Contact', isValid: true },
    { label: 'Family Info', isValid: false },
  ];
  currentStep = 0;

  personalInfo = new PersonalInformation();

  educationInformations     = new Array<EducationInformation>();
  educationInformationId    = 0;
  educationInformation      = new EducationInformation();
  educationInformationCount = 0;

  familyInformations        =  new Array<FamilyInformation>();
  familyInformation         = new FamilyInformation();
  familyInformationId       = 0;
  familyInformationCount    = 0;

  emergencyContacts         = new Array<EmergencyContact>();
  emergencyContact          = new EmergencyContact();
  emergencyContactId        = 0;
  emergencyContactCount     = 0;

  startingDate = new Date();
  completeDate = new Date();
  birthDate    = new Date();
  // start Declaration grid
  info = true;
  buttonCount = 5;
  type: 'numeric' | 'input' = 'numeric';
  previousNext = false;
  pageSizes: any[] = [10, 20, 30, 50, 100];
  multiple = false;
  allowUnsort = true;
  height = 'auto';
  search: string;
  sort: SortDescriptor[] = [{
    field: 'id',
    dir: 'asc'
  }];
  gridView: GridDataResult;
  gridData: any[];
  checkboxOnly = false;
  mode = 'multiple';
  gridHeight = screen.height * 0.5;
  selectedCallback = (args) => args.dataItem;
  selectableSettings: SelectableSettings;
  skip = 0;
  pageSize = 10;
  mySelection: any[] = [];
  totalRecord = 0;
  // end Declaring grid

  constructor(
    private translate: TranslateService,
    private httpService: HttpService,
    private modalService: ModalService,
    private uploadService: UploadService,
    private dataService: CommonHttpService
  ) {
    this.setSelectableSettings();
   }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
      this.genders = [ {text: '-- Select Gender --', code: 'NA'}, ...gender];
      this.genderValue = this.genders[0].code;
      this.maritalStatusList = [{text: '-- Select Marital Status --', code: 'NA'}, ...maritalStatus];
      this.maritalStatusValue = this.maritalStatusList[0].code;
  }

  save(): void {
      if (this.isValidPersonalInfo() === true) {
        const userAdd                 = new UserAdd();
        userAdd.personalInfo          = this.personalInfo;
        userAdd.educationInformations = this.educationInformations;
        userAdd.emergencyContacts     = this.emergencyContacts;
        userAdd.familyInformations    = this.familyInformations;
        const api = '/api/user/v1/info';
        this.httpService.Post(api, userAdd).then(response => {
          const responseData = response as Message;
          if ( responseData && responseData.status === ResponseStatus.Y) {
            this.modal.close( {close: ButtonRoles.save});
          }
        });
      }

  }


  close(): void {
    this.modal.close({close: ButtonRoles.close});
  }

  alertMessage(title: string, content: string): void{
    this.modalService.alert({
      title,
      content,
      btnText: this.translate.instant('Common.Button.Confirm'),
      callback: response => {

      }
    });
  }

  buttonX(val): void {
    switch (val) {
      case 'productName':
        break;
      case 'description':
        break;
    }
  }

  // file select function
  public selectEventHandler(e: SelectEvent): void {
    this.imageUploaded = false;
    this.imagePreviews = [];
    const that = this;
    e.files.forEach((file) => {
    if (!file.validationErrors) {
        const reader = new FileReader();
        reader.onload = function (ev) {
        const image = {
            src: ev.target['result'] + '',
            uid: file.uid,
            id: file.uid + '-' + moment().format('YYYYMMDDhhmmss'),
            name: file.name,
            size: file.size,
            type: file.rawFile.type,
            extension: file.extension
        };
        that.imagePreviews.unshift(image);
        };
        reader.readAsDataURL(file.rawFile);
    }
    });
  }

  remove(fileSelect, uid: string): void {
    this.imageUploaded = false;
    fileSelect.removeFileByUid(uid);
    if (this.imagePreviews.length > 0) {
      this.imagePreviews.forEach((element, index) => {
        if (element.uid === uid) {
            this.imagePreviews.splice(index, 1);
        }
      });
    }
  }

  showButton(state: FileState): boolean {
    return (state === FileState.Selected) ? true : false;
  }

  upload(state): void {
    if(this.imagePreviews.length > 0) {
      this.imagePreviews.forEach(element => {
        if (element.uid === state) {
            const splitted = element.src.split(',');
            const base64WriteImage = new Base64WriteImage();
            if (splitted[1]) {
              base64WriteImage.id         = element.id;
              base64WriteImage.base64     = splitted[1];
              base64WriteImage.fileName  = element.name;
              base64WriteImage.fileType  = element.type;
              base64WriteImage.fileSize  = element.size + '';
              base64WriteImage.fileExtension = element.extension;
              this.uploadService.upload(base64WriteImage).then(resp => {
                if(resp === true) {
                  this.resourceImageId = base64WriteImage.id;
                  this.personalInfo.resourceImageID = this.resourceImageId;
                  this.imageUploaded = true;
                }
              });
            }
        }
      });
    }

  }

  public onStepActivate(ev: StepperActivateEvent): void {
    if(ev) {
      if (ev.index === this.stepsIcons.length - 1) {
        console.log(ev.index, this.stepsIcons.length - 1);

        ev.preventDefault();
        this.currentStep =  this.stepsIcons.length - 1;
        console.log('Please fill previous steps');
      }
      this.stepsIcons[0].isValid = this.checkUserInfoActivated();
      this.stepsIcons[2].isValid = this.checkCardIdentyfyActivated();
      console.log(`Step ${ev.index} was activated`);
      console.log(ev.index, ev);
      this.currentStep = ev.index;
    }

  }

  checkUserInfoActivated(): boolean {
    return true;
  }

  checkCardIdentyfyActivated(): boolean {
    return true;
  }


  public next(value: number): void {
    console.log(value);
    if (this.currentStep === 0){
      if (this.isValidPersonalInfo() === true) {
        this.currentStep += 1;
      }
    } else {
      this.currentStep += 1;
    }
    // else if (this.currentStep === 1){
    //   if (this.isValidEducation() === true) {
    //     this.currentStep += 1;
    //   }
    // } else if (this.currentStep === 2){
    //   if (this.isValidEmergencyContact() === true) {
    //     this.currentStep += 1;
    //   }
    // } else if (this.currentStep === 3){
    //   if (this.isValidFamilyInformation() === true) {
    //     this.currentStep += 1;
    //   }
    //   this.currentStep += 1;
    // }
    // if(value === 0) {
    //   if(this.checkUserInfo()) {
    //     this.stepsIcons[0].isValid =  true;
    //     this.stepsIcons[1].isValid =  true;
    //     this.currentStep += 1;
    //   } else {
    //     this.stepsIcons[0].isValid =  false;
    //   }
    // } else if (value === 1) {
    //   this.currentStep += 1;
    // }else if (value === 2) {
    //   if(this.checkCardIdentyfy()) {
    //     this.stepsIcons[2].isValid =  true;
    //     this.currentStep += 1;
    //   } else {
    //     this.stepsIcons[2].isValid =  false;
    //   }
    // }else if (value === 3) {
    //   this.currentStep += 1;
    // }
  }

  public prev(): void {
      this.currentStep -= 1;
  }

  changeValueMaritalStatus(event): void {
    if (event) {
      this.maritalStatusValue = event.target.value;
    }
  }

  changeValueGender(event): void {
    if (event) {
      this.genderValue = event.target.value;
    }
  }

  isValidPersonalInfo(): boolean {
    if (!this.personalInfo.firstName) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InvalidFirstName'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => {
        }
      });
      return false;
    } else if (!this.personalInfo.lastName) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InvalidLastName'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (this.genderValue === 'NA'){
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.SelectGender'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.personalInfo.phone) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidPhone'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.personalInfo.nationalID){
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidNationalID'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.personalInfo.nationality){
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidNationality'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.personalInfo.religion){
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidReligion'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (this.maritalStatusValue === 'NA'){
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.SelectMaritalStatus'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.birthDate) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidBirthDate'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else {
      this.personalInfo.birthDate = this.dateForm(this.birthDate);
      this.personalInfo.gender   = this.genderValue;
      this.personalInfo.maritalStatus = this.maritalStatusValue;
      this.personalInfo.resourceImageID = this.resourceImageId;
      return true;
    }
  }

  addEducation(): void {
    if (this.isValidEducation() === true) {
      this.educationInformationId += 1;
      this.educationInformation.id  = this.educationInformationId;
      this.educationInformation.startingDate = this.dateForm(this.startingDate);
      this.educationInformation.completeDate = this.dateForm(this.completeDate);
      if (this.educationInformation != null) {
          this.educationInformations.push({
                id: this.educationInformationId,
                institution: this.educationInformation.institution,
                subject: this.educationInformation.subject,
                startingDate: this.educationInformation.startingDate,
                completeDate: this.educationInformation.completeDate,
                degree: this.educationInformation.degree,
                grade: this.educationInformation.grade
              });
          this.gridData      = this.educationInformations;
          this.educationInformationCount = this.educationInformations.length;
          this.loadingData(this.educationInformations);
          this.educationInformation = new EducationInformation();
      }
    }
  }


  sliceEducation(dataItem: any, index): void {
    this.educationInformations.splice(index, 1);
  }

  isValidEducation(): boolean {
    if (!this.educationInformation.institution) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidInstitution'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.educationInformation.subject) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidSubject'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.startingDate) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidStartingDate'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.completeDate) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidCompleteDate'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.educationInformation.degree) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidDegree'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else {
      return true;
    }
  }

  addEmergencyContacts(): void {
    if (this.isValidEmergencyContact() === true) {
      this.emergencyContactId += 1;
      this.emergencyContact.id = this.emergencyContactId;
      if (this.emergencyContact != null) {
        this.emergencyContacts.push({
          id: this.emergencyContactId,
          name: this.emergencyContact.name,
          relationship: this.emergencyContact.relationship,
          phone: this.emergencyContact.phone,
          phone2: this.emergencyContact.phone2
        });
        this.emergencyContactCount = this.emergencyContacts.length;
        this.emergencyContact = new EmergencyContact();
      }
    }
  }

  sliceEmergencyContact(dataItem: any, index): void {
    this.emergencyContacts.splice(index, 1);
  }

  isValidEmergencyContact(): boolean {
    if (!this.emergencyContact.name) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidName'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.emergencyContact.relationship) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidRelationship'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.emergencyContact.phone) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidPhone'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else {
      return true;
    }
  }

  addFamilyInformation(): void {
    if (this.isValidFamilyInformation() === true) {
      this.familyInformationId += 1;
      this.familyInformation.id = this.familyInformationId;
      if (this.familyInformation != null) {
        this.familyInformations.push({
          id: this.familyInformationId,
          name: this.familyInformation.name,
          relationship: this.familyInformation.relationship,
          phone: this.familyInformation.phone,
          description: this.familyInformation.description
        });
      }
    }
  }

  sliceFamilyInformation(dataItem: any, index): void {
    this.familyInformations.splice(index, 1);
  }

  isValidFamilyInformation(): boolean {
    if (!this.familyInformation.name) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidName'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else if (!this.familyInformation.relationship) {
      this.modalService.alert({
        content: this.translate.instant('UserAdd.Message.InValidRelationship'),
        btnText: this.translate.instant('Common.Button.Confirm'),
        callback: response => { }
      });
      return false;
    } else {
      return true;
    }
  }
  edit(dataItem: any): void {

  }

  dateForm(date): any {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return year + month + day;
  }


  // Declaration  function gride
  setSelectableSettings(): void {
    this.selectableSettings = {
        checkboxOnly: this.checkboxOnly,
        mode: 'multiple'
    };
  }

  loadingData(data: any): void {
    if (data) {
      this.gridView = {
        data: orderBy(data.slice(this.skip, this.skip + this.pageSize), this.sort),
        total: data.length
      };
    }
    this.totalRecord = data.length;
  }

  loadData(): void {
    this.gridView = {
      data: orderBy(this.gridData.slice(this.skip, this.skip + this.pageSize), this.sort),
      total: this.gridData.length
    };
  }

  pageChange({ skip, take }: PageChangeEvent): void {
    this.skip = skip;
    this.pageSize = take;
    this.paging();
  }

  public rowCallback = (context: RowClassArgs) => {
      switch (context.dataItem.serviceStatusDesc) {
        case 'Deactivated':
          return {dormant: true};
        default:
          return {};
       }
  }

  private paging(): void {
    this.gridView = {
      data: this.gridData.slice(this.skip, this.skip + this.pageSize),
      total: this.gridData.length
    };
  }

  sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.loadData();
  }
  // end gride function
}
