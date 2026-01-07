import { Separator } from "@/components/ui/separator"
import { IconBrandGithub, IconTerminal2 } from "@tabler/icons-react"
import Link from "next/link"

export default function Footer() {

  return (
    <section className="container mx-auto">
      <div className="space-y-10 px-7">
        <Separator className="mb-0" />
        <div className="flex flex-col sm:flex-row space-y-6 mb-0 space-x-20 pt-6">
          <div className="flex-1/2">
            <p className="pb-2">Twisty Moto</p>
            <p className="text-muted-foreground">Create, share and discover motocycle routes around the world.</p>
          </div>
          <div className="flex flex-col space-y-2">
            <Link className="text-sm hover:text-green-400 w-min text-nowrap" href="community-routes">
              Community Routes
            </Link>
            <Link className="text-sm hover:text-green-400 w-min text-nowrap" href="my-routes">
              My Routes
            </Link>
            <Link className="text-sm hover:text-green-400 w-min text-nowrap" href="route-editor">
              Route Editor
            </Link>
            <Link className="text-sm hover:text-green-400 w-min text-nowrap" href="account">
              Account
            </Link>
          </div>
          <div className="block flex-1 space-y-2">
            <Link className="flex space-x-1 text-sm hover:text-green-400 w-min" target="_blank" href="https://laurenzguevara.com">
              <IconTerminal2 /> <span>Portfolio</span>
            </Link>
            <Link className="flex space-x-1 text-sm hover:text-green-400 w-min" target="_blank" href="https://github.com/Laurenz-Guevara/twisty-moto">
              <IconBrandGithub /> <span>Github</span>
            </Link>
          </div>
        </div>
        <div className="flex justify-between py-6 text-sm text-muted-foreground">
          <p>Twisty Moto</p>
          <p>Built by&nbsp;<Link className="hover:text-green-400" target="_blank" href="https://laurenzguevara.com">Laurenz Guevara</Link></p>
        </div>
      </div>
    </section>
  )
}
