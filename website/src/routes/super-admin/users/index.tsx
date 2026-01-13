import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/super-admin/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/super-admin/users/"!</div>
}
