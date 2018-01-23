from . import default
from flask import jsonify
from flask import request
import ftrack_api
import json
import datetime

import random

GLOBAL_START = datetime.datetime.now()
GLOBAL_END = GLOBAL_START + datetime.timedelta(hours=7*24)

def colors(n):
    ret = []
    r = int(random.random() * 256)
    g = int(random.random() * 256)
    b = int(random.random() * 256)
    step = 256 / n
    for i in range(n):
        r += step
        g += step
        b += step
        r = int(r) % 256
        g = int(g) % 256
        b = int(b) % 256
        ret.append((r, g, b))
    return ret


def connect_to_ftrack():
    session = ftrack_api.Session(
        server_url='https://ftrack.stb.ua',
        api_key='0617dce2-9c66-11e7-b2bd-005056852c83',
        api_user='developer'
    )
    return session


def query_projects(session):

    projects = session.query('Project').all()

    projects_name = [i.get('name') for i in projects]
    projects_name.append("All")
    return json.dumps(projects_name)

def query_tasks(session, project_name="All", status_name="All"):

    now = datetime.datetime.now()
    end = now + datetime.timedelta(days=30)
    _now = "{0}-{1}-{2}".format(now.year, now.month, now.day)
    _end = "{0}-{1}-{2}".format(end.year, end.month, end.day)
    if project_name == "All" and status_name == "All":
        tasks = session.query('select id, status.name, start_date, end_date, custom_attributes from Task where custom_attributes any (key is "nle") and end_date >= ' + _now + ' and end_date <' + _end).all()
    elif project_name == "All" and status_name != "All":
        tasks = session.query('select id, status.name, start_date, end_date, custom_attributes from Task where status.name is ' + status_name + ' and custom_attributes any (key is "nle") and end_date >= ' + _now + " and end_date <" + _end).all()
    elif project_name != "All" and status_name == "All":
        tasks = session.query('select id, status.name, start_date, end_date, custom_attributes from Task where project.name is ' + project_name
                              + ' and custom_attributes any (key is "nle") and end_date >= ' + _now + " and end_date <" + _end).all()
    elif project_name != "All" and status_name != "All":
        tasks = session.query('select id, status.name, start_date, end_date, custom_attributes from Task where status.name is ' + status_name + ' and project.name is ' + project_name
                              + ' and custom_attributes any (key is "nle") and end_date >= ' + _now + " and end_date <" + _end).all()
    return tasks

def generate_timestamps():
    """

    :param start_date:
    :param end_date:
    :return:
    """
    now = datetime.datetime.now()
    timelag = 7*24
    date_list = [now + datetime.timedelta(hours=x) for x in range(0, timelag)]
    date_list = [ "{0}-{1}-{2}-{3}".format(x.year, x.month, x.day, x.hour) for x in date_list]
    return date_list




def query_status(session):
    statuses = session.query('Status').all()
    status_name = [i.get('name') for i in statuses]
    status_name.append("All")
    status_color = colors(len(status_name))
    return json.dumps({'status_name': status_name, 'status_color': status_color})

def query_users(session):
    users = session.query('User').all()
    users_name = [i.get('username') for i in users]
    users_name.append("All")
    return json.dumps(users_name)




@default.route('/')
def home():
    return default.send_static_file('index.html')

@default.route('/get_users_names')
def users_names():
    session = connect_to_ftrack()
    users = query_users(session=session)
    return users

@default.route('/get_status_names')
def status_names():
    session = connect_to_ftrack()
    statuses = query_status(session=session)
    return statuses

@default.route('/get_projects_names')
def prj_names():
    session = connect_to_ftrack()
    projects = query_projects(session=session)
    return projects


def get_index(date_list, start_stamp, end_stamp):
    """

    :param date_list:
    :param start_stamp:
    :param end_stamp:
    :return:
    """
    try:
        start_index = date_list.get_index(start_stamp)
    except Exception:
        start_index = 0
    try:
        end_index = date_list.get_index(end_stamp)
    except Exception:
        end_index = len(date_list)

    return start_index, end_index



@default.route('/get_report', methods=['POST'])
def get_report():
    # data in string format and you have to parse into dictionary
    data = request.data
    dataDict = json.loads(data)
    prj_names = dataDict['projectName']
    status_names = dataDict['StatusName']
    date_list = generate_timestamps()
    table = {}
    session = connect_to_ftrack()
    tasks = query_tasks(session=session, project_name=prj_names, status_name=status_names)
    for i in range(0, len(tasks)):
        for nle in tasks[i]['custom_attributes']['nle']:
            try:
                len(table[nle])
            except Exception:
                table[nle] = []
            finally:

                start_index, end_index = get_index(date_list, start_stamp=tasks[i].get('start_date').format('YYYY-MM-DD-HH'), end_stamp=tasks[i].get('end_date').format('YYYY-MM-DD-HH'))
                table[nle].append({'start_index': start_index,
                                   'end_index': end_index,
                                   'start_date':tasks[i].get('start_date').format('YYYY-MM-DD-HH'),
                                   'end_date': tasks[i].get('end_date').format('YYYY-MM-DD-HH'),
                                   'status': tasks[i].get('status').get('name')})

    #nle_list = session.query('CustomAttributeConfiguration where key is nle').all()[1].get('values')
    #for i in range(0, len(nle_list)):
    #    for nle in nle_list[i].get('value'):
    #        if nle not in list(table.keys()):
    #            table[nle] = []


        #except Exception:
        #    tasks[nle] = []
        #finally:
        #    tasks[nle].append(session.query('Task where id is' + i.get('entity_id')))

    #for task in tasks:
    #    #start_date = task.get('start_date')
    #    #end_date = task.get('end_date')
    #    try:
    #        nle = task['custom_attributes']['nle']
    #        if len(nle) == 0:
    #            continue
    #    except KeyError:
    #        continue
    #    else:
    #        for _nle in nle:
    #            time_dict['NLE'].append(_nle)

    return json.dumps({'Table': table, 'columnName': date_list})
#Add routes for project, statuses, users,
#Add function for calendar making

