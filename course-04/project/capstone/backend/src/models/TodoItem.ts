export interface TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  latitude: string
  longitude: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
