export interface MenuItem {
  readonly id: string
  readonly label: string
  readonly disabled?: boolean
  readonly tone?: 'default' | 'destructive'
}

export interface ViewSource {
  readonly id: string
  readonly path: string
}
