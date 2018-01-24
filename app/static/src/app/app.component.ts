import { Component ,  Input, AfterContentInit } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import { Session } from 'ftrack-javascript-api';
import * as vis from "vis";
import * as enLocale from 'date-fns/locale/en';
import {DatepickerOptions} from '../ng-datepicker/component/ng-datepicker.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})




export class AppComponent{

  title = 'Dashnoard';
   //Start Session
  session = new Session('https://ftrack.stb.ua', 'developer', '0617dce2-9c66-11e7-b2bd-005056852c83');

  @Input() columnsNames:string[] = ['2012','2013','2014','2015'];
  statusNames:Array<string> = [];
  projectList:Array<string> = [];
  projectIds:Array<string> = [];
  statusIds:Array<string> = [];
  userList:Array<string> = [];
  start_date: Date;
  end_date:Date;

  @Input() nleList:string[] = ['mac', 'mac-2'];
  @Input() nleDate:Array<Object> = [
            {'id': 0, 'content': 'item 1', 'start': '2012-04-20', 'type':'point', 'group':0, 'className':'Not started'},
            {'id': 1, 'content': 'item 1', 'start': '2012-04-20', 'type':'point','group':0, 'className':'Started'},
            {'id': 2, 'content': 'item 2', 'start': '2012-04-12', 'group':0, 'className':'Not started'},
            {'id': 3, 'content': 'item 3', 'start': '2014-04-18', 'group':0, 'className':'Not started'},
            {'id': 4, 'content': 'item 4', 'start': '2015-04-16', 'end': '2015-04-22', 'group':0, 'className':'Not started'},
            {'id': 5, 'content': 'item 5', 'start': '2016-04-25', 'group':0, 'className':'Not started'},
            {'id': 6, 'content': 'item 6', 'start': '2017-04-27', 'type': 'point', 'group':0, 'className':'Started'},
            {'id': 7, 'content': 'item 1', 'start': '2012-04-20', 'type':'point', 'group':1, 'className':'Not started'},
            {'id': 8, 'content': 'item 1', 'start': '2012-04-20', 'type':'point', 'group':1, 'className':'Not started'},
            {'id': 9, 'content': 'item 2', 'start': '2012-04-12', 'group':1, 'className':'Not started'},
            {'id': 10, 'content': 'item 3', 'start': '2014-04-18', 'group':1, 'className':'Not started'},
            {'id': 11, 'content': 'item 4', 'start': '2014-04-16', 'end': '2014-04-22', 'group':1, 'className':'Not started'},
            {'id': 12, 'content': 'item 5', 'start': '2014-04-25', 'group':1, 'className':'Not started'},
            {'id': 13, 'content': 'item 6', 'start': '2017-04-27', 'type': 'point', 'group':1, 'className':'Not started'}
            ];
  selectedProject = "All";
  selectedStatus = "All";
  selectedUser = "All";
  colormap:string[];
  options: DatepickerOptions = {
    locale: enLocale
  };

  constructor(
        private http: HttpClient
    ) {

      //Select project names
      this.start_date = new Date();
      this.end_date = new Date();
      var request = this.session.query('select name, id from Project');
      let _projectList = [];
      let _projectIds = [];
      this.selectedProject = "All";
      request.then(function (response) {
          var projects = response.data;
          projects.forEach(function (project) {
            _projectList.push(project.name);
            _projectIds.push(project.id);

          });
      });
      this.projectList = _projectList;
      this.projectIds = _projectIds;

      //Select status names
      var request = this.session.query('select name, id from Status');
      let _statusList = [];
      let _statusIds = [];
      this.selectedStatus = "All";
      request.then(function (response) {
          var statuses = response.data;
          statuses.forEach(function (status) {
            _statusList.push(status.name);
            _statusIds.push(status.id);
          });
      });
      this.statusIds = _statusIds;
      this.statusNames = _statusList;

      //Select users names
      var request = this.session.query('select username from User');
      let _userList = ["All"];
      request.then(function (response) {
          var users = response.data;
          users.forEach(function (user) {
            _userList.push(user.username)
          });
      });
      this.userList = _userList;

    }

  ngAfterContentInit(){

    let container = document.getElementsByClassName('container')[0];
    let groups = new vis.DataSet();

    for(var g=0;g<this.nleList.length;g++){
      groups.add({id: g, content: this.nleList[g]});

    }

    let visualisation = document.createElement("div")
      visualisation.setAttribute('id','visualization');
      container.appendChild(visualisation);
      let item = new vis.DataSet(this.nleDate);
      let timeline = new vis.Timeline(visualisation, item);
      timeline.setGroups(groups);


    let elements = document.getElementsByClassName('vis-timeline vis-bottom');
    for(let index=0;index<=elements.length;index+=1){
      elements[index].setAttribute('style','visibility:visible;');
    }



  }

    selectUser(event){
      const value = event.target.text;
      this.selectUser = value;
    }

    selectStatus(event){
      const value = event.target.text;
      this.selectedStatus = value;
    }

    selectProject(event){
      const value = event.target.text;
      this.selectedProject = value;
    }

     @Input() generateReport(statusName:string = this.selectedProject, projectName = this.selectedStatus){

        var selectedPrjIdIndex = this.projectList.indexOf(this.selectedProject);

        var selectedPrjId = " " + this.projectIds[selectedPrjIdIndex];

        var selectedStatusIdIndex = this.statusNames.indexOf(this.selectedStatus);

        var selectedStatusId = " " + this.statusIds[selectedStatusIdIndex];

        var selectedUser = this.selectedUser;

        var __request = "select id, status.name, start_date, end_date, custom_attributes from Task"

       var __whereRequest = "";

        if (this.selectedUser!="All"){

            __whereRequest =  "and  user.user_name id  is  " + this.selectedUser;

        }
        if (this.selectedProject!="All"){
           if (__whereRequest!=""){


           }
            __whereRequest = __whereRequest + " and project.id is  " + selectedPrjId;
        }
        if (this.selectedStatus!="All"){
          if (__whereRequest!=""){

             __whereRequest = __whereRequest + " and ";

           }
            __whereRequest = __whereRequest + " and status.id is " + selectedStatusId;

        }

        var __request = "select id, status.name, start_date, end_date, custom_attributes from Task where " +
          "custom_attributes any (key is 'nle') and end_date>= 2017-12-11" + __whereRequest;
        let that = this;

        var request = this.session.query(__request);

          // DOM element where the Timeline will be attached
        request.then(function (response) {
              let _taskList = [];
              let _nleList = [];

              var tasks = response.data;
              tasks.forEach(function(task){
                var nle = [];
                for(let cust_attr of task.custom_attributes){
                  if (cust_attr.key == "nle"){
                    nle = cust_attr.value;
                  }
                }
                for(let _nle of nle) {
                  if (_nleList.indexOf(_nle)>=0) {

                  }
                  else {
                    _nleList.push(_nle);
                  }
                  _taskList.push(
                    {
                      'id': tasks.indexOf(task),
                      'start': task.start_date._i,
                      'end': task.end_date._i,
                      'content': task.status.name,
                      'className': task.status.name,
                      'title': task.status.name,
                      'group':_nleList.indexOf(_nle)
                    }
                    );
                }
              });

              that.nleDate=_taskList;
              that.nleList=_nleList;
              that.ngAfterContentInit();
          })



    }


}
