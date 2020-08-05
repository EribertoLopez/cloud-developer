import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import { Component } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Card
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import {GoogleMap, withGoogleMap, withScriptjs} from 'react-google-maps'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  latitude: string
  longitude: string
  loadingTodos: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    latitude: '',
    longitude: '',
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  handleLatitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ latitude: event.target.value })
  }

  handleLongitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ longitude: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId != todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done,
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">What destination is on your bucket list?</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Destination',
              onClick: this.onTodoCreate
            }}
            actionPosition="left"
            placeholder="Name"
            onChange={this.handleNameChange}
          />
          <Input
            placeholder="Latitude"
            onChange={this.handleLatitudeChange}
          />
          <Input
            placeholder="Longitude"
            onChange={this.handleLongitudeChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Your Destinations
        </Loader>
      </Grid.Row>
    )
  }

 renderTodosList() {
    return (
      <Card.Group>
        {this.state.todos.map((todo, pos) => {
          const image_src = todo.attachmentUrl
          const lat = ((Number(todo.latitude) < 90) && (Number(todo.latitude) > -90)) ? (Number(todo.latitude)) : (false);
          const lng = ((Number(todo.longitude) < 180) && (Number(todo.longitude) > -180)) ? (Number(todo.longitude)) : (false);

          var map = <div/>
          if (lat && lng) {
            const someLatLng = {lat: lat, lng: lng}
            const googleMapURL = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBpfM-DDuE48DwBeG95flsqEh2AJ9zwPCM'
            const MyGoogleMap = withScriptjs(withGoogleMap(() =>
                <GoogleMap
                    defaultCenter={someLatLng}
                    defaultZoom={8}
                    options={{disableDefaultUI: true}}>
                </GoogleMap>)
             )
            const loadingElement = <div/>
            const containerElement = <div style={{height: '20vh'}}/>
            const mapElement = <div style={{height: '20vh'}}/>
            var map = <MyGoogleMap loadingElement={loadingElement}
                                     containerElement={containerElement}
                                     googleMapURL={googleMapURL}
                                     mapElement={mapElement}/>
          }
          else {
            var map = <div/>
          }

          return (
            <Card>
              {(lat && lng) && <div>{map}</div>}
              <div>
              {todo.attachmentUrl && (<Image src={todo.attachmentUrl} size="medium" wrapped />)}
              </div>
              <Card.Content>
                <Card.Header>{todo.name}</Card.Header>
                {(lat && lng) && <Card.Meta>{lat}, {lng}</Card.Meta>}
                <Card.Description>
                  When are you planning on going to <strong>{todo.name}</strong>
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className='ui two buttons'>
                  <Button basic color='green' onClick={() => this.onEditButtonClick(todo.todoId)}>
                    Upload Picture
                  </Button>
                  <Button basic color='red' onClick={() => this.onTodoDelete(todo.todoId)}>
                    Delete
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )
        })}
      </Card.Group>
    )
   }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
