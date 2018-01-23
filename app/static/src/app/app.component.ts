import { Component ,  Input, AfterContentInit } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import * as vis from "vis";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})




export class AppComponent{

  title = 'Dashnoard';
  @Input() columnsNames:string[] = ['2012','2013','2014','2015'];
  statusNames = null;
  projectList = null;
  @Input() nleList:string[] = ['mac', 'mac-2'];
  @Input() nleDate:Object = {'mac':[
            {'id': 0, 'content': 'item 1', 'start': '2012-04-20', 'type':'point'},
            {'id': 1, 'content': 'item 1', 'start': '2012-04-20', 'type':'point'},
            {'id': 2, 'content': 'item 2', 'start': '2012-04-12'},
            {'id': 3, 'content': 'item 3', 'start': '2014-04-18'},
            {'id': 4, 'content': 'item 4', 'start': '2015-04-16', 'end': '2015-04-22'},
            {'id': 5, 'content': 'item 5', 'start': '2016-04-25'},
            {'id': 6, 'content': 'item 6', 'start': '2017-04-27', 'type': 'point'}],
                            'mac-2':[

            {'id': 0, 'content': 'item 1', 'start': '2012-04-20', 'type':'point'},
            {'id': 1, 'content': 'item 1', 'start': '2012-04-20', 'type':'point'},
            {'id': 2, 'content': 'item 2', 'start': '2012-04-12'},
            {'id': 3, 'content': 'item 3', 'start': '2014-04-18'},
            {'id': 4, 'content': 'item 4', 'start': '2014-04-16', 'end': '2014-04-22'},
            {'id': 5, 'content': 'item 5', 'start': '2014-04-25'},
            {'id': 6, 'content': 'item 6', 'start': '2017-04-27', 'type': 'point'}
            ]};
  @Input() nleStatus:Object = {'mac':['Not_started','In_progress', 'Not_started','Approved'],
                              'mac-2':['Completed', 'In_progress','Approved', 'In_progress']};
  @Input() nleColors:Object = {'mac':['#F44336','#F44336','#F44336'],'mac-2':['#F44336','#F44336','#F44336']};
  @Input() Table:Object = {'mac':[{'start_index':0, 'end_index':168, 'status':'Not_Started'}]};
  selectedProject = "All";
  selectedStatus = "All";
  colormap:string[];

  public timelineData:Array<Object> =[
    {
      title:"Step 1",
      icon:'<i class="fa fa-home"></i>',
      content:"Hello World",
      complete:true
    },
    {
      title:"Step 2",
      icon:'<i class="fa fa-home"></i>',
      content:"Following step to complete",
      complete:false
    }
  ];
  constructor(
        private http: HttpClient
    ) {

      this.http.get('http://127.0.0.1:5000/get_projects_names')
            .subscribe(data => {this.projectList = data; this.selectedProject = this.projectList[0]});


      this.http.get('http://127.0.0.1:5000/get_status_names')
            .subscribe(data => {this.statusNames = data['status_name']; this.colormap = data['status_color']; this.selectedStatus = this.statusNames[0]});

      this.generateReport("All","All");

      // DOM element where the Timeline will be attached

    }
  ngAfterContentInit(){

    let container = document.getElementsByClassName('container')[0];
    console.log(container);

    for(let nle of this.nleList){
        let visualisation = document.createElement("div")
        visualisation.setAttribute('id','visualization');
        visualisation.setAttribute('class',nle);
        container.appendChild(visualisation);
        let item = new vis.DataSet(this.nleDate[nle]);
        let timeline = new vis.Timeline(visualisation, item);
    }
      // Create a DataSet (allows two way data-binding)



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
        var data =  {'projectName': this.selectedProject,
          "StatusName": this.selectedStatus};

        this.http.post('http://127.0.0.1:5000/get_report', data)
            .subscribe(data => {
              this.columnsNames = [];
              this.Table =
			  this.nleList = [];
			  this.nleDate = {};
			  this.nleStatus = {};
              for (let colname of data['columnName']){
                this.columnsNames.push(data['columnName'][colname]);
              }
			  for(let key of data['Table']){
			    console.log(key);
			 this.nleList.push(key);
			  this.nleDate[key] = [];
			  this.nleStatus[key] = [];
			  let value = data['Table'][key];
          console.log(value);
			  for(let task of value){
				  this.nleDate[key].push([task['start_index'], task['end_index']]);
				  this.nleStatus[key].push(task['status']);
			  }
			  };

              console.log(this.Table);

            });

    }


}
